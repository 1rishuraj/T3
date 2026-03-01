use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, state::{Campaign}};

#[derive(Accounts)]
#[instruction(cid:u64)]
pub struct CampaignUpdation<'info>{

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

impl<'info> CampaignUpdation<'info>{
    pub fn updating_campaign(
        &mut self,
        _cid:u64,
        title:String,
        desc:String,
        img_uri:String,
        goal:u64
    )->Result<()>{
        require!(title.len()<=64, ErrorCode::TitleTooLong);
        require!(desc.len()<=512, ErrorCode::DescriptionTooLong);
        require!(img_uri.len()<=256, ErrorCode::ImageUrlTooLong);
        require!(goal>=1000_000_000, ErrorCode::InvalidGoalAmount);
        self.campaign.title = title;
        self.campaign.desc = desc;
        self.campaign.image_url = img_uri;
        self.campaign.goal = goal;
        Ok(())
    }
}