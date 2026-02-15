use anchor_lang::prelude::*;
use crate::state::{Governance, Proposal};

#[derive(Accounts)]
#[instruction(metadata: String)]
pub struct InitProposal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"gov", creator.key().as_ref(), gov_account.name.as_bytes()],
        bump = gov_account.bump
    )]
    pub gov_account: Account<'info, Governance>,

    #[account(
        init,
        payer = creator,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [
            b"proposal",
            gov_account.key().as_ref(),
            &gov_account.proposal_account.to_le_bytes()
        ],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub system_program: Program<'info, System>,
}

pub fn init_proposal(ctx: Context<InitProposal>, metadata: String) -> Result<()> {
    let gov_account = &mut ctx.accounts.gov_account;
    let proposal = &mut ctx.accounts.proposal;

    proposal.set_inner(Proposal {
        metadata,
        authority: ctx.accounts.creator.key(),
        yes_vote_count: 0,
        no_vote_count: 0,
        bump: ctx.bumps.proposal,
    });

    gov_account.proposal_account += 1;
    Ok(())
}