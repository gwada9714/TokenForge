import { useCallback } from "react";
import { TokenForgeUser } from "../types";
import { emailVerificationService } from "../services/emailVerificationService";

interface EmailVerificationState {
  sendVerificationEmail: (user: TokenForgeUser) => Promise<void>;
  waitForEmailVerification: (user: TokenForgeUser) => Promise<void>;
  checkEmailVerification: (user: TokenForgeUser) => Promise<void>;
}

export function useEmailVerification(): EmailVerificationState {
  const sendVerificationEmail = useCallback(async (user: TokenForgeUser) => {
    await emailVerificationService.sendVerificationEmail(user);
  }, []);

  const waitForEmailVerification = useCallback(async (user: TokenForgeUser) => {
    await emailVerificationService.waitForEmailVerification(user, {
      intervalMs: 2000,
      timeoutMs: 300000,
      onVerified: () => {
        console.log("Email vérifié avec succès");
      },
    });
  }, []);

  const checkEmailVerification = useCallback(async (user: TokenForgeUser) => {
    await emailVerificationService.checkEmailVerification(user);
  }, []);

  return {
    sendVerificationEmail,
    waitForEmailVerification,
    checkEmailVerification,
  };
}
