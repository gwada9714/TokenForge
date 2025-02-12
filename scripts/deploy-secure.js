import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

// Charger les variables d'environnement
dotenv.config();

const LOG_LEVELS = {
  INFO: '\x1b[32m%s\x1b[0m',    // Vert
  WARNING: '\x1b[33m%s\x1b[0m',  // Jaune
  ERROR: '\x1b[31m%s\x1b[0m'     // Rouge
};

async function runSecurityChecks() {
  try {
    console.log('\nRunning pre-deployment security checks...');
    
    // Exécuter les vérifications de sécurité
    const { stdout: securityOutput } = await execAsync('npm run security-check');
    console.log(securityOutput);

    // Vérifier les dépendances
    console.log('\nChecking dependencies for vulnerabilities...');
    const { stdout: auditOutput } = await execAsync('npm audit --production');
    console.log(auditOutput);

    // Vérifier le build
    console.log('\nRunning production build check...');
    const { stdout: buildOutput } = await execAsync('npm run build');
    console.log(buildOutput);

    return true;
  } catch (error) {
    console.error(LOG_LEVELS.ERROR, 'Security checks failed:', error.message);
    return false;
  }
}

async function backupConfig() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups', timestamp);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // Sauvegarder les fichiers de configuration
    const configFiles = [
      'firestore.rules',
      'firebase.json',
      'src/config/firebase.ts',
      'src/config/csp.ts'
    ];

    for (const file of configFiles) {
      const sourcePath = path.join(__dirname, '..', file);
      const targetPath = path.join(backupDir, path.basename(file));
      
      try {
        await fs.copyFile(sourcePath, targetPath);
        console.log(LOG_LEVELS.INFO, `Backed up ${file}`);
      } catch (error) {
        console.warn(LOG_LEVELS.WARNING, `Failed to backup ${file}:`, error.message);
      }
    }

    return backupDir;
  } catch (error) {
    console.error(LOG_LEVELS.ERROR, 'Backup failed:', error.message);
    return null;
  }
}

async function deploy() {
  try {
    // Vérifier l'environnement
    if (process.env.VITE_ENV !== 'production') {
      throw new Error('Deployment can only be run in production environment');
    }

    // Exécuter les vérifications de sécurité
    const securityChecksPassed = await runSecurityChecks();
    if (!securityChecksPassed) {
      throw new Error('Security checks failed. Deployment aborted.');
    }

    // Créer une sauvegarde
    const backupDir = await backupConfig();
    if (!backupDir) {
      throw new Error('Backup failed. Deployment aborted.');
    }

    console.log('\nStarting deployment...');

    // Déployer les règles Firestore
    console.log('\nDeploying Firestore rules...');
    await execAsync('firebase deploy --only firestore:rules');

    // Déployer les fonctions
    console.log('\nDeploying functions...');
    await execAsync('firebase deploy --only functions');

    // Déployer l'application
    console.log('\nDeploying hosting...');
    await execAsync('firebase deploy --only hosting');

    console.log(LOG_LEVELS.INFO, '\nDeployment completed successfully!');
    console.log(LOG_LEVELS.INFO, `Backup created at: ${backupDir}`);

  } catch (error) {
    console.error(LOG_LEVELS.ERROR, 'Deployment failed:', error.message);
    process.exit(1);
  }
}

// Lancer le déploiement
deploy().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
