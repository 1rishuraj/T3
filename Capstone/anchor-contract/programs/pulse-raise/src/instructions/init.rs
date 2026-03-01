use anchor_lang::prelude::*;

use crate::{state::ProgramConfig, errors::ErrorCode};


#[derive(Accounts)]
pub struct Initialise<'info>{
    #[account(
        init,
        payer=deployer,
        space=ProgramConfig::DISCRIMINATOR.len() + ProgramConfig::INIT_SPACE,
        seeds=[b"config"],
        bump
    )]
    pub program_config:Account<'info,ProgramConfig>,
    #[account(mut)]
    pub deployer:Signer<'info>,
    pub system_program:Program<'info,System>
}

impl<'info> Initialise<'info>{
    pub fn init_config(&mut self)->Result<()>{
        require!(!self.program_config.initialised, ErrorCode::ConfiguredAlready);
        self.program_config.set_inner(ProgramConfig {
            initialised: true,
            campaign_count: 0,
            platform_fee: 2,
            deployer: self.deployer.key()
        });
        Ok(())
    }
}