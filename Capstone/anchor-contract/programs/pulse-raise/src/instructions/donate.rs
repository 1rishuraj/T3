use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use spl_stake_pool::{instruction::deposit_sol, solana_program::program::invoke};

use crate::{
    errors::ErrorCode,
    state::{Campaign, ProgramConfig, DonationRecord},
};

#[derive(Accounts)]
#[instruction(cid:u64)]
pub struct Donation<'info> {
    #[account(mut)]
    pub donor: Signer<'info>,
    #[account(
        init,
        payer=donor,
        space=DonationRecord::DISCRIMINATOR.len()+DonationRecord::INIT_SPACE,
        seeds=[
            b"donate",
            donor.key().as_ref(),//many donor can participate
            cid.to_le_bytes().as_ref(),//same donor donate on many campaign
            &campaign.donations.to_le_bytes()//same donor donate on same campaign many times
        ],
        bump
    )]
    pub txn: Account<'info, DonationRecord>,
    #[account(
        mut,
        seeds=[b"campaign", &cid.to_le_bytes()],
        bump,
        constraint = campaign.cid == cid @ErrorCode::NotFound,
        constraint = campaign.active @ErrorCode::InactiveCampaign,
        constraint = campaign.amt_raised<campaign.goal @ErrorCode::CampaignGoalAccomplished
    )]
    pub campaign: Account<'info, Campaign>,

    /// CHECK: stake pool program id
    pub jito_stake_pool_program: UncheckedAccount<'info>,
    //DPoo15wWDqpPJJtS2MUZ49aRxqz5ZaaJCJP4z8bLuib

    /// CHECK: Jito stake pool address
    #[account(mut)]
    pub stake_pool: UncheckedAccount<'info>,
    //JitoY5pcAxWX6iyP2QdFwTznGb8A99PRCUCVVxB46WZ
    // When new SOL enters the reserve, the Stake Pool program updates the internal data of this account to log the new totalLamports and poolTokenSupply

    /// CHECK: stake pool reserve
    #[account(mut)]
    pub reserve_stake: UncheckedAccount<'info>,
    // reserve_stake: This is the actual wallet where donor's SOL lamports are being deposited.

    /// CHECK: manager
    #[account(mut)]
    pub manager_fee_account: UncheckedAccount<'info>,
    // The Jito program mints a small fraction of the new JitoSOL and deposits it directly into this specific token account to pay the Jito managers.

    /// CHECK: manager
    pub stake_pool_withdraw_authority: UncheckedAccount<'info>,

    /// JitoSOL mint
    #[account(mut)]
    pub jitosol_mint: InterfaceAccount<'info, Mint>,

    /// Campaign's JitoSOL ATA (must match campaign.jitosol_ata)
    #[account(
        mut,
        constraint = campaign_jitosol_ata.key() == campaign.jitosol_ata
    )]
    pub campaign_jitosol_ata: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: The deployer would also get the fee% of referrer's money
    #[account(
        mut,
        //without below anyone could get the fee percent
        constraint = deployer.key()==config.deployer.key() @ErrorCode::InvalidDeployerAddress
    )]
    pub deployer: UncheckedAccount<'info>,
    /// Deployer JitoSOL ATA (for the Stake Pool referral requirement)
    #[account(
        mut,
        associated_token::mint = jitosol_mint,
        associated_token::authority = deployer,
        associated_token::token_program = token_program
    )]
    pub deployer_jitosol_ata: InterfaceAccount<'info, TokenAccount>,
    pub config: Account<'info, ProgramConfig>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> Donation<'info> {
    pub fn lets_donate(&mut self, cid: u64, amount: u64) -> Result<()> {
        require!(amount >= 1_000_000_000, ErrorCode::InvalidGoalAmount);
        self.txn.set_inner(DonationRecord {
            donor: self.donor.key(),
            cid,
            amount_sol: amount,
            timestamp: Clock::get()?.unix_timestamp as u64,
        });

        let ix = deposit_sol(
            &self.jito_stake_pool_program.key(),
            &self.stake_pool.key(),
            &self.stake_pool_withdraw_authority.key(),
            &self.reserve_stake.key(),
            &self.donor.key(),
            &self.campaign_jitosol_ata.key(),
            &self.manager_fee_account.key(),
            &self.deployer_jitosol_ata.key(), 
            &self.jitosol_mint.key(),
            &self.token_program.key(),
            amount,
        );

        invoke(
            &ix,
            &[
                self.stake_pool.to_account_info(),
                self.stake_pool_withdraw_authority.to_account_info(),
                self.reserve_stake.to_account_info(),
                self.donor.to_account_info(),
                self.campaign_jitosol_ata.to_account_info(),
                self.manager_fee_account.to_account_info(),
                self.deployer_jitosol_ata.to_account_info(),
                self.jitosol_mint.to_account_info(),
                self.token_program.to_account_info(),
            ],
        )?;

        self.campaign.donations = self.campaign.donations.saturating_add(1);
        self.campaign.amt_raised = self.campaign.amt_raised.saturating_add(amount);

        Ok(())
    }
}
