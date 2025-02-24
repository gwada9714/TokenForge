use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("TokenForgePay1111111111111111111111111111111111");

#[program]
pub mod solana_payment {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, receiver: Pubkey) -> Result<()> {
        let payment_account = &mut ctx.accounts.payment_account;
        payment_account.receiver = receiver;
        payment_account.authority = ctx.accounts.authority.key();
        payment_account.paused = false;
        Ok(())
    }

    pub fn pay_with_sol(
        ctx: Context<PayWithSol>,
        amount: u64,
        service_type: String,
        session_id: String,
    ) -> Result<()> {
        require!(!ctx.accounts.payment_account.paused, PaymentError::Paused);
        require!(amount > 0, PaymentError::InvalidAmount);

        // Transfer SOL to receiver
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.receiver.to_account_info(),
        };

        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );

        anchor_lang::system_program::transfer(transfer_ctx, amount)?;

        // Emit payment event
        emit!(PaymentReceived {
            payer: ctx.accounts.payer.key(),
            token: None,
            amount,
            service_type,
            session_id,
        });

        Ok(())
    }

    pub fn pay_with_token(
        ctx: Context<PayWithToken>,
        amount: u64,
        service_type: String,
        session_id: String,
    ) -> Result<()> {
        require!(!ctx.accounts.payment_account.paused, PaymentError::Paused);
        require!(amount > 0, PaymentError::InvalidAmount);

        // Transfer tokens
        let transfer_instruction = Transfer {
            from: ctx.accounts.payer_token_account.to_account_info(),
            to: ctx.accounts.receiver_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };

        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        token::transfer(transfer_ctx, amount)?;

        // Emit payment event
        emit!(PaymentReceived {
            payer: ctx.accounts.payer.key(),
            token: Some(ctx.accounts.mint.key()),
            amount,
            service_type,
            session_id,
        });

        Ok(())
    }

    pub fn refund_sol(
        ctx: Context<RefundSol>,
        amount: u64,
        session_id: String,
    ) -> Result<()> {
        require!(amount > 0, PaymentError::InvalidAmount);

        // Transfer SOL back to recipient
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.payment_account.to_account_info(),
            to: ctx.accounts.recipient.to_account_info(),
        };

        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );

        anchor_lang::system_program::transfer(transfer_ctx, amount)?;

        // Emit refund event
        emit!(PaymentRefunded {
            recipient: ctx.accounts.recipient.key(),
            token: None,
            amount,
            session_id,
        });

        Ok(())
    }

    pub fn refund_token(
        ctx: Context<RefundToken>,
        amount: u64,
        session_id: String,
    ) -> Result<()> {
        require!(amount > 0, PaymentError::InvalidAmount);

        // Transfer tokens back to recipient
        let transfer_instruction = Transfer {
            from: ctx.accounts.payment_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.payment_account.to_account_info(),
        };

        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );

        token::transfer(transfer_ctx, amount)?;

        // Emit refund event
        emit!(PaymentRefunded {
            recipient: ctx.accounts.recipient.key(),
            token: Some(ctx.accounts.mint.key()),
            amount,
            session_id,
        });

        Ok(())
    }

    pub fn set_paused(ctx: Context<SetPaused>, paused: bool) -> Result<()> {
        let payment_account = &mut ctx.accounts.payment_account;
        payment_account.paused = paused;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = PaymentAccount::LEN
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayWithSol<'info> {
    #[account(
        constraint = payment_account.receiver == receiver.key()
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayWithToken<'info> {
    #[account(
        constraint = payment_account.receiver == receiver.key()
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    pub mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub receiver: AccountInfo<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub payer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = receiver
    )]
    pub receiver_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundSol<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundToken<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    pub authority: Signer<'info>,
    pub mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = payment_account
    )]
    pub payment_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = recipient
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetPaused<'info> {
    #[account(
        mut,
        has_one = authority,
    )]
    pub payment_account: Account<'info, PaymentAccount>,
    pub authority: Signer<'info>,
}

#[account]
pub struct PaymentAccount {
    pub authority: Pubkey,
    pub receiver: Pubkey,
    pub paused: bool,
}

impl PaymentAccount {
    pub const LEN: usize = 8 + 32 + 32 + 1;
}

#[event]
pub struct PaymentReceived {
    pub payer: Pubkey,
    pub token: Option<Pubkey>,
    pub amount: u64,
    pub service_type: String,
    pub session_id: String,
}

#[event]
pub struct PaymentRefunded {
    pub recipient: Pubkey,
    pub token: Option<Pubkey>,
    pub amount: u64,
    pub session_id: String,
}

#[error_code]
pub enum PaymentError {
    #[msg("Payment service is paused")]
    Paused,
    #[msg("Invalid payment amount")]
    InvalidAmount,
}
