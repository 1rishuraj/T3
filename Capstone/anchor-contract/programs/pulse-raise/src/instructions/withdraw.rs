use crate::{
    errors::ErrorCode,
    state::{Campaign, ProgramConfig, WithdrawalRecord},
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
#[instruction(cid:u64)]
pub struct Withdrawal<'info> {
    /// CHECK: The deployer would also get the fee% of withdrawn money
    #[account(
        mut,
        //without below anyone could get the fee percent
        constraint = deployer.key()==config.deployer.key() @ErrorCode::InvalidDeployerAddress
    )]
    pub deployer: UncheckedAccount<'info>,

    pub config: Account<'info, ProgramConfig>,

    #[account(mut)]
    pub withdrawer: Signer<'info>,

    #[account(
        init,
        payer=withdrawer,
        space=WithdrawalRecord::DISCRIMINATOR.len()+WithdrawalRecord::INIT_SPACE,
        seeds=[
            b"withdraw",
            withdrawer.key().as_ref(),//many withdrawers
            cid.to_le_bytes().as_ref(),//same withdrawer withdraw from many campaign
            &campaign.withdrawals.to_le_bytes()//same withdrawer withdraw from same campaign many times
        ],
        bump
    )]
    pub txn: Account<'info, WithdrawalRecord>,

    #[account(
        mut,
        seeds=[b"campaign", &cid.to_le_bytes()],
        bump,
        constraint = campaign.cid == cid @ErrorCode::NotFound,
        //can also withdraw from inactive campaigns
        // constraint = campaign.active @ErrorCode::InactiveCampaign,
        constraint = campaign.creator.key() == withdrawer.key() @ErrorCode::Unauthorized
        
    )]
    pub campaign: Account<'info, Campaign>,

    /// Campaign JitoSOL ATA (source)
    #[account(
        mut,
        constraint = campaign_jitosol_ata.key() == campaign.jitosol_ata
    )]
    pub campaign_jitosol_ata: InterfaceAccount<'info, TokenAccount>,

    /// JitoSOL mint
    pub jitosol_mint: InterfaceAccount<'info, Mint>,

    /// Withdrawer JitoSOL ATA (destination)
    #[account(
        init_if_needed,
        payer = withdrawer,
        associated_token::mint = jitosol_mint,
        associated_token::authority = withdrawer,
        associated_token::token_program = token_program
    )]
    pub withdrawer_jitosol_ata: InterfaceAccount<'info, TokenAccount>,

    /// Deployer JitoSOL ATA for fee
    #[account(
        init_if_needed,
        payer = withdrawer,
        associated_token::mint = jitosol_mint,
        associated_token::authority = deployer,
        associated_token::token_program = token_program
    )]
    pub deployer_jitosol_ata: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> Withdrawal<'info> {
    pub fn lets_withdraw(&mut self, cid: u64, amount_jito: u64) -> Result<()> {
        require!(
            amount_jito > 0,
            ErrorCode::InvalidWithdrawalAmount
        );
        require!(
            self.campaign_jitosol_ata.amount >= amount_jito,
            ErrorCode::InsufficientFund
        );

        self.txn.set_inner(WithdrawalRecord { 
            withdrawer: self.withdrawer.key(), 
            cid, 
            amount_jito, 
            timestamp: Clock::get()?.unix_timestamp as u64,
        });

        let platform_fee = amount_jito
            .checked_mul(self.config.platform_fee)
            .ok_or(ErrorCode::MathOverflow)?
            / 100;

        let withdrawer_amt = amount_jito
            .checked_sub(platform_fee)
            .ok_or(ErrorCode::MathOverflow)?;

        let decimals = self.jitosol_mint.decimals;

        let signer_seeds: &[&[&[u8]]] =
            &[&[b"campaign", &cid.to_le_bytes(), &[self.campaign.bump]]];

        // Transfer JitoSOL from campaign -> withdrawer (creator)
        let cpi_to_withdrawer = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.campaign_jitosol_ata.to_account_info(),
                mint: self.jitosol_mint.to_account_info(),
                to: self.withdrawer_jitosol_ata.to_account_info(),
                authority: self.campaign.to_account_info(),
            },
            signer_seeds,
        );
        transfer_checked(cpi_to_withdrawer, withdrawer_amt, decimals)?;

        // Transfer JitoSOL from campaign -> deployer (platform fee)
        let cpi_to_deployer = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            TransferChecked {
                from: self.campaign_jitosol_ata.to_account_info(),
                mint: self.jitosol_mint.to_account_info(),
                to: self.deployer_jitosol_ata.to_account_info(),
                authority: self.campaign.to_account_info(),
            },
            signer_seeds,
        );
        transfer_checked(cpi_to_deployer, platform_fee, decimals)?;

        self.campaign.withdrawals = self.campaign.withdrawals.saturating_add(1);
        Ok(())
    }
}
