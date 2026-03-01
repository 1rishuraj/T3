import { setWithdrawModal } from '@/redux/Global/Slices'
import { CampaignWithdrawal, fetchAllWithdrawals, fetchCampaignDetails, usePulseRaiseProgram } from '@/services/blockchain'
import { Campaign, RootState } from '@/utils/interfaces'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const WithdrawModal = ({
  campaign,
  pda,
}: {
  campaign: Campaign
  pda: string
}) => {
  const [amount, setAmount] = useState('')
  const { withdrawModal } = useSelector(
    (states: RootState) => states.globalStates
  )
  const dispatch = useDispatch()
  const { publicKey } = useWallet()
  const program = usePulseRaiseProgram()
  const { connection } = useConnection();
  const [jitoBalance, setJitoBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!campaign || !campaign.jitosolATA) return;

      try {
        const ataPubkey = new PublicKey(campaign.jitosolATA);
        // 3. AWAIT the promise
        const response = await connection.getTokenAccountBalance(ataPubkey);
        // 4. Extract the human-readable amount (e.g., 1.5 instead of 1500000000)
        setJitoBalance(response.value.uiAmount);
        console.log(response.value.uiAmount)
      } catch (error) {
        console.error("Could not fetch JitoSOL balance:", error);
        setJitoBalance(0); // Fallback to 0 if the account is empty or uninitialized
      }
    };

    fetchBalance();
  }, [connection, campaign]); // Re-run if the campaign changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !publicKey || !amount) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx: any = await CampaignWithdrawal(
            program!,
            publicKey!,
            pda,
            Number(amount)
          )

          setAmount('')
          await fetchCampaignDetails(program!, pda, dispatch)
          await fetchAllWithdrawals(program!, pda, dispatch)

          dispatch(setWithdrawModal('scale-0'))
          console.log(tx)
          resolve(tx)
        } catch (error) {
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
      bg-black bg-opacity-50 transform z-[3000] transition-transform duration-300 ${withdrawModal}`}
    >
      <div className="bg-white shadow-lg shadow-slate-900 rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-row justify-between items-center">
            <p className="block text-sm font-semibold text-gray-700">
              Creator Withdrawal
            </p>
            <button
              type="button"
              className="border-0 bg-transparent focus:outline-none"
              onClick={() => dispatch(setWithdrawModal('scale-0'))}
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div>
            <input
              type="text"
              name="donationAmount"
              placeholder={`1 JitoSOL (${jitoBalance?.toFixed(
                2
              )} JitoSOL available)`}
              value={amount}
              onChange={(e) => {
                const value = e.target.value
                if (/^\d*\.?\d{0,2}$/.test(value)) {
                  setAmount(value)
                }
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              min="1"
              max={jitoBalance?.toFixed(2)}
              required
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={!amount}
              className={`w-full bg-green-600 hover:bg-green-700 ${!amount ? 'opacity-50 cursor-not-allowed' : ''
                } text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2`}
            >
              Withdraw
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WithdrawModal
