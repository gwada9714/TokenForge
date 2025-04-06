import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

const LOG_LEVELS = {
  INFO: "\x1b[32m%s\x1b[0m", // Vert
  WARNING: "\x1b[33m%s\x1b[0m", // Jaune
  ERROR: "\x1b[31m%s\x1b[0m", // Rouge
};

const securityChecks = {
  checkEnvVariables() {
    const requiredVars = [
      "VITE_RECAPTCHA_SITE_KEY",
      "VITE_CSP_NONCE_LENGTH",
      "VITE_SESSION_TIMEOUT",
      "VITE_STRICT_CSP",
    ];

    const missingVars = requiredVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      console.log(
        LOG_LEVELS.ERROR,
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
      return false;
    }
    console.log(LOG_LEVELS.INFO, "Environment variables check passed");
    return true;
  },

  async checkFirebaseConfig() {
    const config = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    };

    try {
      const response = await fetch(
        `https://${config.authDomain}/__/firebase/init.json`
      );
      if (!response.ok) throw new Error("Firebase config validation failed");
      console.log(LOG_LEVELS.INFO, "Firebase configuration check passed");
      return true;
    } catch (error) {
      console.log(
        LOG_LEVELS.ERROR,
        `Firebase configuration error: ${error.message}`
      );
      return false;
    }
  },

  checkCSPConfig() {
    const cspFile = path.join(__dirname, "../src/config/csp.ts");
    if (!fs.existsSync(cspFile)) {
      console.log(LOG_LEVELS.ERROR, "CSP configuration file not found");
      return false;
    }

    const content = fs.readFileSync(cspFile, "utf8");
    const checks = {
      nonce: content.includes("nonce-"),
      strictCSP: content.includes("strict-dynamic"),
      reportUri: content.includes("report-uri"),
      unsafeInline:
        !content.includes("'unsafe-inline'") ||
        content.includes('process.env.NODE_ENV === "development"'),
    };

    let passed = true;
    Object.entries(checks).forEach(([check, result]) => {
      if (!result) {
        console.log(LOG_LEVELS.WARNING, `CSP check failed: ${check}`);
        passed = false;
      }
    });

    if (passed) {
      console.log(LOG_LEVELS.INFO, "CSP configuration check passed");
    }
    return passed;
  },

  checkSecurityHeaders() {
    const headers = [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "X-XSS-Protection",
      "Strict-Transport-Security",
      "Content-Security-Policy",
    ];

    const configFile = path.join(__dirname, "../src/config/csp.ts");
    const content = fs.readFileSync(configFile, "utf8");

    const missingHeaders = headers.filter(
      (header) => !content.includes(header)
    );
    if (missingHeaders.length > 0) {
      console.log(
        LOG_LEVELS.WARNING,
        `Missing security headers: ${missingHeaders.join(", ")}`
      );
      return false;
    }
    console.log(LOG_LEVELS.INFO, "Security headers check passed");
    return true;
  },
};

async function runSecurityChecks() {
  console.log("\nRunning security checks...\n");

  const results = {
    env: securityChecks.checkEnvVariables(),
    firebase: await securityChecks.checkFirebaseConfig(),
    csp: securityChecks.checkCSPConfig(),
    headers: securityChecks.checkSecurityHeaders(),
  };

  console.log("\nSecurity Check Results:");
  Object.entries(results).forEach(([check, passed]) => {
    console.log(
      passed ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR,
      `${check.toUpperCase()}: ${passed ? "PASSED" : "FAILED"}`
    );
  });

  const allPassed = Object.values(results).every((r) => r);
  if (!allPassed) {
    console.log(
      LOG_LEVELS.ERROR,
      "\nSecurity checks failed. Please fix the issues above."
    );
    process.exit(1);
  }

  console.log(LOG_LEVELS.INFO, "\nAll security checks passed!");
}

runSecurityChecks().catch((error) => {
  console.error("Error running security checks:", error);
  process.exit(1);
});
