import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVoting } from "../target/types/anchor_voting";
import { expect } from "chai";
import {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("Quadratic Voting DAO", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.anchorVoting as Program<AnchorVoting>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  const GovName = "Test Gov";

  const [GovPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("gov"), provider.wallet.publicKey.toBuffer(), Buffer.from(GovName)],
    program.programId
  );

  const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("proposal"),
      GovPda.toBuffer(),
      new anchor.BN(0).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  let mint: anchor.web3.PublicKey;
  let voterTokenAccount: anchor.web3.PublicKey;

  it("creates governance", async () => {
    await program.methods
      .init(GovName)
      .accountsPartial({
        creator: provider.wallet.publicKey,
        govAccount: GovPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const gov = await program.account.governance.fetch(GovPda);
    expect(gov.name).to.equal(GovName);
    expect(gov.authority.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    expect(gov.proposalAccount.toNumber()).to.equal(0);
  });

  it("creates proposal", async () => {
    const metadata = "Should we build a new feature?";

    await program.methods
      .initProposal(metadata)
      .accountsPartial({
        creator: provider.wallet.publicKey,
        govAccount: GovPda,
        proposal: proposalPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.metadata).to.equal(metadata);
    expect(proposal.authority.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    expect(proposal.yesVoteCount.toNumber()).to.equal(0);
    expect(proposal.noVoteCount.toNumber()).to.equal(0);

    // Gov proposal count should have incremented
    const gov = await program.account.governance.fetch(GovPda);
    expect(gov.proposalAccount.toNumber()).to.equal(1);
  });

  it("votes yes", async () => {
    const tokenAmount = 100;

    mint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      provider.wallet.publicKey,
      null,
      0 
    );

    voterTokenAccount = await createAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mint,
      provider.wallet.publicKey
    );

    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mint,
      voterTokenAccount,
      provider.wallet.publicKey,
      tokenAmount
    );

    const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote"),
        provider.wallet.publicKey.toBuffer(),
        proposalPda.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .castVote(1) // 1 = yes
      .accountsPartial({
        voter: provider.wallet.publicKey,
        proposal: proposalPda,
        voteAccount: votePda,
        creatorTokenAccount: voterTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const vote = await program.account.vote.fetch(votePda);
    expect(vote.voteType).to.equal(1);
    expect(vote.authority.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
    expect(vote.voteCredits.toNumber()).to.equal(10);

    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.yesVoteCount.toNumber()).to.equal(10);
    expect(proposal.noVoteCount.toNumber()).to.equal(0);
  });

  it("votes no from another voter", async () => {
    const newVoter = anchor.web3.Keypair.generate();
    const tokenAmount = 25;

    const sig = await provider.connection.requestAirdrop(
      newVoter.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    const newVoterTokenAccount = await createAccount(
      provider.connection,
      newVoter,
      mint,
      newVoter.publicKey
    );

    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      mint,
      newVoterTokenAccount,
      provider.wallet.publicKey,
      tokenAmount
    );

    const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vote"),
        newVoter.publicKey.toBuffer(),
        proposalPda.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .castVote(0) 
      .accountsPartial({
        voter: newVoter.publicKey,
        proposal: proposalPda,
        voteAccount: votePda,
        creatorTokenAccount: newVoterTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([newVoter])
      .rpc();

    const vote = await program.account.vote.fetch(votePda);
    expect(vote.voteType).to.equal(0);
    expect(vote.authority.toBase58()).to.equal(newVoter.publicKey.toBase58());
    expect(vote.voteCredits.toNumber()).to.equal(5);

    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.yesVoteCount.toNumber()).to.equal(10);
    expect(proposal.noVoteCount.toNumber()).to.equal(5);
  });

  it("closes proposal", async () => {
    await program.methods
      .closeProposal()
      .accountsPartial({
        authority: provider.wallet.publicKey,
        proposal: proposalPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

  it("validates results", async () => {
    const proposal = await program.account.proposal.fetch(proposalPda);
    expect(proposal.yesVoteCount.toNumber()).to.equal(10);
    expect(proposal.noVoteCount.toNumber()).to.equal(5);
  });

  it("confirms governance state", async () => {
    const gov = await program.account.governance.fetch(GovPda);
    expect(gov.proposalAccount.toNumber()).to.equal(1);
  });
});