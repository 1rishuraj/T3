use anchor_lang::prelude::*;
use crate::state::Proposal;
use crate::error::ErrorCode;
#[derive(Accounts)]
pub struct CloseProposal<'info> {
    #[account(mut, constraint = authority.key() == proposal.authority @ ErrorCode::Unauthorized)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

pub fn close_proposal(ctx: Context<CloseProposal>) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    require!(!proposal.closed, ErrorCode::ProposalAlreadyClosed);
    
    proposal.closed = true;  // Just flip the flag!
    Ok(())
}

