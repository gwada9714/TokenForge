import { ethers, TransactionReceipt } from "ethers";
import { TokenFactoryABI } from "../contracts/abi/TokenFactory";

// Fonction pour obtenir le contrat TokenFactory
export const getTokenFactoryContract = (
  address: string,
  signer: ethers.Signer,
): ethers.Contract => {
  return new ethers.Contract(address, TokenFactoryABI, signer);
};

// Fonction pour créer un token
export const createToken = async (
  contract: ethers.Contract,
  name: string,
  symbol: string,
  initialSupply: string,
  decimals: number,
): Promise<TransactionReceipt> => {
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
