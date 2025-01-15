import type { TypechainConfig } from '@typechain/hardhat/dist/types';

const config: TypechainConfig = {
  outDir: 'src/types/contracts',
  target: 'ethers-v6',
  alwaysGenerateOverloads: false,
  dontOverrideCompile: false,
  discriminateTypes: false,
  tsNocheck: false,
  node16Modules: false
};

export default config; 