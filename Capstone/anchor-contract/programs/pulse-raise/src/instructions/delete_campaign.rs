use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, state::{Campaign}};

#[derive(Accounts)]
#[instruction(cid:u64)]
pub struct CampaignDeletion<'info>{

     #[account(
        mut,
        seeds=[b"campaign", &cid.to_le_bytes()],
        bump,
        constraint = campaign.cid == cid
    )]
    pub campaign:Account<'info,Campaign>,

    #[account(
        mut,
        constraint = creator.key() == campaign.creator.key()
    )]
    pub creator:Signer<'info>,
}

impl<'info> CampaignDeletion<'info>{
    pub fn deleting_campaign(
        &mut self,
        _cid:u64,
    )->Result<()>{
        require!(self.campaign.active,ErrorCode::InactiveCampaign);
        self.campaign.active=false;
        Ok(())
    }
}