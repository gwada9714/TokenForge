// Test Ethereum functionality using viem with Hardhat local network
import { createPublicClient, http, createWalletClient, parseEther } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test private key (only for local testing)
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

async function main() {
    console.log('=== Testing Ethereum Connection with viem ===\n');

    try {
        // Use Hardhat's local network
        const rpcUrl = 'http://127.0.0.1:8545';
        console.log(`Using Hardhat local network at: ${rpcUrl}`);

        // Create a public client
        const publicClient = createPublicClient({
            chain: hardhat,
            transport: http(rpcUrl),
        });

        // Create a wallet client for testing transactions
        const account = privateKeyToAccount(TEST_PRIVATE_KEY);
        const walletClient = createWalletClient({
            account,
            chain: hardhat,
            transport: http(rpcUrl),
        });

        console.log(`Test account address: ${account.address}`);

        // Get chain ID
        const chainId = await publicClient.getChainId();
        console.log(`Connected to chain ID: ${chainId}`);

        // Get latest block number
        const blockNumber = await publicClient.getBlockNumber();
        console.log(`Latest block number: ${blockNumber}`);

        // Get latest block
        const block = await publicClient.getBlock();
        console.log(`Latest block hash: ${block.hash}`);
        console.log(`Latest block timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`);
        console.log(`Transactions in latest block: ${block.transactions.length}`);

        // Get gas price
        const gasPrice = await publicClient.getGasPrice();
        console.log(`Current gas price: ${gasPrice} wei`);

        // Test a simple transaction
        console.log('\nTesting a simple transaction...');
        try {
            const hash = await walletClient.sendTransaction({
                to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Another Hardhat test account
                value: parseEther('0.01'),
            });

            console.log(`Transaction sent: ${hash}`);

            // Get transaction receipt
            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
            console.log(`Transaction status: ${receipt.status === 'success' ? 'Success' : 'Failed'}`);
        } catch (txError) {
            console.log('Transaction failed. Is Hardhat node running?');
            console.log('Try running: npx hardhat node');
            console.error(txError);
        }

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
