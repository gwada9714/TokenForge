import { ethers } from "ethers";
import { TokenFactoryABI } from "../contracts/abi/TokenFactory";

export const getTokenFactoryContract = (
  address: string,
  signer: ethers.Signer,
) => {
  return new ethers.Contract(address, TokenFactoryABI, signer);
};

export const createToken = async (
  contract: ethers.Contract,
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number,
) => {
  try {
    const tx = await contract.createToken(
      name,
      symbol,
      initialSupply,
      decimals,
    );
    return await tx.wait();
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
};
