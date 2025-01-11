import type { CompilerInput, CompilerOutput } from 'solc';

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let solcInstance: any = null;

async function loadScript(url: string): Promise<void> {
  const response = await fetch(url);
  const code = await response.text();
  
  // Create a function from the downloaded code and execute it in worker scope
  const wrapper = new Function('self', code);
  wrapper(self);
}

async function loadSolc() {
  if (solcInstance) return solcInstance;

  try {
    await loadScript(SOLC_CDN);
    
    // @ts-ignore
    if (typeof self.Module === 'undefined') {
      throw new Error('Solc module not loaded correctly');
    }

    // @ts-ignore
    return self.Module;
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

    // @ts-ignore
    const output = JSON.parse(solc.compile(JSON.stringify(input))) as CompilerOutput;
    self.postMessage({ result: output } as WorkerResponse);
  } catch (error) {
    self.postMessage({ 
      error: error instanceof Error ? error.message : 'Unknown error during compilation'
    } as WorkerResponse);
  }
};

export {};
