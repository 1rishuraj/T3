import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAmm } from "../target/types/anchor_amm";
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

describe("anchor-amm", () => {
  // Initialize Anchor provider and get the program instance
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = provider.wallet.payer;
  const program = anchor.workspace.anchorAmm as Program<AnchorAmm>;
  const connection = provider.connection;

  // Token mints
  let mint_x: PublicKey;
  let mint_y: PublicKey;
  let lp_mint: PublicKey;

  // AMM configuration
  let seeds: anchor.BN;
  let config_addr: PublicKey;
  let config_bump: number;

  // Payer token accounts
  let payer_x_ata: PublicKey;
  let payer_y_ata: PublicKey;
  let payer_lp_ata: PublicKey;

  // Vault token accounts (owned by config PDA)
  let vault_x: PublicKey;
  let vault_y: PublicKey;

  // Setup phase: Create tokens and derive PDAs before running tests
  before("Tokens and PDA setup", async () => {
    
    seeds = new anchor.BN(1111);
    [config_addr, config_bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config"), seeds.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    console.log("Config Address", config_addr);

    mint_x = await createMint(connection, payer, payer.publicKey, null, 6);
    console.log("Mint X created: ", mint_x);

    mint_y = await createMint(connection, payer, payer.publicKey, null, 6);
    console.log("Mint Y created: ", mint_y);

    [lp_mint] = PublicKey.findProgramAddressSync(
      [Buffer.from("lp"), config_addr.toBuffer()],
      program.programId
    );
    console.log("lp_mint created: ", lp_mint);

    payer_x_ata = await createAssociatedTokenAccount(
      connection,
      payer,
      mint_x,
      payer.publicKey
    );
    console.log("Created payer ata for mint X ", payer_x_ata);
    mintTo(connection, payer, mint_x, payer_x_ata, payer, 100000);
    console.log("Minted 100000 mint_x to payer_x_ata");

    payer_y_ata = await createAssociatedTokenAccount(
      connection,
      payer,
      mint_y,
      payer.publicKey
    );
    console.log("Created payer ata for mint Y ", payer_y_ata);
    mintTo(connection, payer, mint_y, payer_y_ata, payer, 100000);
    console.log("Minted 100000 mint_y to payer_y_ata");

    payer_lp_ata = getAssociatedTokenAddressSync(lp_mint, payer.publicKey);

    vault_x = getAssociatedTokenAddressSync(mint_x, config_addr, true);
    console.log("Vault X: ", vault_x);
    vault_y = getAssociatedTokenAddressSync(mint_y, config_addr, true);
    console.log("Vault Y: ", vault_y);
  });


  // Initialize the AMM pool with two tokens and a fee tier
  it("should initialize the AMM pool with config", async () => {
    const tx = await program.methods
      .initialize(seeds, 300, payer.publicKey)
      .accounts({
        initializer: payer.publicKey,
        mintX: mint_x,
        mintY: mint_y,
      })
      .rpc();
    console.log("Initialized config", tx);
  });

  // User deposits liquidity into the pool and receives LP tokens
  it("should allow user to deposit liquidity and receive LP tokens", async () => {
    const tx = await program.methods
      .deposit(new anchor.BN(6000), new anchor.BN(10000), new anchor.BN(50000))
      .accounts({
        user: payer.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        mintLp: lp_mint,
        config: config_addr,
        vaultX: vault_x,
        vaultY: vault_y,
      })
      .rpc();
    console.log("Deposit complete", tx);
    let user_lp_mint_ata = await getAccount(connection, payer_lp_ata);
    console.log("", user_lp_mint_ata.amount);
    const get_vault_x = await getAccount(connection, vault_x);
    const get_vault_y = await getAccount(connection, vault_y);
    console.log(
      `Vault X : ${get_vault_x.amount}, Vault Y: ${get_vault_y.amount}`
    );
  });

  // User swaps one token for another using the constant product formula
  it("should execute a token swap maintaining constant product", async () => {
    const tx = await program.methods
      .swap(true, new anchor.BN(1000), new anchor.BN(4422))
      .accounts({
        swapper: payer.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config_addr,
        vaultX: vault_x,
        vaultY: vault_y,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Swap complete! ", tx);
    const get_vault_x = await getAccount(connection, vault_x);
    const get_vault_y = await getAccount(connection, vault_y);
    console.log(
      `Vault X : ${get_vault_x.amount}, Vault Y: ${get_vault_y.amount}`
    );
  });

  // User withdraws liquidity from the pool by burning LP tokens
  it("should allow user to withdraw liquidity by burning LP tokens", async () => {
    const tx = await program.methods
      .withdraw(new anchor.BN(5000), new anchor.BN(9166), new anchor.BN(37981))
      .accounts({
        withdrawer: payer.publicKey,
        mintX: mint_x,
        mintY: mint_y,
        config: config_addr,
        vaultX: vault_x,
        vaultY: vault_y,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("Withdraw Complete! ", tx);
    const get_vault_x = await getAccount(connection, vault_x);
    const get_vault_y = await getAccount(connection, vault_y);
    console.log(
      `Vault X : ${get_vault_x.amount}, Vault Y: ${get_vault_y.amount}`
    );
  });
});