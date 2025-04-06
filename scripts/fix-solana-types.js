/**
 * Script pour résoudre les problèmes de typage TypeScript dans l'adaptateur Solana
 * Ce script crée un fichier de déclaration de types pour étendre les types de @solana/web3.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Obtenir le répertoire courant en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour les logs
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Fonction pour logger avec couleur
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Chemin vers le répertoire des types
const typesDir = path.join(path.resolve(__dirname, ".."), "src", "types");
const solanaTypesPath = path.join(typesDir, "solana.d.ts");

// Créer le répertoire des types s'il n'existe pas
if (!fs.existsSync(typesDir)) {
  log(`Création du répertoire ${typesDir}`, colors.yellow);
  fs.mkdirSync(typesDir, { recursive: true });
}

// Contenu du fichier de déclaration de types
const typesContent = `/**
 * Déclarations de types pour étendre les types de @solana/web3.js
 * Ces déclarations résolvent les problèmes de typage dans l'adaptateur Solana
 */

// Étendre les types de @solana/web3.js
declare module '@solana/web3.js' {
  // Ajouter les méthodes manquantes à Connection
  interface Connection {
    getBalance(publicKey: PublicKey): Promise<number>;
    getVersion(): Promise<any>;
    simulateTransaction(transaction: Transaction): Promise<{ value: any }>;
    getSlot(): Promise<number>;
    getMinimumBalanceForRentExemption(size: number): Promise<number>;
    getSignatureStatus(signature: string): Promise<{ value: any }>;
    getSignaturesForAddress(address: PublicKey): Promise<Array<{ signature: string }>>;
  }

  // Exporter les classes et constantes manquantes
  export class Transaction {
    add(instruction: any): Transaction;
    recentBlockhash: string;
    feePayer: PublicKey;
  }

  export class SystemProgram {
    static transfer(params: {
      fromPubkey: PublicKey;
      toPubkey: PublicKey;
      lamports: number;
    }): any;
  }

  export function sendAndConfirmTransaction(
    connection: Connection,
    transaction: Transaction,
    signers: Array<any>
  ): Promise<string>;

  export function clusterApiUrl(cluster: string): string;

  export const LAMPORTS_PER_SOL: number;
}

// Étendre les types de TokenInfo pour inclure les propriétés spécifiques à Solana
interface TokenInfo {
  mintAuthority?: string;
  freezeAuthority?: string;
  isInitialized?: boolean;
}

// Étendre les types pour @solana/spl-token
declare module '@solana/spl-token' {
  export function createMint(
    connection: any,
    payer: any,
    mintAuthority: any,
    freezeAuthority: any,
    decimals: number
  ): Promise<any>;

  export function getOrCreateAssociatedTokenAccount(
    connection: any,
    payer: any,
    mint: any,
    owner: any
  ): Promise<{ address: any }>;

  export function mintTo(
    connection: any,
    payer: any,
    mint: any,
    destination: any,
    authority: any,
    amount: number
  ): Promise<any>;

  export function transfer(
    connection: any,
    payer: any,
    source: any,
    destination: any,
    owner: any,
    amount: number
  ): Promise<any>;

  export function getMint(
    connection: any,
    mint: any
  ): Promise<{
    supply: any;
    decimals: number;
    isInitialized: boolean;
    mintAuthority: any;
    freezeAuthority: any;
  }>;

  export const TOKEN_PROGRAM_ID: any;
}
`;

// Écrire le fichier de déclaration de types
try {
  fs.writeFileSync(solanaTypesPath, typesContent);
  log(
    `Fichier de déclaration de types créé avec succès: ${solanaTypesPath}`,
    colors.green
  );
} catch (error) {
  log(
    `Erreur lors de la création du fichier de déclaration de types: ${error.message}`,
    colors.red
  );
  process.exit(1);
}

// Mettre à jour tsconfig.json pour inclure le fichier de déclaration de types
const tsconfigPath = path.join(path.resolve(__dirname, ".."), "tsconfig.json");
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

    // Vérifier si le fichier est déjà inclus
    if (!tsconfig.include) {
      tsconfig.include = ["src/**/*"];
    }

    // Vérifier si les types sont déjà configurés
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }

    if (!tsconfig.compilerOptions.typeRoots) {
      tsconfig.compilerOptions.typeRoots = [
        "./node_modules/@types",
        "./src/types",
      ];
    } else if (!tsconfig.compilerOptions.typeRoots.includes("./src/types")) {
      tsconfig.compilerOptions.typeRoots.push("./src/types");
    }

    // Écrire le fichier tsconfig.json mis à jour
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
    log(`tsconfig.json mis à jour avec succès`, colors.green);
  } catch (error) {
    log(
      `Erreur lors de la mise à jour de tsconfig.json: ${error.message}`,
      colors.red
    );
  }
} else {
  log(`tsconfig.json non trouvé`, colors.yellow);
}

log(
  "Script terminé. Les problèmes de typage TypeScript dans l'adaptateur Solana devraient être résolus.",
  colors.green
);
log(
  "Pour appliquer les changements, redémarrez le serveur TypeScript ou votre IDE.",
  colors.cyan
);
