use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Program Configured Already")]
    ConfiguredAlready,
    #[msg("Title exceeds the maximum length of 64 characters.")]
    TitleTooLong,
    #[msg("Description exceeds the maximum length of 512 characters.")]
    DescriptionTooLong,
    #[msg("Image URL exceeds the maximum length of 256 characters.")]
    ImageUrlTooLong,
    #[msg("Invalid goal amount. Goal must be greater than 1 SOL")]
    InvalidGoalAmount,
    #[msg("Unauthorized access.")]
    Unauthorized,
    #[msg("Campaign Not Found")]
    NotFound,
    #[msg("Campaign Inactive Already")]
    InactiveCampaign,
    #[msg("Campaign Goal Accomplished")]
    CampaignGoalAccomplished,
    #[msg("Withdrawal Amount must be greater than 1 SOL")]
    InvalidWithdrawalAmount,
    #[msg("Insufficient Fund in the campaign")]
    InsufficientFund,
    #[msg("Invalid Deployer Address")]
    InvalidDeployerAddress,
    #[msg("Platform Fee must be within 1% to 15%")]
    InvalidPlatformFee,
    #[msg("Input beyond limits")]
    MathOverflow,
}
