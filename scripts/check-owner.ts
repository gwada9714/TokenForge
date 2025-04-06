const { createPublicClient, http } = require("viem");
const { sepolia } = require("viem/chains");

const ALCHEMY_URL =
  "https://eth-sepolia.g.alchemy.com/v2/2Hh69JPgmt2mh7xrbBJM0Fx3ewTox3n7";
const TOKEN_FORGE_ADDRESS = "0xE2b29a1D3021027aF7AC8dAe5e230922F3247a0A";

// ABI minimal pour la fonction owner
const ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

async function checkOwner() {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(ALCHEMY_URL),
  });

  try {
    console.log("Checking contract owner...");
    console.log("Contract address:", TOKEN_FORGE_ADDRESS);

    const owner = await client.readContract({
      address: TOKEN_FORGE_ADDRESS,
      abi: ABI,
      functionName: "owner",
    });

    console.log("Contract owner:", owner);
    console.log("Your address:", "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A");
    console.log(
      "Is owner?",
      owner.toLowerCase() ===
        "0xc6E1e8A4AAb35210751F3C4366Da0717510e0f1A".toLowerCase()
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

checkOwner();
