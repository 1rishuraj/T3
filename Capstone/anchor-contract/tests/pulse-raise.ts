import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PulseRaise } from "../target/types/pulse_raise";
import { expect } from "chai";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as solanaStakePool from "@solana/spl-stake-pool";
import wollet from './pvtcreator.json'

async function ensureAtaExists(provider: anchor.AnchorProvider, mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey) {
  const ata = getAssociatedTokenAddressSync(mint, owner, true);
  const info = await provider.connection.getAccountInfo(ata);

  if (!info) {
    const tx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        provider.wallet.publicKey, 
        ata,                       
        owner, 
        mint,                  
      ),
    );
    // Anchor's provider automatically signs with your default wallet!
    await provider.sendAndConfirm(tx);
    console.log(`deployer's JitoATA created: ${ata.toBase58()}\n`);
  }
  return ata;
}
describe("pulse-raise", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.pulseRaise as Program<PulseRaise>;
  //5StMYy1mzsxmVRK7VwKBK13HPEh33exVupCp6ihWhe5g

  //declare accounts: users, pdas, bumps, amounts
  let program_config: anchor.web3.PublicKey;

  let configBump: number;
  const deployer = provider.wallet.publicKey;
  //A5czjgBJ4Wqnexyxy2K2NDhiwz8LqJsV5Wd921tUw9yz
  let deployerjitoATA: anchor.web3.PublicKey;
  let creatorKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wollet));
  let campaignPDA: anchor.web3.PublicKey;

  let jitosolMint: anchor.web3.PublicKey;

  let campaign_jitosol_ata: anchor.web3.PublicKey;
  let title = `Test Campaign Title`;
  let desc = `Test Campaign Desc`;
  let img_uri = `Test Campaign Img URI`;
  let goal = new anchor.BN(25 * 1_000_000_000); //25 SOL
  let campaignBump: number;

  // Jito Stake Pool Address
  const stake_pool = new anchor.web3.PublicKey(
    "JitoY5pcAxWX6iyP2QdFwTznGb8A99PRCUCVVxB46WZ",
  );

  // Stake Pool Program ID
  const jito_stake_pool_program = new anchor.web3.PublicKey(
    "DPoo15wWDqpPJJtS2MUZ49aRxqz5ZaaJCJP4z8bLuib",
  );

  // Variables to reuse in tests
  let stakePoolAccount: solanaStakePool.StakePoolAccount;
  let reserveStake: anchor.web3.PublicKey;
  let managerFeeAccount: anchor.web3.PublicKey;
  let withdrawAuthority: anchor.web3.PublicKey;

  before("load Jito stake pool accounts", async () => {
    // Use the Anchor provider connection
    const connection = provider.connection;

    // Fetch & decode stake pool
    stakePoolAccount = await solanaStakePool.getStakePoolAccount(
      connection as any,
      stake_pool,
    );

    const data = stakePoolAccount.account.data;

    reserveStake = data.reserveStake;
    managerFeeAccount = data.managerFeeAccount;
    jitosolMint = data.poolMint;

    // Derive the withdraw authority PDA
    [withdrawAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
      [stake_pool.toBuffer(), Buffer.from("withdraw")],
      jito_stake_pool_program,
    );

    deployerjitoATA = await ensureAtaExists(
      provider,
      jitosolMint,
      deployer, // The deployer is the owner of this ATA
    );
  });

  it("Is initialized!", async () => {
    /*airdrop
    await provider.connection.requestAirdrop(
      deployer,
      2 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));*/
    //derive PDAs
    [program_config, configBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId,
    );
    // Add your test here.
    const tx = await program.methods
      .initialise()
      .accountsStrict({
        programConfig: program_config,
        deployer: deployer,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("\ntx:", tx);

    const configAccount = await program.account.programConfig.fetch(
      program_config,
    );
    expect(configAccount.initialised).to.equal(true);
    expect(configAccount.campaignCount.toNumber()).to.equal(0); //testing number
    expect(configAccount.platformFee.toNumber()).to.equal(2);
    expect(configAccount.deployer.toBase58()).to.equal(deployer.toBase58());
    //testing pubkey
  });

  it("Is Campaign Created!", async () => {
    const configAccount = await program.account.programConfig.fetch(
      program_config,
    );
    console.log('\ncreator is : ', creatorKeypair.publicKey.toBase58());
    //airdrop
    // await provider.connection.requestAirdrop(
    //   creatorKeypair.publicKey,
    //   1 * anchor.web3.LAMPORTS_PER_SOL,
    // );
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    //derive PDAs

    [campaignPDA, campaignBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("campaign"),
        configAccount.campaignCount.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    //ata
    campaign_jitosol_ata = getAssociatedTokenAddressSync(
      jitosolMint,
      campaignPDA,
      true,
    );
    // Add your test here.
    const tx = await program.methods
      .campaignCreation(title, desc, img_uri, goal)
      .accountsStrict({
        campaign: campaignPDA,
        programConfig: program_config,
        creator: creatorKeypair.publicKey,
        jitosolMint,
        campaignJitosolAta: campaign_jitosol_ata,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorKeypair])
      .rpc();
    console.log("\ntx:", tx);

    const campaignAccount = await program.account.campaign.fetch(campaignPDA);
    expect(campaignAccount.cid.toNumber()).to.equal(0);
    expect(campaignAccount.creator.toBase58()).to.equal(
      creatorKeypair.publicKey.toBase58(),
    ); //testing no
    expect(campaignAccount.title).to.equal(title);
    expect(campaignAccount.desc).to.equal(desc);
    expect(campaignAccount.imageUrl).to.equal(img_uri);
    expect(campaignAccount.goal.toNumber()).to.equal(goal.toNumber());
    expect(campaignAccount.amtRaised.toNumber()).to.equal(0);
    expect(campaignAccount.donations.toNumber()).to.equal(0);
    expect(campaignAccount.withdrawals.toNumber()).to.equal(0);
    // Convert BN to number and compare in milliseconds
    const timestampMillis = campaignAccount.timestamp.toNumber() * 1000;
    expect(timestampMillis).to.be.closeTo(Date.now(), 10000); //close to past 10 sec
    expect(campaignAccount.bump).to.equal(campaignBump);
    expect(campaignAccount.jitosolAta.toBase58()).to.equal(
      campaign_jitosol_ata.toBase58(),
    );
    expect(campaignAccount.active).to.equal(true);
  });

  it("is Campaign Updating", async () => {
    // const configAccount = await program.account.programConfig.fetch(
    //   program_config,
    // );
    // Add your test here.
    let cid = new anchor.BN(0);
    title = `Updated Test Campaign Title`;
    desc = `Updated Test Campaign Desc`;
    img_uri = `Updated Test Campaign Img URI`;
    goal = new anchor.BN(24 * 1_000_000_000); //24 SOL
    const tx = await program.methods
      .campaignUpdation(cid, title, desc, img_uri, goal)
      .accountsStrict({
        campaign: campaignPDA,
        creator: creatorKeypair.publicKey,
      })
      .signers([creatorKeypair])
      .rpc();
    console.log("\ntx:", tx);

    const campaignAccount = await program.account.campaign.fetch(campaignPDA);
    expect(campaignAccount.title).to.equal(title);
    expect(campaignAccount.desc).to.equal(desc);
    expect(campaignAccount.imageUrl).to.equal(img_uri);
    expect(campaignAccount.goal.toNumber()).to.equal(goal.toNumber());
  });

  it("is Campaign Deleting", async () => {
    //creating campaign
    const configAccount = await program.account.programConfig.fetch(
      program_config,
    );
    let campaignPDAs: anchor.web3.PublicKey;

    let titles = `Test Campaign Title`;
    let descs = `Test Campaign Desc`;
    let img_uris = `Test Campaign Img URI`;
    let goals = new anchor.BN(25 * 1_000_000_000); //25 SOL
    let campaignBumps: number;
    [campaignPDAs, campaignBumps] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("campaign"),
          configAccount.campaignCount.toArrayLike(Buffer, "le", 8),
        ],
        program.programId,
      );
    let campaign_jitosol_atas = getAssociatedTokenAddressSync(
      jitosolMint,
      campaignPDAs,
      true,
    );
    const txx = await program.methods
      .campaignCreation(titles, descs, img_uris, goals)
      .accountsStrict({
        campaign: campaignPDAs,
        programConfig: program_config,
        creator: creatorKeypair.publicKey,
        jitosolMint,
        campaignJitosolAta: campaign_jitosol_atas,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorKeypair])
      .rpc();
    // Add your test here.
    let cidd = new anchor.BN(1);
    const tx = await program.methods
      .campaignDeletion(cidd)
      .accountsStrict({
        campaign: campaignPDAs,
        creator: creatorKeypair.publicKey,
      })
      .signers([creatorKeypair])
      .rpc();
    console.log("\ntx: ", tx);

    const campaignAccount = await program.account.campaign.fetch(campaignPDAs);
    expect(campaignAccount.active).to.equal(false);
  });

  it("is Fee Updating", async () => {
    // Add your test here.
    let fees = new anchor.BN(7);
    const tx = await program.methods
      .feeUpdation(fees)
      .accountsStrict({
        deployer,
        config: program_config,
      })
      .rpc();
    console.log("\ntx:", tx);
    console.log(`\nUpdated fee % as: ${fees}`);
    const configAccount = await program.account.programConfig.fetch(
      program_config,
    );
    expect(configAccount.platformFee.toNumber()).to.equal(fees.toNumber());
  });

  it("is Donation occurring", async () => {
    // Add your test here.
    const campaignAccount = await program.account.campaign.fetch(campaignPDA);
    let donorKeypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wollet));
    /*airdrop
    await provider.connection.requestAirdrop(
      donorKeypair.publicKey,
      3 * anchor.web3.LAMPORTS_PER_SOL,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));*/
    let txn: anchor.web3.PublicKey;
    let txnBump: number;
    let cidd = new anchor.BN(0);
    let amt = 1_500_000_000;
    [txn, txnBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("donate"),
        donorKeypair.publicKey.toBuffer(),
        cidd.toArrayLike(Buffer, "le", 8),
        campaignAccount.donations.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    const balBefore = await provider.connection.getBalance(
      donorKeypair.publicKey,
    );
    console.log(`\nDonor before donation has ${balBefore} lamports\n`);
    const campBefore = (
      await provider.connection.getTokenAccountBalance(campaign_jitosol_ata)
    ).value.uiAmount;
    console.log(
      `Campaign jitsol ATA before donating has: ${campBefore} Jito\n`,
    );
    deployerjitoATA = getAssociatedTokenAddressSync(
      jitosolMint,
      deployer,
      true,
    );

    const tx = await program.methods
      .donate(cidd, new anchor.BN(amt))
      .accountsStrict({
        txn,
        campaign: campaignPDA,
        // Stake Pool Program ID
        jitoStakePoolProgram: jito_stake_pool_program,
        // Jito Stake Pool Address
        stakePool: stake_pool,
        stakePoolWithdrawAuthority: withdrawAuthority,
        reserveStake,
        donor: donorKeypair.publicKey,
        campaignJitosolAta: campaign_jitosol_ata,
        managerFeeAccount,
        deployer,
        deployerJitosolAta: deployerjitoATA,
        jitosolMint: jitosolMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        config: program_config,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([donorKeypair])
      .rpc();
    console.log("tx:", tx);
    const balAfter = await provider.connection.getBalance(
      donorKeypair.publicKey,
    );
    // but generally close to it.
    console.log(
      `\nDonor after (1.5 SOL donation + 5k lamports fee + Txn-PDA rent exempt) has ${balAfter} lamports\n`,
    );
    const campAfter = (
      await provider.connection.getTokenAccountBalance(campaign_jitosol_ata)
    ).value.uiAmount;
    console.log(`Campaign Jitosol ATA after donation has ${campAfter} Jito`);
    const campaignAcc = await program.account.campaign.fetch(campaignPDA);
    const txnAcc = await program.account.donationRecord.fetch(txn);
    expect(campaignAcc.donations.toNumber()).to.equal(1);
    expect(campaignAcc.amtRaised.toNumber()).to.equal(amt);
    expect(txnAcc.cid.toNumber()).to.equal(cidd.toNumber());
    expect(txnAcc.donor.toBase58()).to.equal(donorKeypair.publicKey.toBase58());
    expect(txnAcc.amountSol.toNumber()).to.equal(amt);

    //fresh snapshot of the Stake Pool state
    const currentPoolState = await solanaStakePool.getStakePoolAccount(
      provider.connection as any,
      stake_pool,
    );
    const totalPoolLamports = Number(
      currentPoolState.account.data.totalLamports.toString(),
    );
    const poolTokenSupply = Number(
      currentPoolState.account.data.poolTokenSupply.toString(),
    );

    // lamports in pool per 1 JitoSOL token
    const lamportsPerJito = totalPoolLamports / poolTokenSupply;
    let expected_jito_lamports = amt / lamportsPerJito;
    //(divide by 10^9)
    let expected_ui_amt = expected_jito_lamports / 1_000_000_000;

    expect(campAfter).to.be.closeTo(expected_ui_amt, 0.0001);
  });

  it("is Withdrawal occurring", async () => {
    const configAccount = await program.account.programConfig.fetch(
      program_config,
    );
    const campaignAccount = await program.account.campaign.fetch(campaignPDA);

    let cidd = new anchor.BN(0);
    let Amt_jito = 500_000_000; // 0.5 JitoSOL

    // Calculate expected fee split
    const platformFeePercent = configAccount.platformFee.toNumber();
    const expectedPlatformFee = Math.floor(
      (Amt_jito * platformFeePercent) / 100,
    );
    const expectedWithdrawerAmt = Amt_jito - expectedPlatformFee;

    const [txn, txnBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdraw"),
        creatorKeypair.publicKey.toBuffer(),
        cidd.toArrayLike(Buffer, "le", 8),
        campaignAccount.withdrawals.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const deployerjitoATA = getAssociatedTokenAddressSync(
      jitosolMint,
      deployer,
      true,
    );
    const creatorjitoATA = getAssociatedTokenAddressSync(
      jitosolMint,
      creatorKeypair.publicKey,
      true,
    );

    // "Before" balances
    let depbalBefore = 0;
    try {
      const depInfo = await provider.connection.getTokenAccountBalance(
        deployerjitoATA,
      );
      depbalBefore = Number(depInfo.value.amount);
    } catch (e) {}

    let balBefore = 0;
    try {
      const withdrawerInfo = await provider.connection.getTokenAccountBalance(
        creatorjitoATA,
      );
      balBefore = Number(withdrawerInfo.value.amount);
    } catch (e) {}

    let campBefore = Number(
      (await provider.connection.getTokenAccountBalance(campaign_jitosol_ata))
        .value.amount,
    );
    console.log(
      `\nBefore withdrawal, Deployer's Jito ATA has: ${depbalBefore} Jito\n`,
    );
    console.log(
      `Before withdrawal, Creator's Jito ATA has: ${balBefore} Jito\n`,
    );
    console.log(
      `Before withdrawal, Campaign's Jito ATA has: ${campBefore} Jito\n`,
    );

    const tx = await program.methods
      .withdraw(cidd, new anchor.BN(Amt_jito))
      .accountsStrict({
        deployer: provider.wallet.publicKey,
        config: program_config,
        withdrawer: creatorKeypair.publicKey,
        txn,
        campaign: campaignPDA,
        campaignJitosolAta: campaign_jitosol_ata,
        jitosolMint: jitosolMint,
        withdrawerJitosolAta: creatorjitoATA,
        deployerJitosolAta: deployerjitoATA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creatorKeypair])
      .rpc();

    console.log("tx:", tx);

    // "After" balances
    let depbalAfter = Number(
      (await provider.connection.getTokenAccountBalance(deployerjitoATA)).value
        .amount,
    );
    let balAfter = Number(
      (await provider.connection.getTokenAccountBalance(creatorjitoATA)).value
        .amount,
    );
    let campAfter = Number(
      (await provider.connection.getTokenAccountBalance(campaign_jitosol_ata))
        .value.amount,
    );
    console.log(
      `\nAfter withdrawal, Deployer's Jito ATA has: ${depbalAfter} Jito (Fee % : ${platformFeePercent})\n`,
    );
    console.log(
      `After withdrawal, Creator's Jito ATA has: ${balAfter} Jito ( Rest )\n`,
    );
    console.log(`After withdrawal, Campaign's Jito ATA has: ${campAfter} Jito`);
    expect(campAfter).to.equal(campBefore - Amt_jito);
    expect(depbalAfter).to.equal(depbalBefore + expectedPlatformFee);
    expect(balAfter).to.equal(balBefore + expectedWithdrawerAmt);

    const campaignAccAfter = await program.account.campaign.fetch(campaignPDA);
    expect(campaignAccAfter.withdrawals.toNumber()).to.equal(
      campaignAccount.withdrawals.toNumber() + 1,
    );

    const txnAcc = await program.account.withdrawalRecord.fetch(txn);
    expect(txnAcc.cid.toNumber()).to.equal(cidd.toNumber());
    expect(txnAcc.withdrawer.toBase58()).to.equal(
      creatorKeypair.publicKey.toBase58(),
    );
    expect(txnAcc.amountJito.toNumber()).to.equal(Amt_jito);
  });
});
