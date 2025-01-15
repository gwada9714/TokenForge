import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "ethers";

declare global {
  var hre: HardhatRuntimeEnvironment & {
    ethers: typeof ethers & {
      getSigners(): Promise<any[]>;
      getContractFactory(name: string): Promise<any>;
    };
  };
  var ethers: typeof import("ethers");
}

export {};
