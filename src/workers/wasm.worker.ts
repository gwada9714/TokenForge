import type { CompilerInput, CompilerOutput } from 'solc';
import type { SolcInstance } from 'solc/wrapper';

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let solcInstance: SolcInstance | null = null;

async function loadSolc(): Promise<SolcInstance> {
  if (solcInstance) return solcInstance;

  try {
    const response = await fetch(SOLC_CDN);
    const code = await response.text();
    
    // Create a function from the downloaded code
    const wrapper = new Function('self', code);
    wrapper(self);

    // @ts-ignore
    if (typeof self.Module === 'undefined') {
      throw new Error('Solc module not loaded correctly');
    }

    const solcWrapper = await import('solc/wrapper');
    // @ts-ignore
    solcInstance = solcWrapper.default(self.Module);
    return solcInstance;
  } catch (error) {
    console.error('Error loading Solc:', error);
    throw error;
  }
}

/**
 * Worker message handler for Solidity compilation
 */
interface WorkerMessage {
  source: string;
  settings?: CompilerInput['settings'];
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
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: source
        }
      },
      settings: settings || {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        },
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input))) as CompilerOutput;
    self.postMessage({ result: output } as WorkerResponse);
  } catch (error) {
    self.postMessage({ 
      error: error instanceof Error ? error.message : 'Unknown error during compilation'
    } as WorkerResponse);
  }
};

export {};
