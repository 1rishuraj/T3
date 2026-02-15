use anchor_lang::prelude::*;
use crate::state::Governance;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct Init<'info> {

    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        
        init, payer = creator, space = 8 + Governance::INIT_SPACE, seeds = [b"gov", creator.key().as_ref(),name.as_bytes()], bump
    
    )]
    pub gov_account: Account<'info, Governance>,
    pub system_program: Program<'info, System>,
}

pub fn init(ctx: Context<Init>, name: String) -> Result<()> {
    let gov_account = &mut ctx.accounts.gov_account;
    gov_account.set_inner(Governance {
        name,
        authority: ctx.accounts.creator.key(),
        proposal_account: 0,
        bump: ctx.bumps.gov_account,
    });
    Ok(())
}