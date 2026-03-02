# PulseRaise 🚀

**The New Pulse of Web3 Crowdfunding**

PulseRaise is a Solana-based fundraising protocol that lets creators and DAOs launch transparent, on-chain campaigns. By leveraging Program Derived Addresses (PDAs), it removes traditional intermediaries to offer permissionless global donations and creator-controlled withdrawals.

Unlike standard crowdfunding, PulseRaise features native yield generation. Through seamless integration with the Jito Stake Pool🪙, donated SOL is automatically converted into JitoSOL Liquid Staking Tokens (LSTs)—allowing campaigns to passively earn staking yield and maximize capital efficiency while active.

Deployed on Devnet [HERE](https://pulseraise.vercel.app/)

https://github.com/user-attachments/assets/5ff847d7-8d83-4f28-b6b5-5996747c294b

https://github.com/user-attachments/assets/99f94dd5-e380-4c54-8a09-8355928f1d05








## ✨ Key Features

* **On-Chain Campaign Infrastructure:** Campaign creation, donation tracking, and withdrawals are implemented entirely on-chain using PDAs and Solana's native transfer system.


* **Permissionless Global Donations:** Anyone with a Solana wallet can donate to an active campaign without approval or intermediaries.


* **Yield-Backed Treasury (Jito Integration):** Donated SOL is seamlessly routed through the Jito Stake Pool, converting to JitoSOL in the campaign's Associated Token Account (ATA) to generate liquid staking yield while the campaign is active.

* **Deterministic, Transparent Fees:** Platform fees are enforced directly in the smart contract and transparently split and routed to the platform address at the time of withdrawal.


* **Creator Control:** Only the campaign creator has the authority to update metadata, close the campaign, or withdraw available funds.

* **Deployer Control:** Only the platform(contract) deployer has the authority to update the Platform fee.


## 🏗 Architecture & Protocol Workflow

The protocol follows a strict, trustless lifecycle enforced by Anchor smart contracts:

1. **Protocol Initialization:** The protocol initializes a global on-chain state (`Program State PDA`) that defines the platform fee rate and the fee recipient (deployer) address.


2. **Campaign Creation:** A user creates a campaign, generating a unique `Campaign PDA` derived from a campaign ID counter. Metadata (title, description, image URI) and the funding goal are stored immutably on-chain .


3. **Donation Flow:** 
    * A donor selects an active campaign and donates SOL.
  
  
    * The program fetches the Campaign PDA and verifies it is active.
  
  
    * The SOL is swapped for JitoSOL and stored directly in the campaign's ATA, immediately updating the publicly visible on-chain balance.




4. **Withdrawal Flow:** 
    * The creator initiates a withdrawal.


    * The program verifies the signer is the campaign creator and checks the available balance.


    * The platform fee is calculated deterministically based on the global state.


    * The net JitoSOL is transferred to the creator's wallet, and the fee is routed to the platform's address.




5. **Campaign Management:** Creators can update campaign descriptions and goals, or delete/close the campaign to prevent further donations .

## ☑️ Basic Skeleton
![architecure_diagram_page-0001](https://github.com/user-attachments/assets/34d01d36-9a8c-4b49-9507-3bc1d715b385)
![architecure_diagram_page-0002](https://github.com/user-attachments/assets/ad595942-2fc5-4875-adea-ff3ca8e9118f)
![architecure_diagram_page-0003](https://github.com/user-attachments/assets/2b49ef69-c02c-44eb-9b39-90b11d9e896e)
![architecure_diagram_page-0004](https://github.com/user-attachments/assets/00676ceb-e059-415c-b51e-4df26af09df1)
![architecure_diagram_page-0005](https://github.com/user-attachments/assets/8698ae35-e359-4753-a608-7cf81133c3b0)

## 🛠 Tech Stack

**Frontend:**

* Next.js / React
* Redux Toolkit (Global State Management)
* Tailwind CSS
* `@solana/wallet-adapter-react` (Wallet Integration)
* `@solana/web3.js` & `@solana/spl-token`

**Backend / Smart Contracts:**

* Rust
* Anchor Framework
* `@solana/spl-stake-pool` (Jito integration)
* Localnet Testing via Surfpool (Network Forking)

## 🧪 Testing

The smart contracts have been thoroughly tested on the Solana Devnet, successfully passing the full suite of lifecycle checks:

* ✅ Global State Initialization
* ✅ Campaign Creation & PDA Derivation
* ✅ Campaign Metadata Updating
* ✅ Campaign Deletion
* ✅ Admin Fee Updating (1% - 15%)
* ✅ Donations (with JitoSOL conversion)
* ✅ Withdrawals (with accurate JitoSOL fee splits)

<img width="1106" height="922" alt="image" src="https://github.com/user-attachments/assets/8694290f-88fc-4d10-ad5a-f0deb5219823" />


---

Made with 💖 by Rishu Raj (https://github.com/1rishuraj)
