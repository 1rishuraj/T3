use anchor_lang::{prelude::*, system_program::{Transfer, transfer}};

use crate::{errors::DiceError, state::Bet};
#[derive(Accounts)]
#[instruction(seed:u128)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    ///CHECK: This is safe
    pub house: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"vault", house.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    #[account(
        init,
        payer = player,
        space = Bet::DISCRIMINATOR.len() + Bet::INIT_SPACE,
        seeds = [b"bet", vault.key().as_ref(), seed.to_le_bytes().as_ref()],
        bump
    )]
    pub bet: Account<'info, Bet>,
    pub system_program: Program<'info, System>
}

impl<'info> PlaceBet<'info> {
    pub fn create_bet(&mut self, bumps: &PlaceBetBumps, seed: u128, roll: u8, amount: u64) -> Result<()> {

        //Enforce roll boundaries to prevent broken math
        require!(roll >= 2, DiceError::MinimumRoll);
        require!(roll <= 96, DiceError::MaximumRoll);

        // Enforce minimum bet amount (0.01 SOL = 10_000_000 lamports)
        require!(amount >= 10_000_000, DiceError::MinimumBet);

        // Calculate potential payout to ensure the house is solvent
        let potential_payout = (amount as u128)
            .checked_mul(100)
            .ok_or(DiceError::Overflow)?
            .checked_div(roll as u128)
            .ok_or(DiceError::Overflow)? as u64;

        // Prevent "freerolling" by ensuring the vault has enough funds to cover a win
        require!(
            self.vault.lamports() >= potential_payout,
            DiceError::MaximumBet 
        );
        
        self.bet.set_inner(Bet{
            slot : Clock::get()?.slot,
            player: self.player.key(),
            seed,
            roll,
            amount,
            bump : bumps.bet,
        });
        Ok(())
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: self.player.to_account_info(),
            to: self.vault.to_account_info()
        };

        let ctx = CpiContext::new(
            self.system_program.to_account_info(),
            accounts
        );
        transfer(ctx, amount)
    }
}