// Type guards et validations pour TokenForge
export function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === null || value === undefined;
}

// Validation d'adresse Ethereum
export function isValidAddress(
  address: string | null | undefined
): address is string {
  if (isNullOrUndefined(address)) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validation de montant
export function isValidAmount(
  amount: string | null | undefined
): amount is string {
  if (isNullOrUndefined(amount)) return false;
  return /^\d*\.?\d+$/.test(amount) && parseFloat(amount) > 0;
}

// Validation de hash de transaction
export function isValidTxHash(hash: string | null | undefined): hash is string {
  if (isNullOrUndefined(hash)) return false;
  return /^0x([A-Fa-f0-9]{64})$/.test(hash);
}
