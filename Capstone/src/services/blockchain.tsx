import { AnchorProvider, Program, } from '@coral-xyz/anchor'
import { PulseRaise } from '../../anchor-contract/target/types/pulse_raise'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import idl from '../../anchor-contract/target/idl/pulse_raise.json';
import { Connection, PublicKey, SystemProgram, TransactionSignature } from '@solana/web3.js';
import * as solanaStakePool from "@solana/spl-stake-pool";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from 'bn.js';
import { Campaign, DonationRecord, ProgramConfig, WithdrawalRecord } from '@/utils/interfaces';
import { setCampaign, setDonations, setStates, setWithdrawls } from '@/redux/Global/Slices';
//connect wallet + connection for signing contract

export const usePulseRaiseProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    // If wallet isn't connected yet, return null
    if (!wallet) return null;

    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    return new Program<PulseRaise>(idl as any, provider);
  }, [connection, wallet]);

  return program;
}

//export JITO constants : -
// Jito Stake Pool Address
export const stake_pool = new PublicKey(
  "JitoY5pcAxWX6iyP2QdFwTznGb8A99PRCUCVVxB46WZ",
);

// Stake Pool Program ID
export const jito_stake_pool_program = new PublicKey(
  "DPoo15wWDqpPJJtS2MUZ49aRxqz5ZaaJCJP4z8bLuib",
);


