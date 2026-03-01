use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use crate::{errors::ErrorCode, state::{Campaign, ProgramConfig}};

#[derive(Accounts)]
pub struct CampaignCreation<'info>{

     #[account(
        init,
        payer=creator,
        space=Campaign::DISCRIMINATOR.len() + Campaign::INIT_SPACE,
        seeds=[b"campaign", &program_config.campaign_count.to_le_bytes()],
        bump
    )]
    pub campaign:Account<'info,Campaign>,

    #[account(mut)]
    pub program_config:Account<'info,ProgramConfig>,

    #[account(mut)]
    pub creator:Signer<'info>,

    pub jitosol_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = jitosol_mint,
        associated_token::authority = campaign,
        associated_token::token_program = token_program
    )]
    pub campaign_jitosol_ata: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program:Program<'info,System>
}

impl<'info> CampaignCreation<'info>{
    pub fn creating_campaign(
        &mut self,
        title:String,
        desc:String,
        img_uri:String,
        goal:u64,
        bumps:&CampaignCreationBumps
    )->Result<()>{
        require!(title.len()<=64, ErrorCode::TitleTooLong);
        require!(desc.len()<=512, ErrorCode::DescriptionTooLong);
        require!(img_uri.len()<=256, ErrorCode::ImageUrlTooLong);
        require!(goal>=1000_000_000, ErrorCode::InvalidGoalAmount);
        self.campaign.set_inner(Campaign {
            cid: self.program_config.campaign_count,
            creator:self.creator.key(),
            title,
            desc,
            image_url:img_uri,
            goal,
            amt_raised:0,
            donations:0,
            withdrawals: 0,
            timestamp:Clock::get()?.unix_timestamp as u64,
            active: true,
            bump:bumps.campaign,
            jitosol_ata: self.campaign_jitosol_ata.key()
        });
        self.program_config.campaign_count=self.program_config.campaign_count.saturating_add(1);
        Ok(())
    }
}