export interface Campaign {
  publicKey: string
  cid: number
  creator: string
  title: string
  desc: string
  imageUrl: string
  goal: number
  amtRaised: number
  timestamp: number
  donations: number
  withdrawals: number
  bump: number
  jitosolATA:string
  active: boolean
}

export interface DonationRecord {
  publicKey: string
  donor: string
  cid: number
  amountSol: number
  timestamp: number
}

export interface WithdrawalRecord {
  publicKey: string
  withdrawer: string
  cid: number
  amountJito: number
  timestamp: number
}

export interface ProgramConfig {
  initialised: boolean
  campaignCount: number
  platformFee: number
  deployer: string
}

export interface GlobalState {
  campaign: Campaign | null
  donations: DonationRecord[]
  withdrawals: WithdrawalRecord[]
  programState: ProgramConfig | null
  delModal: string
  withdrawModal: string
}

export interface RootState {
  globalStates: GlobalState
}
