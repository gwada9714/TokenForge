import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin pour le fichier .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log('Chemin du fichier .env:', envPath);
const envExists = dotenv.config({ path: envPath });
console.log('Le fichier .env existe:', envExists.error === undefined);

// Vérification de la présence de PRIVATE_KEY
console.log('PRIVATE_KEY est défini:', process.env.PRIVATE_KEY !== undefined);

// Adresse du contrat déployé
const CONTRACT_ADDRESS = '0x9329fbad313f51f7dc01f0419947fcacd1beb40c';

// Configuration du client
const transport = http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

const publicClient = createPublicClient({
  chain: sepolia,
  transport,
});

// Configuration du wallet
const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport,
});

// ABI minimal pour les fonctions dont nous avons besoin
const abi = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "address"}],
    "name": "balanceOf",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"type": "bool"}],
    "type": "function"
  },
  {
    "inputs": [
      {"type": "address"},
      {"type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "burn",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "type": "function"
  },
  {
    "inputs": [{"type": "bytes32"}, {"type": "address"}],
    "name": "hasRole",
    "outputs": [{"type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function main() {
  try {
    console.log('\n=== Test du token ERC20 ===\n');

    // Vérifier si nous avons le rôle DEFAULT_ADMIN_ROLE
    const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const hasAdminRole = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'hasRole',
      args: [DEFAULT_ADMIN_ROLE, account.address],
    });
    
    console.log('A le rôle admin:', hasAdminRole);
    
    if (!hasAdminRole) {
      console.error('ERREUR: Nous n\'avons pas le rôle admin');
      return;
    }

    // 1. Lecture des informations de base
    const name = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'name',
    });
    const symbol = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'symbol',
    });
    const decimals = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'decimals',
    });
    const totalSupply = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'totalSupply',
    });
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'balanceOf',
      args: [account.address],
    });

    console.log('Informations du token:');
    console.log('- Nom:', name);
    console.log('- Symbole:', symbol);
    console.log('- Décimales:', decimals);
    console.log('- Supply totale:', totalSupply);
    console.log('- Balance du compte:', balance);

    // 2. Test du mint
    console.log('\nTest du mint...');
    const mintAmount = 1000000000000000000n; // 1 token
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'mint',
        args: [account.address, mintAmount],
      });
      console.log('Transaction de mint effectuée:', hash);

      // Attendre la confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000,
      });
      console.log('Transaction de mint confirmée dans le bloc:', receipt.blockNumber);

    } catch (error) {
      console.error('Erreur lors du mint:', error);
      return;
    }

    // 3. Test de pause
    console.log('\nTest de pause...');
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'pause',
      });
      console.log('Transaction de pause effectuée:', hash);

      // Attendre la confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000,
      });
      console.log('Transaction de pause confirmée dans le bloc:', receipt.blockNumber);

    } catch (error) {
      console.error('Erreur lors de la pause:', error);
      return;
    }

    // Vérifier l'état de pause
    const isPaused = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'paused',
    });
    console.log('Le contrat est en pause:', isPaused);

    // 4. Test de unpause
    console.log('\nTest de unpause...');
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'unpause',
      });
      console.log('Transaction de unpause effectuée:', hash);

      // Attendre la confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000,
      });
      console.log('Transaction de unpause confirmée dans le bloc:', receipt.blockNumber);

    } catch (error) {
      console.error('Erreur lors du unpause:', error);
      return;
    }

    // 5. Test du burn
    console.log('\nTest du burn...');
    try {
      const burnAmount = 500000000000000000n; // 0.5 token
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'burn',
        args: [burnAmount],
      });
      console.log('Transaction de burn effectuée:', hash);

      // Attendre la confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000,
      });
      console.log('Transaction de burn confirmée dans le bloc:', receipt.blockNumber);

    } catch (error) {
      console.error('Erreur lors du burn:', error);
      return;
    }

    // Vérifier la nouvelle balance
    const newBalance = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'balanceOf',
      args: [account.address],
    });
    console.log('\nNouvelle balance après les opérations:', newBalance);

    console.log('\nTous les tests ont été effectués avec succès !');

  } catch (error) {
    console.error('Erreur lors des tests:', error);
  }
}

main();
