declare module "solc" {
  interface CompilerInput {
    language: "Solidity";
    sources: {
      [key: string]: {
        content: string;
      };
    };
    settings: {
      outputSelection: {
        [key: string]: {
          [key: string]: string[];
        };
      };
      optimizer?: {
        enabled: boolean;
        runs: number;
      };
    };
  }

  interface CompilerOutput {
    contracts: {
      [key: string]: {
        [key: string]: {
          abi: any[];
          evm: {
            bytecode: {
              object: string;
            };
          };
        };
      };
    };
    errors?: Array<{
      message: string;
      severity: "error" | "warning";
    }>;
  }

  export function compile(input: string): string;
  export const version: string;
}

declare module "solc/wrapper" {
  import type { CompilerInput, CompilerOutput } from "solc";

  export interface SolcWrapper {
    compile(input: string): string;
    version(): string;
  }

  export default function wrapper(Module: any): SolcWrapper;
}
