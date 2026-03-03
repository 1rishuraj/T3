# Turbin3 Q126 Builder

## [solana-starter](./solana-starter)
A broader Solana starter workspace with both Rust and TypeScript tracks, including prerequisite/wallet utilities plus scripts for SPL tokens, NFTs, metadata, and vault interactions, making it a practical hands-on toolkit for common Solana development flows.

## [anchor-vault-starter-q4-25](./anchor-vault-starter-q4-25)
An Anchor vault starter where users initialize a PDA-backed SOL vault, deposit funds, withdraw via PDA-signed transfers, and close the vault/state accounts, demonstrating core account-constraint and CPI transfer patterns on Solana.

## [anchor-escrow-starter-q4-25](./anchor-escrow-starter-q4-25)
An Anchor escrow token-swap project where a maker creates an escrow and deposits one token type, a taker fulfills the trade by depositing the requested token, and either completion or refund closes vault/accounts securely through PDA-based account handling.

## [anchor-nft-staking-starter-q4-25](./anchor-nft-staking-starter-q4-25)
An Anchor NFT staking starter project that supports staking configuration, user initialization, collection/NFT creation, staking and unstaking flows, and reward claiming logic, integrating Solana/Anchor patterns with Metaplex Core and token tooling.

## [anchor-amm-starter-q4-25](./anchor-amm-starter-q4-25)
An Anchor-based Solana automated market maker (AMM) starter program where users can initialize a liquidity pool, deposit and withdraw liquidity, and perform token swaps, with Rust on-chain logic and TypeScript tooling/tests around the program workflow.

## [anchor-mplxcore-starter-q4-25](./anchor-mplxcore-starter-q4-25)
This folder contains an Anchor + Metaplex Core NFT starter focused on collection and NFT lifecycle operations, including creator whitelisting, collection creation, minting, freezing/thawing, and metadata updates for assets managed by the on-chain program.

## [anchor_quadratic-voting](./anchor_quadratic-voting)
Anchor voting program that supports initialization, proposal creation, vote casting, and proposal closure, serving as a governance-style starter that can be extended toward quadratic or weighted voting mechanics.

## [anchor-dice-game-starter-q4-25](./anchor-dice-game-starter-q4-25)
An Anchor dice-game starter that implements a betting flow on Solana, including game initialization, placing bets, resolving bets with signature verification, and refunding unresolved bets, backed by the standard Anchor Rust + TypeScript test setup.

## [Capstone: PulseRaise](./Capstone)
PulseRaise is a Solana-based fundraising protocol that lets creators and DAOs launch transparent, on-chain campaigns. By leveraging Program Derived Addresses (PDAs), it removes traditional intermediaries to offer permissionless global donations and creator-controlled withdrawals.

Unlike standard crowdfunding, PulseRaise features native yield generation. Through seamless integration with the Jito Stake Pool🪙, donated SOL is automatically converted into JitoSOL Liquid Staking Tokens (LSTs)—allowing campaigns to passively earn staking yield and maximize capital efficiency while active.
