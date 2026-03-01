use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Campaign{
    pub cid:u64,
    pub creator:Pubkey,
    #[max_len(64)]
    pub title:String,
    #[max_len(512)]
    pub desc:String,
    #[max_len(256)]
    pub image_url:String,
    pub goal:u64,
    pub amt_raised:u64, // we will add only donations, so even if creator withdraws and then someone donates, the balance can be different but the amt_raised = sum of all donations
    pub donations:u64,
    pub withdrawals:u64,
    pub timestamp:u64,
    pub active:bool,
    pub bump:u8,
    pub jitosol_ata: Pubkey,
}

