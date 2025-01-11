const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/wasm.worker.ts', import.meta.url), {
      type: 'module'
    });
  }
  return worker;
}

export async function compile(source: string, settings: any = null) {
  const worker = getWorker();
  
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
    };

    worker.onerror = (error) => {
      reject(new Error('Worker error: ' + error.message));
    };

    worker.postMessage({
      source,
      settings: settings || {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    });
  });
}

// Clean up worker when needed
export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
