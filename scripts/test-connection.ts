const dotenv = require("dotenv");
const nodeFetch = require("node-fetch");

dotenv.config({ path: ".env" });

async function testConnection() {
  try {
    console.log("Testing contract connection...");

    const contractAddress = process.env.VITE_TOKEN_FACTORY_SEPOLIA;
    const rpcUrl = process.env.VITE_SEPOLIA_RPC_URL;

    if (!contractAddress || !rpcUrl) {
      throw new Error(
        "Missing environment variables. Please check your .env file"
      );
    }

    console.log("Contract address:", contractAddress);
    console.log("RPC URL:", rpcUrl);

    // Vérifier si le contrat existe
    const response = await nodeFetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [contractAddress, "latest"],
      }),
    });

    const data = await response.json();
    const code = data.result;

    console.log("Contract exists:", code !== "0x");
    console.log("Contract bytecode:", code);

    // Tester la fonction owner
    const ownerResponse = await nodeFetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x8da5cb5b", // owner()
          },
          "latest",
        ],
      }),
    });

    const ownerData = await ownerResponse.json();
    console.log("Owner response:", ownerData);

    // Tester la fonction paused
    const pausedResponse = await nodeFetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x5c975abb", // paused()
          },
          "latest",
        ],
      }),
    });

    const pausedData = await pausedResponse.json();
    console.log("Paused response:", pausedData);
  } catch (error) {
    console.error("Error testing contract:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    process.exit(1);
  }
}

testConnection();
