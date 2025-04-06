import { PaymentOptions } from "../../payment/types/PaymentSession";

export interface SolanaTransactionOptions extends PaymentOptions {
  skipPreflight?: boolean;
  commitment?: "finalized" | "processed" | "confirmed";
}
