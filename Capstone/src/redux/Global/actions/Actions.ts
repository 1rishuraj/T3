import {
  Campaign,
  GlobalState,
  ProgramConfig,
  WithdrawalRecord,
  DonationRecord
} from '@/utils/interfaces'
import { PayloadAction } from '@reduxjs/toolkit'

export const actions = {
  setCampaign: (state: GlobalState, action: PayloadAction<Campaign>) => {
    state.campaign = action.payload
  },
  setDonations: (state: GlobalState, action: PayloadAction<DonationRecord[]>) => {
    state.donations = action.payload
  },
  setWithdrawls: (state: GlobalState, action: PayloadAction<WithdrawalRecord[]>) => {
    state.withdrawals = action.payload
  },
  setStates: (state: GlobalState, action: PayloadAction<ProgramConfig>) => {
    state.programState = action.payload
  },
  setDelModal: (state: GlobalState, action: PayloadAction<string>) => {
    state.delModal = action.payload
  },
  setWithdrawModal: (state: GlobalState, action: PayloadAction<string>) => {
    state.withdrawModal = action.payload
  },
}
