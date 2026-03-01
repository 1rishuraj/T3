import { feeUpdation, fetchProgramState, usePulseRaiseProgram } from '@/services/blockchain'
import { ProgramConfig } from '@/utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { useState } from 'react'
import { FaDonate } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const PlatformSettings: React.FC<{ programState: ProgramConfig }> = ({
  programState,
}) => {
  const [percent, setPercent] = useState('')
  const { publicKey} = useWallet()
  const dispatch = useDispatch()
  const program = usePulseRaiseProgram()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!percent) return
    if (!publicKey) return toast.warn('Please connect wallet')

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx: any = await feeUpdation(
            program!,
            publicKey!,
            Number(percent)
          )

          setPercent('')
          await fetchProgramState(program!,dispatch)

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
          Update Service Fee
        </h2>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="donationAmount"
            className="block text-gray-700 font-semibold mb-2"
          >
            Percentage range is (1 - 15%)
          </label>
          <input
            type="text"
            name="percent"
            value={percent}
            onChange={(e) => {
              const value = e.target.value
              if (/^([1-9]|1[0-5])?$/.test(value)) {
                setPercent(value)
              }
            }}
            placeholder={`Current Fee (${programState.platformFee}%)`}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            required
            min={1}
            max={15}
          />
          <button
            type="submit"
            className={`mt-4 w-full bg-green-600 hover:bg-green-700 ${
              !percent ? 'opacity-50 cursor-not-allowed' : ''
            } text-white font-semibold py-2 px-4 rounded-lg flex items-center
              justify-center gap-2`}
          >
            Update Fee
          </button>
        </form>
      </div>
    </div>
  )
}

export default PlatformSettings
