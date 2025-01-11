import type { CompilerInput, CompilerOutput } from "solc";

/**
 * Service for managing Solidity compilation using WebAssembly
 */

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("../workers/wasm.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

/**
 * Compiles Solidity source code using a dedicated WASM worker
 * @param source Solidity source code to compile
 * @param settings Optional compiler settings
 * @returns Promise resolving to compilation output
 */
export async function compile(
  source: string,
  settings: any = null,
): Promise<CompilerOutput> {
  return new Promise((resolve, reject) => {
    const currentWorker = getWorker();

    const handleMessage = (e: MessageEvent) => {
      currentWorker.removeEventListener("message", handleMessage);

      if (e.data.success) {
        resolve(e.data.data);
      } else {
        reject(new Error(e.data.error));
      }
    };

    currentWorker.addEventListener("message", handleMessage);
    currentWorker.postMessage({ source, settings });
  });
}

/**
 * Cleans up worker resources to prevent memory leaks
 */
export function disposeWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
