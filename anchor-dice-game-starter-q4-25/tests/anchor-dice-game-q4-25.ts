import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorDiceGameQ425 } from "../target/types/anchor_dice_game_q4_25";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Ed25519Program,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { expect } from "chai";

describe("anchor-dice-game-q4-25", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .anchorDiceGameQ425 as Program<AnchorDiceGameQ425>;
  const connection = provider.connection;

  const house = Keypair.generate();
  const player = Keypair.generate();

  let vault: PublicKey;

  // Helper: derive bet PDA from seed
  const getBetPda = (seed: anchor.BN): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("bet"),
        vault.toBuffer(),
        seed.toArrayLike(Buffer, "le", 16),
      ],
      program.programId
    );
  };

  // Helper: serialize bet data to match Bet::to_slice()
  const serializeBet = (betAccount: any): Buffer => {
    return Buffer.concat([
      betAccount.player.toBuffer(),                     // pubkey     32 bytes
      betAccount.seed.toArrayLike(Buffer, "le", 16),    // seed       16 bytes
      betAccount.slot.toArrayLike(Buffer, "le", 8),     // slot       8 bytes
      betAccount.amount.toArrayLike(Buffer, "le", 8),   // amount     8 bytes
      Buffer.from([betAccount.roll, betAccount.bump]),  // roll+bump  2 bytes
    ]);
  };

  before(async () => {
    [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), house.publicKey.toBuffer()],
      program.programId
    );

    // Provision test wallets with SOL tokens to pay for transaction fees and place bets
    let latestBlockhash = await connection.getLatestBlockhash();
    const houseSig = await connection.requestAirdrop(house.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: houseSig, ...latestBlockhash });

    latestBlockhash = await connection.getLatestBlockhash();
    const playerSig = await connection.requestAirdrop(player.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction({ signature: playerSig, ...latestBlockhash });
  });

  // ========== INITIALIZE VAULT TESTS ==========

  describe("Initialize - Vault Setup", () => {
    it("Should initialize vault with initial house funding", async () => {
      const amount = new anchor.BN(1 * LAMPORTS_PER_SOL);

      await program.methods
        .initialize(amount)
        .accountsPartial({
          house: house.publicKey,
          vault,
          systemProgram: SystemProgram.programId,
        })
        .signers([house])
        .rpc();

      const vaultBalance = await connection.getBalance(vault);
      expect(vaultBalance).to.equal(1 * LAMPORTS_PER_SOL);
    });
  });

  // ========== PLACE BET TESTS ==========

  describe("Place Bet - Player Wagering", () => {
    it("Should allow player to place a valid bet with seed and roll", async () => {
      const seed = new anchor.BN(1);
      const roll = 50;
      const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      const vaultBefore = await connection.getBalance(vault);

      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      // Verify the bet account was created with correct parameters
      const betAccount = await program.account.bet.fetch(betPda);
      expect(betAccount.player.toBase58()).to.equal(
        player.publicKey.toBase58()
      );
      expect(betAccount.seed.toString()).to.equal(seed.toString());
      expect(betAccount.roll).to.equal(roll);
      expect(betAccount.amount.toString()).to.equal(amount.toString());

      // Verify vault received the deposit
      const vaultAfter = await connection.getBalance(vault);
      expect(vaultAfter - vaultBefore).to.equal(0.1 * LAMPORTS_PER_SOL);
    });

    it("Should handle multiple bets with different seeds and roll values", async () => {
      const seed = new anchor.BN(2);
      const roll = 25;
      const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      const betAccount = await program.account.bet.fetch(betPda);
      expect(betAccount.roll).to.equal(25);
      expect(betAccount.amount.toString()).to.equal(amount.toString());
    });
  });

  // ========== RESOLVE BET TESTS ==========
  // Tests the house's ability to resolve bets using Ed25519 cryptographic signatures

  describe("Resolve Bet - House Settlement", () => {
    it("Should resolve bet when house provides valid Ed25519 signature over bet data", async () => {
      const seed = new anchor.BN(10);
      const roll = 50;
      const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      // Step 1: Place the bet to create a bet account
      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      // Step 2: Fetch bet account and serialize it to match contract expectations
      const betAccount = await program.account.bet.fetch(betPda);
      const message = serializeBet(betAccount);

      // Step 3: Create Ed25519 cryptographic signature using house's private key
      // The signature proves the house authorized this specific bet resolution
      const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
        privateKey: house.secretKey,
        message,
      });

      // Step 4: Extract the 64-byte Ed25519 signature from the instruction data
      const ixData = Buffer.from(ed25519Ix.data);
      const sigOffset = ixData.readUInt16LE(2);
      const sig = Buffer.from(ixData.subarray(sigOffset, sigOffset + 64));

      const playerBefore = await connection.getBalance(player.publicKey);
      const vaultBefore = await connection.getBalance(vault);

      // Step 5: Build the resolve_bet instruction that validates the signature and settles the bet
      const resolveBetIx = await program.methods
        .resolveBet(sig)
        .accountsPartial({
          house: house.publicKey,
          player: player.publicKey,
          vault,
          bet: betPda,
          instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Step 6: Combine Ed25519 precompile instruction with resolve_bet instruction in single transaction
      // The program will verify the signature against the Ed25519 instruction sysvar
      const tx = new Transaction().add(ed25519Ix).add(resolveBetIx);
      tx.feePayer = house.publicKey;

      await sendAndConfirmTransaction(connection, tx, [house], {
        skipPreflight: true,
        commitment: "confirmed",
      });

      // Verify the bet account was closed as proof of successful resolution
      const betAccountInfo = await connection.getAccountInfo(betPda);
      expect(betAccountInfo).to.be.null;

      // Analyze balance changes to determine if player won or lost the bet
      const playerAfter = await connection.getBalance(player.publicKey);
      const vaultAfter = await connection.getBalance(vault);
      const playerDelta = (playerAfter - playerBefore) / LAMPORTS_PER_SOL;
      const vaultDelta = (vaultAfter - vaultBefore) / LAMPORTS_PER_SOL;

      if (playerDelta > 0) {
        console.log(`    -> Player WON, received ${playerDelta} SOL`);
      } else {
        console.log(`    -> Player LOST, vault kept the bet`);
      }
      console.log(
        `    -> Vault balance change: ${vaultDelta} SOL`
      );
    });

    it("Should resolve bet successfully with high roll value (96)", async () => {
      const seed = new anchor.BN(11);
      const roll = 96;
      const amount = new anchor.BN(0.05 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      const betAccount = await program.account.bet.fetch(betPda);
      const message = serializeBet(betAccount);

      const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
        privateKey: house.secretKey,
        message,
      });

      const ixData = Buffer.from(ed25519Ix.data);
      const sigOffset = ixData.readUInt16LE(2);
      const sig = Buffer.from(ixData.subarray(sigOffset, sigOffset + 64));

      const resolveBetIx = await program.methods
        .resolveBet(sig)
        .accountsPartial({
          house: house.publicKey,
          player: player.publicKey,
          vault,
          bet: betPda,
          instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const tx = new Transaction().add(ed25519Ix).add(resolveBetIx);
      tx.feePayer = house.publicKey;

      await sendAndConfirmTransaction(connection, tx, [house], {
        skipPreflight: true,
        commitment: "confirmed",
      });

      const betAccountInfo = await connection.getAccountInfo(betPda);
      expect(betAccountInfo).to.be.null;
    });

    it("Should resolve bet successfully with low roll value (2)", async () => {
      const seed = new anchor.BN(12);
      const roll = 2;
      const amount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      const betAccount = await program.account.bet.fetch(betPda);
      const message = serializeBet(betAccount);

      const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
        privateKey: house.secretKey,
        message,
      });

      const ixData = Buffer.from(ed25519Ix.data);
      const sigOffset = ixData.readUInt16LE(2);
      const sig = Buffer.from(ixData.subarray(sigOffset, sigOffset + 64));

      const resolveBetIx = await program.methods
        .resolveBet(sig)
        .accountsPartial({
          house: house.publicKey,
          player: player.publicKey,
          vault,
          bet: betPda,
          instructionSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const tx = new Transaction().add(ed25519Ix).add(resolveBetIx);
      tx.feePayer = house.publicKey;

      await sendAndConfirmTransaction(connection, tx, [house], {
        skipPreflight: true,
        commitment: "confirmed",
      });

      const betAccountInfo = await connection.getAccountInfo(betPda);
      expect(betAccountInfo).to.be.null;
    });
  });

  // –––––Refund Bet––––––––––––––––––––––––––––––––––––––

  describe("Refund Bet - Timeout Protection", () => {
    it("Should reject refund when called before timeout window expires", async () => {
      const seed = new anchor.BN(20);
      const roll = 50;
      const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL);
      const [betPda] = getBetPda(seed);

      // Place the bet
      await program.methods
        .placeBet(seed, roll, amount)
        .accountsPartial({
          player: player.publicKey,
          house: house.publicKey,
          vault,
          bet: betPda,
          systemProgram: SystemProgram.programId,
        })
        .signers([player])
        .rpc();

      // Attempt to refund immediately without waiting for timeout - should fail with TimeoutNotReached error
      try {
        await program.methods
          .refundBet()
          .accountsPartial({
            player: player.publicKey,
            house: house.publicKey,
            vault,
            bet: betPda,
            systemProgram: SystemProgram.programId,
          })
          .signers([player])
          .rpc();

        expect.fail("Should have thrown TimeoutNotReached error");
      } catch (err) {
        expect(err.toString()).to.contain("TimeoutNotReached");
      }
    });
  });
});