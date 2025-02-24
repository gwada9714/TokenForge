import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaPayment } from "../target/types/solana_payment";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { assert } from "chai";

describe("solana-payment", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaPayment as Program<SolanaPayment>;
  
  let treasury: anchor.web3.Keypair;
  let paymentState: PublicKey;
  let paymentStateBump: number;
  let mint: PublicKey;
  let payerTokenAccount: PublicKey;
  let treasuryTokenAccount: PublicKey;

  before(async () => {
    treasury = anchor.web3.Keypair.generate();
    
    // Créer le compte de paiement PDA
    const [paymentStateKey, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("payment_state")],
      program.programId
    );
    paymentState = paymentStateKey;
    paymentStateBump = bump;

    // Airdrop de SOL au treasury
    const signature = await provider.connection.requestAirdrop(
      treasury.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Créer un token de test
    mint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    // Créer les comptes de token associés
    payerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      provider.wallet.publicKey
    );

    treasuryTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      mint,
      treasury.publicKey
    );

    // Mint des tokens de test
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      mint,
      payerTokenAccount,
      provider.wallet.publicKey,
      100 * LAMPORTS_PER_SOL
    );
  });

  it("Initialise le programme", async () => {
    await program.methods
      .initialize()
      .accounts({
        paymentState,
        treasury: treasury.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.paymentState.fetch(paymentState);
    assert.ok(state.treasury.equals(treasury.publicKey));
    assert.equal(state.bump, paymentStateBump);
    assert.equal(state.processedSessions.length, 0);
  });

  it("Traite un paiement en SOL", async () => {
    const sessionId = "test-session-1";
    const amount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    const treasuryBalanceBefore = await provider.connection.getBalance(treasury.publicKey);

    await program.methods
      .processPayment(sessionId, amount)
      .accounts({
        paymentState,
        mint: SystemProgram.programId,
        payer: provider.wallet.publicKey,
        treasury: treasury.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const treasuryBalanceAfter = await provider.connection.getBalance(treasury.publicKey);
    assert.equal(treasuryBalanceAfter - treasuryBalanceBefore, amount.toNumber());

    const state = await program.account.paymentState.fetch(paymentState);
    assert.include(state.processedSessions, sessionId);
  });

  it("Traite un paiement en token SPL", async () => {
    const sessionId = "test-session-2";
    const amount = new anchor.BN(10 * LAMPORTS_PER_SOL);

    const treasuryBalanceBefore = await provider.connection.getTokenAccountBalance(treasuryTokenAccount);

    await program.methods
      .processPayment(sessionId, amount)
      .accounts({
        paymentState,
        mint,
        payer: provider.wallet.publicKey,
        payerTokenAccount,
        treasury: treasury.publicKey,
        treasuryTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const treasuryBalanceAfter = await provider.connection.getTokenAccountBalance(treasuryTokenAccount);
    assert.equal(
      treasuryBalanceAfter.value.amount - treasuryBalanceBefore.value.amount,
      amount.toString()
    );

    const state = await program.account.paymentState.fetch(paymentState);
    assert.include(state.processedSessions, sessionId);
  });

  it("Rejette une session déjà traitée", async () => {
    const sessionId = "test-session-1";
    const amount = new anchor.BN(1 * LAMPORTS_PER_SOL);

    try {
      await program.methods
        .processPayment(sessionId, amount)
        .accounts({
          paymentState,
          mint: SystemProgram.programId,
          payer: provider.wallet.publicKey,
          treasury: treasury.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      assert.fail("La transaction aurait dû échouer");
    } catch (error) {
      assert.include(error.toString(), "Session déjà traitée");
    }
  });

  it("Rejette un montant invalide", async () => {
    const sessionId = "test-session-3";
    const amount = new anchor.BN(0);

    try {
      await program.methods
        .processPayment(sessionId, amount)
        .accounts({
          paymentState,
          mint: SystemProgram.programId,
          payer: provider.wallet.publicKey,
          treasury: treasury.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      assert.fail("La transaction aurait dû échouer");
    } catch (error) {
      assert.include(error.toString(), "Montant invalide");
    }
  });
}); 