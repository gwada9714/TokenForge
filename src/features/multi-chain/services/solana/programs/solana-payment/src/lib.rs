use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("PayXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

#[program]
pub mod solana_payment {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let payment_state = &mut ctx.accounts.payment_state;
        payment_state.treasury = ctx.accounts.treasury.key();
        payment_state.bump = *ctx.bumps.get("payment_state").unwrap();
        Ok(())
    }

    pub fn process_payment(
        ctx: Context<ProcessPayment>,
        session_id: String,
        amount: u64,
    ) -> Result<()> {
        require!(!ctx.accounts.payment_state.processed_sessions.contains(&session_id), 
            PaymentError::SessionAlreadyProcessed);
        require!(amount > 0, PaymentError::InvalidAmount);

        if ctx.accounts.mint.key() == spl_token::native_mint::id() {
            // Traitement du paiement en SOL natif
            let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.payer.key(),
                &ctx.accounts.treasury.key(),
                amount,
            );
            anchor_lang::solana_program::program::invoke(
                &transfer_ix,
                &[
                    ctx.accounts.payer.to_account_info(),
                    ctx.accounts.treasury.to_account_info(),
                ],
            )?;
        } else {
            // Traitement du paiement en SPL Token
            let cpi_accounts = Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, amount)?;
        }

        // Marquer la session comme traitée
        ctx.accounts.payment_state.processed_sessions.push(session_id);

        emit!(PaymentProcessed {
            session_id,
            payer: ctx.accounts.payer.key(),
            mint: ctx.accounts.mint.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 1000, // Discriminator + Treasury pubkey + bump + space for sessions
        seeds = [b"payment_state"],
        bump
    )]
    pub payment_state: Account<'info, PaymentState>,
    pub treasury: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(mut, seeds = [b"payment_state"], bump = payment_state.bump)]
    pub payment_state: Account<'info, PaymentState>,
    pub mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub payer_token_account: Account<'info, TokenAccount>,
    /// CHECK: Vérifié via les seeds
    #[account(mut, address = payment_state.treasury)]
    pub treasury: UncheckedAccount<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = treasury
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PaymentState {
    pub treasury: Pubkey,
    pub bump: u8,
    pub processed_sessions: Vec<String>,
}

#[event]
pub struct PaymentProcessed {
    pub session_id: String,
    pub payer: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum PaymentError {
    #[msg("Session déjà traitée")]
    SessionAlreadyProcessed,
    #[msg("Montant invalide")]
    InvalidAmount,
} 