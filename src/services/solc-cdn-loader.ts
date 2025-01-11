import type { CompilerInput, CompilerOutput } from 'solc';

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/wasm.worker.ts', import.meta.url), {
      type: 'module'
    });
  }
  return worker;
}

export async function compile(source: string, settings?: CompilerInput['settings']): Promise<CompilerOutput> {
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

    worker.postMessage({ source, settings });
  });
}

// Clean up worker when needed
export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
