import * as solc from 'solc';

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let solcInstance: any = null;

async function loadSolc() {
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
self.onmessage = async (e) => {
  try {
    const { source, settings } = e.data;
    const solc = await loadSolc();

    const input = {
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

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    self.postMessage({ result: output });
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

export {};
