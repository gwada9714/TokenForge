import * as solc from 'solc';

/**
 * Initializes the Solidity compiler with WASM support
 * @returns Initialized solc instance
 */
async function initializeCompiler() {
  try {
    if (typeof solc.compile === 'function') {
      return solc;
    }

    const response = await fetch('/node_modules/solc/soljson.wasm');
    const wasmBinary = await response.arrayBuffer();
    
    const wasmModule = await WebAssembly.compile(wasmBinary);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 })
      }
    });

    // @ts-ignore
    solc._wasm = wasmInstance;
    return solc;
  } catch (error) {
    console.error('Error initializing WASM compiler:', error);
    throw error;
  }
}

/**
 * Worker message handler for Solidity compilation
 */
self.onmessage = async (e) => {
  const { source, settings } = e.data;
  
  try {
    const compiler = await initializeCompiler();
    
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

    const output = JSON.parse(compiler.compile(JSON.stringify(input)));
    self.postMessage({ success: true, data: output });
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during compilation'
    });
  }
};

export {};
