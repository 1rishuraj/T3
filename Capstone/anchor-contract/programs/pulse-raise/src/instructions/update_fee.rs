use anchor_lang::prelude::*;

use crate::{errors::ErrorCode,state::ProgramConfig};

#[derive(Accounts)]
pub struct FeeUpdation<'info>{
    #[account(mut)]
    pub deployer:Signer<'info>, 
    //it cant be Unchecked Account, although Not every instruction requires a Signer, but this one needs as anyone could pass the deployer's address and fee updates without deployer's sign by pvt key of her/his wallet

    #[account(
        mut,
        seeds=[b"config"],
        bump,
        constraint = config.deployer.key()==deployer.key() @ErrorCode::Unauthorized
    )]
    pub config:Account<'info, ProgramConfig>
}
impl<'info> FeeUpdation<'info>{
    pub fn updating_fee(&mut self, fee:u64)->Result<()>{
        require!(matches!(fee, 1..=15), ErrorCode::InvalidPlatformFee);
        self.config.platform_fee=fee;
        Ok(())
    }
}