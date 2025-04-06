import { describe, expect, it } from "vitest";
import {
  PaymentErrorType,
  PaymentError,
  createPaymentError,
} from "../types/PaymentError";

describe("PaymentError", () => {
  it("should create a PaymentError with basic information", () => {
    const error = new PaymentError(
      PaymentErrorType.VALIDATION_ERROR,
      "Invalid amount"
    );

    expect(error.type).toBe(PaymentErrorType.VALIDATION_ERROR);
    expect(error.message).toBe("Invalid amount");
    expect(error.name).toBe("PaymentError");
  });

  it("should create a PaymentError with details", () => {
    const details = { amount: "0", expected: "> 0" };
    const error = new PaymentError(
      PaymentErrorType.VALIDATION_ERROR,
      "Invalid amount",
      details
    );

    expect(error.details).toBe(details);
  });

  it("should create PaymentError using factory function", () => {
    const error = createPaymentError(
      PaymentErrorType.NETWORK_ERROR,
      "Network timeout",
      { timeout: 5000 }
    );

    expect(error instanceof PaymentError).toBe(true);
    expect(error.type).toBe(PaymentErrorType.NETWORK_ERROR);
    expect(error.message).toBe("Network timeout");
    expect(error.details).toEqual({ timeout: 5000 });
  });

  it("should handle all error types", () => {
    const errorTypes = Object.values(PaymentErrorType);

    expect(errorTypes).toContain(PaymentErrorType.VALIDATION_ERROR);
    expect(errorTypes).toContain(PaymentErrorType.NETWORK_ERROR);
    expect(errorTypes).toContain(PaymentErrorType.TIMEOUT_ERROR);
    expect(errorTypes).toContain(PaymentErrorType.INSUFFICIENT_FUNDS);
    expect(errorTypes).toContain(PaymentErrorType.TRANSACTION_FAILED);
    expect(errorTypes).toContain(PaymentErrorType.SESSION_ERROR);
    expect(errorTypes).toContain(PaymentErrorType.WALLET_ERROR);
  });

  it("should extend Error class properly", () => {
    const error = new PaymentError(
      PaymentErrorType.WALLET_ERROR,
      "Wallet disconnected"
    );

    expect(error instanceof Error).toBe(true);
    expect(error.stack).toBeDefined();
  });
});