//Create campaign
export const createCampaign = async (
  program: Program<PulseRaise>,
  creatorPubkey: PublicKey,
  title: string,
  description: string,
  image_url: string,
  goal: number // Make sure this is passed in as lamports (e.g., 25 * 10^9)
): Promise<TransactionSignature> => {
  try {
    const connection = (program.provider as AnchorProvider).connection;//getting connection from 'program' argument

    // 1. Derive the global Config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    // 2. Fetch the config state to get the current campaign count
    const configAccount = await program.account.programConfig.fetch(configPda);
    const campaignCount = configAccount.campaignCount;

    // 3. Derive the new Campaign PDA using the fetched count
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), campaignCount.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const stakePoolAccount = await solanaStakePool.getStakePoolAccount(
      connection,
      stake_pool,
    );
    const JITOSOL_MINT = stakePoolAccount.account.data.poolMint;
    // 4. Derive the Campaign's JitoSOL ATA (allowOwnerOffCurve = true)
    const campaignJitosolAta = getAssociatedTokenAddressSync(
      JITOSOL_MINT,
      campaignPda,
      true
    );

    // 5. Convert goal to an Anchor BigNumber
    const goalBN = new BN(goal * 1_000_000_000);

    // 6. Build and send the transaction
    const txSignature = await program.methods
      .campaignCreation(title, description, image_url, goalBN)
      .accountsStrict({
        campaign: campaignPda,
        programConfig: configPda,
        creator: creatorPubkey,
        jitosolMint: JITOSOL_MINT,
        campaignJitosolAta: campaignJitosolAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      // No .signers() needed here; the wallet adapter handles it!
      .rpc();

    console.log("Campaign created successfully! Signature:", txSignature);
    return txSignature;

  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};

//Update campaign
export const updateCampaign = async (
  program: Program<PulseRaise>,
  creatorPubkey: PublicKey,
  pda: string,
  title: string,
  description: string,
  image_url: string,
  goal: number // Make sure this is passed in as lamports (e.g., 25 * 10^9)
): Promise<TransactionSignature> => {
  try {
    //  Convert to an Anchor BigNumber
    const goalBN = new BN(goal * 1_000_000_000);
    const campaignPDA = await program.account.campaign.fetch(pda)
    const cidd = new BN(campaignPDA.cid);
    //  Derive the new Campaign PDA using the fetched count
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), cidd.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const txSignature = await program.methods
      .campaignUpdation(cidd, title, description, image_url, goalBN)
      .accountsStrict({
        campaign: campaignPda,
        creator: creatorPubkey,
      })
      // No .signers() needed here; the wallet adapter handles it!
      .rpc();

    console.log("Campaign updated successfully! Signature:", txSignature);
    return txSignature;
  }
  catch (error) {
    console.error("Error updating campaign:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};

//Delete campaign
export const deleteCampaign = async (
  program: Program<PulseRaise>,
  creatorPubkey: PublicKey,
  pda: string,
): Promise<TransactionSignature> => {
  try {
    //  Convert to an Anchor BigNumber
    const campaignPDA = await program.account.campaign.fetch(pda)
    const cidd = new BN(campaignPDA.cid);
    //  Derive the new Campaign PDA using the fetched count
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), cidd.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const txSignature = await program.methods
      .campaignDeletion(cidd)
      .accountsStrict({
        campaign: campaignPda,
        creator: creatorPubkey,
      })
      // No .signers() needed here; the wallet adapter handles it!
      .rpc();

    console.log("Campaign deleted successfully! Signature:", txSignature);
    return txSignature;
  }
  catch (error) {
    console.error("Error deleting campaign:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};


//Update fee
export const feeUpdation = async (
  program: Program<PulseRaise>,
  publicKey: PublicKey,
  feepercent: number,
): Promise<TransactionSignature> => {
  try {
    // 1. Derive the global Config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    // 2. Fetch the config state to get the current campaign count
    const fees = new BN(feepercent);
    const txSignature = await program.methods
      .feeUpdation(fees)
      .accountsStrict({
        deployer: publicKey,
        config: configPda,
      })
      // No .signers() needed here; the wallet adapter handles it!
      .rpc();

    console.log("Platform Fee updated successfully! Signature:", txSignature);
    return txSignature;
  }
  catch (error) {
    console.error("Error updating fee:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};

async function checkDeployerAtaExists(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const ata = getAssociatedTokenAddressSync(mint, owner, true);
  const info = await connection.getAccountInfo(ata);

  if (!info) {
    // Throwing an error stops the code from continuing!
    throw new Error("Platform setup incomplete: Deployer JitoSOL ATA is missing. Please contact support.");
  }

  return ata;
}

//Donate in campaign
export const CampaignDonation = async (
  program: Program<PulseRaise>,
  donorPubkey: PublicKey,
  amt: number,
  pda: string
): Promise<TransactionSignature> => {
  try {
    const connection = (program.provider as AnchorProvider).connection;
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    const configAccount = await program.account.programConfig.fetch(configPda);
    const deployerAccount = configAccount.deployer;
    const campaignPDA = await program.account.campaign.fetch(pda)
    // 5. Convert  to an Anchor BigNumber
    const amtBN = new BN(amt * 1_000_000_000);
    const cidd = new BN(campaignPDA.cid);

    const stakePoolAccount = await solanaStakePool.getStakePoolAccount(
      connection,
      stake_pool,
    );
    const data = stakePoolAccount.account.data;
    const JITOSOL_MINT = data.poolMint;
    const reserveStake = data.reserveStake;
    const managerFeeAccount = data.managerFeeAccount;

    const [withdrawAuthority] = PublicKey.findProgramAddressSync(
      [stake_pool.toBuffer(), Buffer.from("withdraw")],
      jito_stake_pool_program,
    );

    const deployerjitoATA = await checkDeployerAtaExists(
      connection,
      JITOSOL_MINT,
      deployerAccount, // The deployer is the owner of this ATA
    );
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), cidd.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const campAccount = await program.account.campaign.fetch(campaignPda);
    const [txn, txnBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("donate"),
        donorPubkey.toBuffer(),
        cidd.toArrayLike(Buffer, "le", 8),
        campAccount.donations.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    // 6. Build and send the transaction
    const txSignature = await program.methods
      .donate(cidd, amtBN)
      .accountsStrict({
        txn,
        campaign: campaignPda,
        jitoStakePoolProgram: jito_stake_pool_program,
        // Jito Stake Pool Address
        stakePool: stake_pool,
        stakePoolWithdrawAuthority: withdrawAuthority,
        reserveStake,
        donor: donorPubkey,
        campaignJitosolAta: campAccount.jitosolAta,
        managerFeeAccount,
        deployer: deployerAccount,
        deployerJitosolAta: deployerjitoATA,
        jitosolMint: JITOSOL_MINT,
        tokenProgram: TOKEN_PROGRAM_ID,
        config: configPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();


    console.log("Campaign donated successfully! Signature:", txSignature);
    return txSignature;

  } catch (error) {
    console.error("Error donating campaign:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};

//Witdraw from campaign
export const CampaignWithdrawal = async (
  program: Program<PulseRaise>,
  creator: PublicKey,
  pda: string,
  amt_jito: number
): Promise<TransactionSignature> => {
  try {
    const connection = (program.provider as AnchorProvider).connection;

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    const configAccount = await program.account.programConfig.fetch(configPda);
    const deployerAccount = configAccount.deployer;

    // 5. Convert  to an Anchor BigNumber
    const AMOUNT = new BN(amt_jito * 1_000_000_000);
    const campaignPDA = await program.account.campaign.fetch(pda)
    const cidd = new BN(campaignPDA.cid);

    const stakePoolAccount = await solanaStakePool.getStakePoolAccount(
      connection,
      stake_pool,
    );
    const data = stakePoolAccount.account.data;
    const JITOSOL_MINT = data.poolMint;

    const deployerjitoATA = await checkDeployerAtaExists(
      connection,
      JITOSOL_MINT,
      deployerAccount, // The deployer is the owner of this ATA
    );
    const [campaignPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("campaign"), cidd.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
    const campAccount = await program.account.campaign.fetch(campaignPda);
    const [txn, txnBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdraw"),
        creator.toBuffer(),
        cidd.toArrayLike(Buffer, "le", 8),
        campAccount.withdrawals.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );

    const creatorjitoATA = getAssociatedTokenAddressSync(
      JITOSOL_MINT,
      creator, true,
    );
    // 6. Build and send the transaction
    const txSignature = await program.methods
      .withdraw(cidd, AMOUNT)
      .accountsStrict({
        deployer: deployerAccount,
        config: configPda,
        withdrawer: creator,
        txn,
        campaign: campaignPda,
        campaignJitosolAta: campAccount.jitosolAta, jitosolMint: JITOSOL_MINT,
        withdrawerJitosolAta: creatorjitoATA,
        deployerJitosolAta: deployerjitoATA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();


    console.log("Campaign withdrawn successfully! Signature:", txSignature);
    return txSignature;

  } catch (error) {
    console.error("Error withdrawing campaign:", error);
    throw error; // Re-throw so your UI component can show a toast/alert
  }
};

//Redux Basics must be known
export const fetchActiveCampaigns = async (
  program: Program<PulseRaise>
): Promise<Campaign[]> => {
  // Add this guard clause!
  if (!program) return [];
  const campaigns = await program.account.campaign.all()
  const activeCampaigns = campaigns.filter((c) => c.account.active)
  return serializedCampaigns(activeCampaigns)
}

export const fetchUserCampaigns = async (
  program: Program<PulseRaise>,
  publicKey: PublicKey
): Promise<Campaign[]> => {
  if (!program) return [];
  const campaigns = await program.account.campaign.all()
  const useCampaigns = campaigns.filter((c) => {
    return c.account.creator.toBase58() == publicKey.toBase58()
  })
  return serializedCampaigns(useCampaigns)
}

//fetching from solana rpc and changing variable data-type wherever needed before sending to redux store from where frontend gets it globally
export const fetchCampaignDetails = async (
  program: Program<PulseRaise>,
  pda: string,
  dispatch: Function
): Promise<Campaign | null> => {

  // Now you can safely return null!
  if (!program) {
    console.warn("wallet not connected");
    return null;
  }
  const campaign = await program.account.campaign.fetch(pda)
  const serialized: Campaign = {
    
    publicKey: pda,
    cid: campaign.cid.toNumber(),
    creator: campaign.creator.toBase58(),
    title: campaign.title,       // Explicitly add
    desc: campaign.desc,         // Explicitly add
    imageUrl: campaign.imageUrl, // Explicitly add
    active: campaign.active,     // Explicitly add
    goal: campaign.goal.toNumber() / 1e9,
    amtRaised: campaign.amtRaised.toNumber() / 1e9,
    timestamp: campaign.timestamp.toNumber() * 1000,
    donations: campaign.donations.toNumber(),
    withdrawals: campaign.withdrawals.toNumber(),
    bump: campaign.bump,
    jitosolATA: campaign.jitosolAta.toBase58()
  }

  dispatch(setCampaign(serialized))
  return serialized
}

export const fetchAllDonations = async (
  program: Program<PulseRaise>,
  pda: string,
  dispatch: Function
): Promise<DonationRecord[]> => {

  if (!program) return [];
  const campaign = await program.account.campaign.fetch(pda)
  const transactions = await program.account.donationRecord.all()

  const donations = transactions.filter((tx) => {
    return tx.account.cid.eq(campaign.cid)
  })

  dispatch(setDonations(serializedDTxs(donations)))
  return serializedDTxs(donations)
}

export const fetchAllWithdrawals = async (
  program: Program<PulseRaise>,
  pda: string,
  dispatch: Function
): Promise<WithdrawalRecord[]> => {

  if (!program) return [];
  const campaign = await program.account.campaign.fetch(pda)
  const transactions = await program.account.withdrawalRecord.all()

  const withdrawals = transactions.filter((tx) => {
    return tx.account.cid.eq(campaign.cid)
  })

  dispatch(setWithdrawls(serializedWTxs(withdrawals)))
  return serializedWTxs(withdrawals)
}

export const fetchProgramState = async (
  program: Program<PulseRaise>,
  dispatch: Function
): Promise<ProgramConfig | null> => {
  if (!program) {
    console.warn("wallet not connected");
    return null;
  }
  const [programStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program.programId
  )

  const programState = await program.account.programConfig.fetch(programStatePda)

  const serialized: ProgramConfig = {
    ...programState,
    campaignCount: programState.campaignCount.toNumber(),
    platformFee: programState.platformFee.toNumber(),
    deployer: programState.deployer.toBase58(),
  }

  dispatch(setStates(serialized))
  return serialized
}

const serializedCampaigns = (campaigns: any[]): Campaign[] => {
  return campaigns.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    cid: c.account.cid.toNumber(),
    creator: c.account.creator.toBase58(),
    goal: c.account.goal.toNumber() / 1e9,
    amtRaised: c.account.amtRaised.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
    donations: c.account.donations.toNumber(),
    withdrawals: c.account.withdrawals.toNumber(),
    jitosolAta: c.account.jitosolAta.toBase58(),
  }))
}

const serializedDTxs = (transactions: any[]): DonationRecord[] => {
  return transactions.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    donor: c.account.donor.toBase58(),
    cid: c.account.cid.toNumber(),
    amountSol: c.account.amountSol.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
  }))
}

const serializedWTxs = (transactions: any[]): WithdrawalRecord[] => {
  return transactions.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(),
    withdrawer: c.account.withdrawer.toBase58(),
    cid: c.account.cid.toNumber(),
    amountJito: c.account.amountJito.toNumber() / 1e9,
    timestamp: c.account.timestamp.toNumber() * 1000,
  }))
}
