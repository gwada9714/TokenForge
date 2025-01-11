import type { CompilerInput, CompilerOutput } from "solc";

declare const self: Worker & {
    Module: any;
};

/**
 * Constantes et types
 */
const SOLC_VERSION = "0.8.20";
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;
const WASM_TIMEOUT = 30000; // 30 secondes timeout
const solcInstance: any = null;

/**
 * Type definitions
 */
interface WorkerMessage {
    source: string;
    settings?: CompilerInput["settings"];
}

interface WorkerResponse {
    result?: CompilerOutput;
    error?: string;
}

/**
 * Exécution sécurisée du code WASM
 */
const executeWasmCode = async (code: string): Promise<any> => {
    try {
        // Validation du code d'entrée
        if (typeof code !== 'string' || !code.trim()) {
            throw new Error('Invalid WASM code input');
        }

        // Création d'une promesse avec timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WASM execution timeout')), WASM_TIMEOUT);
        });

        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);

        try {
            const result = await Promise.race([
                import(/* @vite-ignore */ url),
                timeoutPromise
            ]);
            return result.default;
        } finally {
            URL.revokeObjectURL(url);
        }
    } catch (error: unknown) {
        console.error('[WASM Execution Error]:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`WASM execution failed: ${errorMessage}`);
    }
};

/**
 * Chargement sécurisé du compilateur Solidity
 */
async function loadSolc() {
    if (solcInstance) return solcInstance;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(SOLC_CDN, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/javascript'
            }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Failed to fetch Solc: ${response.statusText}`);
        }

        const code = await response.text();
        const module = await executeWasmCode(code);

        if (typeof self.Module === "undefined") {
            throw new Error("Solc module not loaded correctly");
        }

        return self.Module;
    } catch (error: unknown) {
        console.error("Error loading Solc:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Solc loading failed: ${errorMessage}`);
    }
}

/**
 * Validation des paramètres de compilation
 */
function validateCompilerInput(source: string, settings?: CompilerInput["settings"]): void {
    if (typeof source !== 'string' || !source.trim()) {
        throw new Error('Invalid source code');
    }

    if (settings && typeof settings !== 'object') {
        throw new Error('Invalid compiler settings');
    }
}

/**
 * Handler des messages du worker
 */
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    try {
        const { source, settings } = e.data;
        validateCompilerInput(source, settings);

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

        const output = JSON.parse(
            solc.compile(JSON.stringify(input))
        ) as CompilerOutput;

        self.postMessage({ result: output } as WorkerResponse);
    } catch (error: unknown) {
        self.postMessage({
            error: error instanceof Error ? error.message : "Unknown error during compilation",
        } as WorkerResponse);
    }
};

export {};