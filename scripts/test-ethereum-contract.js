// Test Ethereum contract deployment and interaction
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Simple storage contract ABI and bytecode
const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "retrieve",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "num", "type": "uint256" }],
        "name": "store",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Simple storage contract bytecode (compiled from Solidity)
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220322c78243e61b783558509c9cc22cb8493dde6925aa5e89a08cdf6e22f279ef164736f6c63430008120033";

async function main() {
    console.log('=== Testing Ethereum Contract Deployment and Interaction ===\n');

    try {
        // Create a provider for the Sepolia testnet
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia.publicnode.com');
        console.log('Provider connected to Sepolia testnet');

        // Check if we have a private key in the environment
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
        if (!privateKey) {
            console.log('No private key found in environment variables.');
            console.log('Using a random wallet for demonstration (cannot send transactions)');

            // Create a random wallet for demonstration
            const wallet = ethers.Wallet.createRandom().connect(provider);
            console.log('Wallet address:', wallet.address);

            // Create a contract factory
            const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
            console.log('Contract factory created');

            // Estimate gas for deployment (this will work even without funds)
            try {
                const deploymentData = factory.getDeployTransaction();
                const gasEstimate = await provider.estimateGas(deploymentData);
                console.log('Estimated gas for deployment:', gasEstimate.toString());
            } catch (error) {
                console.log('Could not estimate gas:', error.message);
            }

            console.log('\nTo deploy contracts, add a private key to your .env file:');
            console.log('DEPLOYER_PRIVATE_KEY=your_private_key_here');

            // Check for existing contracts
            if (process.env.TKN_TOKEN_ADDRESS) {
                console.log('\nFound existing contract address:', process.env.TKN_TOKEN_ADDRESS);
                const contract = new ethers.Contract(process.env.TKN_TOKEN_ADDRESS, CONTRACT_ABI, provider);
                console.log('Contract instance created');
            }
        } else {
            // Create a wallet with the private key
            const wallet = new ethers.Wallet(privateKey, provider);
            console.log('Wallet address:', wallet.address);

            // Get wallet balance
            const balance = await provider.getBalance(wallet.address);
            console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');

            if (balance === 0n) {
                console.log('Wallet has no ETH. Cannot deploy contract.');
                console.log('Please fund your wallet with Sepolia ETH from a faucet.');
                return;
            }

            // Create a contract factory
            const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, wallet);
            console.log('Contract factory created');

            // Deploy the contract
            console.log('Deploying contract...');
            const contract = await factory.deploy();
            console.log('Contract deployment transaction sent:', contract.deploymentTransaction().hash);

            // Wait for the contract to be deployed
            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();
            console.log('Contract deployed to:', contractAddress);

            // Interact with the contract
            console.log('\nTesting contract interaction:');

            // Store a value
            const storeValue = 42;
            console.log(`Storing value: ${storeValue}`);
            const storeTx = await contract.store(storeValue);
            await storeTx.wait();
            console.log('Store transaction confirmed:', storeTx.hash);

            // Retrieve the value
            const retrievedValue = await contract.retrieve();
            console.log('Retrieved value:', retrievedValue.toString());

            if (Number(retrievedValue) === storeValue) {
                console.log('Contract interaction successful!');
            } else {
                console.log('Contract interaction failed: retrieved value does not match stored value');
            }
        }

        console.log('\n=== Ethereum Contract Test Completed Successfully ===');
    } catch (error) {
        console.error('Error testing Ethereum contract:', error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
