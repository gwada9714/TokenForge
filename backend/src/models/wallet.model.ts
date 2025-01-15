import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  address: string;
  privateKey: string;
  expiresAt: Date;
  createdAt: Date;
}

const WalletSchema: Schema = new Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  privateKey: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche rapide des wallets expirés
WalletSchema.index({ expiresAt: 1 });

export const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);
