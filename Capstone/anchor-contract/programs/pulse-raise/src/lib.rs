pub mod errors;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("5StMYy1mzsxmVRK7VwKBK13HPEh33exVupCp6ihWhe5g");

#[program]
pub mod pulse_raise {
    use super::*;

    pub fn initialise(ctx: Context<Initialise>) -> Result<()> {
        ctx.accounts.init_config()
    }

    pub fn campaign_creation(
        ctx: Context<CampaignCreation>,
        title: String,
        desc: String,
        img_uri: String,
        goal: u64,
    ) -> Result<()> {
        ctx.accounts
            .creating_campaign(title, desc, img_uri, goal, &ctx.bumps)
    }

    pub fn campaign_updation(
        ctx: Context<CampaignUpdation>,
        cid: u64,
        title: String,
        desc: String,
        img_uri: String,
        goal: u64,
    ) -> Result<()> {
        ctx.accounts
            .updating_campaign(cid, title, desc, img_uri, goal)
    }

    pub fn campaign_deletion(ctx: Context<CampaignDeletion>, cid: u64) -> Result<()> {
        ctx.accounts.deleting_campaign(cid)
    }

    pub fn donate(ctx: Context<Donation>, cid: u64, amount_sol: u64) -> Result<()> {
        ctx.accounts.lets_donate(cid, amount_sol)
    }

    pub fn withdraw(ctx: Context<Withdrawal>, cid: u64, amount_jito: u64) -> Result<()> {
        ctx.accounts.lets_withdraw(cid, amount_jito)
    }

    pub fn fee_updation(ctx: Context<FeeUpdation>, fee: u64) -> Result<()> {
        ctx.accounts.updating_fee(fee)
    }
}
