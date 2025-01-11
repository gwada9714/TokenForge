import type { CompilerInput, CompilerOutput } from "solc";

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
const SOLC_VERSION = "0.8.20";
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

const solcInstance: any = null;

/**
 * Remplacer l'utilisation de new Function par une approche plus sécurisée
 */
const executeWasmCode = (code: string) => {
  // Utiliser un module ES dynamique au lieu de new Function
  const blob = new Blob([code], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);

  return import(/* @vite-ignore */ url).then((module) => {
    URL.revokeObjectURL(url);
    return module.default;
  });
};

async function loadSolc() {
  if (solcInstance) return solcInstance;

  try {
    const response = await fetch(SOLC_CDN);
    const code = await response.text();

    // Execute the downloaded code in worker scope
    const module = await executeWasmCode(code);

    // @ts-ignore
    if (typeof self.Module === "undefined") {
      throw new Error("Solc module not loaded correctly");
    }

    // @ts-ignore
    return self.Module;
  } catch (error) {
    console.error("Error loading Solc:", error);
    throw error;
  }
}

/**
 * Worker message handler for Solidity compilation
 */
interface WorkerMessage {
  source: string;
  settings?: CompilerInput["settings"];
}

interface WorkerResponse {
  result?: CompilerOutput;
  error?: string;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  try {
    const { source, settings } = e.data;
    const solc = await loadSolc();

    const input: CompilerInput = {
      language: "Solidity",
      sources: {
        "contract.sol": {
          content: source,
        },
      },
      settings: settings || {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    // @ts-ignore
    const output = JSON.parse(
      solc.compile(JSON.stringify(input)),
    ) as CompilerOutput;
    self.postMessage({ result: output } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during compilation",
    } as WorkerResponse);
  }
};

export {};
