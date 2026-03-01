import { createSlice } from '@reduxjs/toolkit'
import { states } from './states/States'
import { actions } from './actions/Actions'

export const slices = createSlice({
  name: 'global',
  initialState: states,
  reducers: actions,
})

export const {setCampaign, setDelModal, setDonations, setStates, setWithdrawModal,setWithdrawls} = slices.actions
export default slices.reducer
