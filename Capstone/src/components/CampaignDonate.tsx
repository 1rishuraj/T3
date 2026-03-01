import React, { FormEvent, useState } from 'react'
import Link from 'next/link'
import { FaDollarSign, FaDonate, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Campaign } from '@/utils/interfaces'
import { toast } from 'react-toastify'
import { useWallet } from '@solana/wallet-adapter-react'
import { CampaignDonation, fetchAllDonations, fetchCampaignDetails, usePulseRaiseProgram } from '@/services/blockchain'
import { useDispatch } from 'react-redux'
import { setDelModal, setWithdrawModal } from '@/redux/Global/Slices'

const CampaignDonate: React.FC<{ campaign: Campaign; pda: string }> = ({
  campaign,
  pda,
}) => {
  const [amount, setAmount] = useState('')
  const program = usePulseRaiseProgram()
  const { publicKey } = useWallet();
  const dispatch = useDispatch()
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Number(amount) + campaign.amtRaised > campaign.goal) {
      return toast.warn('Amount exceeds campaign goal')
    }

    if (!publicKey) return toast.warn('Please connect wallet')

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx: any = await CampaignDonation(
            program!,
            publicKey!,
            Number(amount),
            pda!,
          )

          setAmount('')
          await fetchCampaignDetails(program!, pda,dispatch)
          await fetchAllDonations(program!, pda,dispatch)

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
    <div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaDonate className="text-green-600" />
          Donate
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="donationAmount"
            className="block text-gray-700 font-semibold mb-2"
          >
            Amount (SOL)
          </label>
          <input
            type="text"
            name="donationAmount"
            placeholder={`1 SOL (${(
              campaign.goal - campaign.amtRaised
            ).toFixed(2)} SOL remaining)`}
            value={amount}
            onChange={(e) => {
              const value = e.target.value
              if (/^\d*\.?\d{0,2}$/.test(value)) {
                setAmount(value)
              }
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            min="1"
            required
          />
          <button
            type="submit"
            disabled={
              !amount ||
              !campaign.active ||
              campaign.amtRaised >= campaign.goal
            }
            className={`mt-4 w-full bg-green-600 hover:bg-green-700 ${!amount ||
                !campaign.active ||
                campaign.amtRaised >= campaign.goal
                ? 'opacity-50 cursor-not-allowed'
                : ''
              } text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2`}
          >
            <FaDonate />
            Donate Now
          </button>
        </form>

         {publicKey && campaign.creator === publicKey.toBase58() && (
          <div className="mt-6 flex flex-wrap gap-2 md:flex-nowrap md:gap-0">
            <Link
              href={`/campaign/edit/${pda}`}
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
              font-semibold py-2 px-4 flex-1 md:rounded-l-lg flex items-center justify-center
              border border-green-600 hover:border-transparent"
            >
              <FaEdit />
              Edit
            </Link>
            {campaign.active && (
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white
              font-semibold py-2 px-4 flex-1 flex items-center justify-center"
                onClick={() => dispatch(setDelModal('scale-100'))}
              >
                <FaTrashAlt />
                Delete
              </button>
            )}

            <button
              className="bg-transparent hover:bg-green-600 text-green-600 hover:text-white
              font-semibold py-2 px-4 flex-1 md:rounded-r-lg flex items-center justify-center
              border border-green-600 hover:border-transparent"
              onClick={() => dispatch(setWithdrawModal('scale-100'))}
            >
              <FaDollarSign />
              Payout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDonate
