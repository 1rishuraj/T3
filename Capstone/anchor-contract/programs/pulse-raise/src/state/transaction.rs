use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DonationRecord {
    pub donor: Pubkey,
    pub cid: u64,
    pub amount_sol: u64,
    pub timestamp: u64,
}

#[account]
#[derive(InitSpace)]
pub struct WithdrawalRecord {
    pub withdrawer: Pubkey,
    pub cid: u64,
    pub amount_jito: u64,
    pub timestamp: u64,
}
