use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProgramConfig{
    pub initialised:bool,
    pub campaign_count:u64,
    pub platform_fee:u64,
    pub deployer:Pubkey
}