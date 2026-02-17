use anchor_lang::prelude::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Proposal already closed")]
    ProposalAlreadyClosed,
}
