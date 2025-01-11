import { ethers } from "ethers";

// TODO: Move these to environment variables or config file
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const CONTRACT_ABI: ethers.InterfaceAbi = []; // Your contract ABI here

export const web3Service = {
  getContract: (provider: ethers.Provider | ethers.Signer) => {
    return new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );
  },

  mintToken: async (
    tokenURI: string,
    price: string
  ): Promise<ethers.ContractTransactionResponse> => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const tx = await contract.mintToken(tokenURI, {
        value: ethers.parseEther(price),
      });

      return await tx.wait();
    } catch (error) {
      console.error("Error minting token:", error);
      throw error;
    }
  },

  getTokenURI: async (tokenId: string): Promise<string> => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      return await contract.tokenURI(tokenId);
    } catch (error) {
      console.error("Error getting token URI:", error);
      throw error;
    }
  },
};

export {};