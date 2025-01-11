import type { CompilerInput, CompilerOutput } from 'solc';
import type { SolcWrapper } from 'solc/wrapper';

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let solcInstance: SolcWrapper | null = null;

async function loadSolc(): Promise<SolcWrapper> {
  if (solcInstance) return solcInstance;

  try {
    const response = await fetch(SOLC_CDN);
    const wasmBinary = await response.arrayBuffer();
    
    // Use WebAssembly.compile instead of instantiateSync
    const wasmModule = await WebAssembly.compile(wasmBinary);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 })
      }
    });

    const solcWrapper = await import('solc/wrapper');
    // @ts-ignore
    solcInstance = solcWrapper.default(wasmInstance.exports);
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
