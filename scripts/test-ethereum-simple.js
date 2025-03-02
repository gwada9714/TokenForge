// Simple Ethereum test script using ethers.js
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

async function main() {
    console.log('=== Testing Ethereum Connection ===\n');

    try {
        // Create a provider for the Sepolia testnet
        // Try multiple public endpoints in case one is down
        let provider;
        try {
            provider = new ethers.JsonRpcProvider('https://ethereum-sepolia.publicnode.com');
            console.log('Provider connected to Sepolia testnet via publicnode.com');
        } catch (e) {
            console.log('Failed to connect to publicnode.com, trying ankr...');
            provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia');
            console.log('Provider connected to Sepolia testnet via ankr.com');
        }

        // Get network information
        const network = await provider.getNetwork();
        console.log('Network:', {
            name: network.name,
            chainId: network.chainId.toString()
        });

        // Get the latest block number
        const blockNumber = await provider.getBlockNumber();
        console.log('Current block number:', blockNumber);

        // Get the latest block
        const block = await provider.getBlock(blockNumber);
        console.log('Latest block hash:', block.hash);
        console.log('Latest block timestamp:', new Date(block.timestamp * 1000).toISOString());

        // Get gas price
        const gasPrice = await provider.getFeeData();
        console.log('Gas price (wei):', gasPrice.gasPrice.toString());

        console.log('\n=== Ethereum Connection Test Completed Successfully ===');
    } catch (error) {
        console.error('Error testing Ethereum connection:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
