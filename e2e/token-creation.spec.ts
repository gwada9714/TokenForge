import { test, expect } from '@playwright/test';

/**
 * Tests end-to-end pour le flux de création de token
 * Ces tests vérifient l'intégration complète entre les différents services et composants
 */
test.describe('Flux de création de token', () => {
  // Avant chaque test, se connecter à l'application
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Se connecter avec un compte de test
    await page.click('text=Connexion');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Se connecter")');
    
    // Vérifier que la connexion a réussi
    await expect(page.locator('.user-profile')).toBeVisible();
  });
  
  test('devrait créer un token standard avec succès', async ({ page }) => {
    // Naviguer vers la page de création de token
    await page.click('text=Créer un Token');
    
    // Étape 1: Informations de base
    await page.fill('input[name="tokenName"]', 'Test Token');
    await page.fill('input[name="tokenSymbol"]', 'TEST');
    await page.selectOption('select[name="tokenDecimals"]', '18');
    await page.fill('input[name="tokenSupply"]', '1000000');
    await page.click('button:has-text("Suivant")');
    
    // Étape 2: Fonctionnalités
    await page.check('input[name="features.burnable"]');
    await page.check('input[name="features.mintable"]');
    await page.click('button:has-text("Suivant")');
    
    // Étape 3: Blockchain
    await page.selectOption('select[name="blockchain"]', 'ethereum');
    await page.click('button:has-text("Suivant")');
    
    // Étape 4: Paiement
    await page.waitForSelector('text=Frais de création');
    await page.click('button:has-text("Payer maintenant")');
    
    // Simuler la connexion du wallet
    await page.evaluate(() => {
      // Simuler window.ethereum
      window.ethereum = {
        request: async ({ method, params }: any) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_sendTransaction') {
            return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
          }
          return null;
        },
        on: () => {},
        removeListener: () => {}
      };
    });
    
    // Confirmer le paiement
    await page.click('button:has-text("Confirmer")');
    
    // Attendre la confirmation du paiement
    await page.waitForSelector('text=Paiement confirmé', { timeout: 10000 });
    
    // Étape 5: Déploiement
    await page.click('button:has-text("Déployer")');
    
    // Attendre le déploiement
    await page.waitForSelector('text=Token déployé avec succès', { timeout: 30000 });
    
    // Vérifier que l'adresse du contrat est affichée
    await expect(page.locator('text=Adresse du contrat')).toBeVisible();
    
    // Vérifier que le bouton pour voir les détails est disponible
    await expect(page.locator('button:has-text("Voir les détails")')).toBeVisible();
    
    // Naviguer vers les détails du token
    await page.click('button:has-text("Voir les détails")');
    
    // Vérifier que les détails du token sont affichés
    await expect(page.locator('h1:has-text("Test Token")')).toBeVisible();
    await expect(page.locator('text=TEST')).toBeVisible();
    await expect(page.locator('text=1,000,000')).toBeVisible();
  });
  
  test('devrait créer un token avec taxes', async ({ page }) => {
    // Naviguer vers la page de création de token
    await page.click('text=Créer un Token');
    
    // Étape 1: Informations de base
    await page.fill('input[name="tokenName"]', 'Tax Token');
    await page.fill('input[name="tokenSymbol"]', 'TAX');
    await page.selectOption('select[name="tokenDecimals"]', '18');
    await page.fill('input[name="tokenSupply"]', '1000000');
    await page.click('button:has-text("Suivant")');
    
    // Étape 2: Fonctionnalités
    await page.check('input[name="features.taxable"]');
    
    // Configurer les taxes
    await page.fill('input[name="taxConfig.buyTax"]', '5');
    await page.fill('input[name="taxConfig.sellTax"]', '5');
    await page.fill('input[name="taxConfig.transferTax"]', '2');
    
    // Configurer la répartition des taxes
    await page.fill('input[name="taxConfig.liquidityShare"]', '50');
    await page.fill('input[name="taxConfig.marketingShare"]', '30');
    await page.fill('input[name="taxConfig.devShare"]', '20');
    
    await page.click('button:has-text("Suivant")');
    
    // Étape 3: Blockchain
    await page.selectOption('select[name="blockchain"]', 'binance');
    await page.click('button:has-text("Suivant")');
    
    // Étape 4: Paiement
    await page.waitForSelector('text=Frais de création');
    await page.click('button:has-text("Payer maintenant")');
    
    // Simuler la connexion du wallet
    await page.evaluate(() => {
      // Simuler window.ethereum
      window.ethereum = {
        request: async ({ method, params }: any) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_sendTransaction') {
            return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
          }
          return null;
        },
        on: () => {},
        removeListener: () => {}
      };
    });
    
    // Confirmer le paiement
    await page.click('button:has-text("Confirmer")');
    
    // Attendre la confirmation du paiement
    await page.waitForSelector('text=Paiement confirmé', { timeout: 10000 });
    
    // Étape 5: Déploiement
    await page.click('button:has-text("Déployer")');
    
    // Attendre le déploiement
    await page.waitForSelector('text=Token déployé avec succès', { timeout: 30000 });
    
    // Vérifier que l'adresse du contrat est affichée
    await expect(page.locator('text=Adresse du contrat')).toBeVisible();
    
    // Vérifier que les taxes sont correctement configurées
    await page.click('button:has-text("Voir les détails")');
    await expect(page.locator('text=Taxe d\'achat: 5%')).toBeVisible();
    await expect(page.locator('text=Taxe de vente: 5%')).toBeVisible();
    await expect(page.locator('text=Taxe de transfert: 2%')).toBeVisible();
  });
  
  test('devrait afficher une erreur en cas d\'échec du paiement', async ({ page }) => {
    // Naviguer vers la page de création de token
    await page.click('text=Créer un Token');
    
    // Étape 1: Informations de base
    await page.fill('input[name="tokenName"]', 'Failed Token');
    await page.fill('input[name="tokenSymbol"]', 'FAIL');
    await page.selectOption('select[name="tokenDecimals"]', '18');
    await page.fill('input[name="tokenSupply"]', '1000000');
    await page.click('button:has-text("Suivant")');
    
    // Étape 2: Fonctionnalités
    await page.check('input[name="features.burnable"]');
    await page.click('button:has-text("Suivant")');
    
    // Étape 3: Blockchain
    await page.selectOption('select[name="blockchain"]', 'ethereum');
    await page.click('button:has-text("Suivant")');
    
    // Étape 4: Paiement
    await page.waitForSelector('text=Frais de création');
    await page.click('button:has-text("Payer maintenant")');
    
    // Simuler la connexion du wallet avec échec de transaction
    await page.evaluate(() => {
      // Simuler window.ethereum
      window.ethereum = {
        request: async ({ method, params }: any) => {
          if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          if (method === 'eth_sendTransaction') {
            throw new Error('Transaction rejected');
          }
          return null;
        },
        on: () => {},
        removeListener: () => {}
      };
    });
    
    // Confirmer le paiement
    await page.click('button:has-text("Confirmer")');
    
    // Vérifier que l'erreur est affichée
    await expect(page.locator('text=Erreur lors du paiement')).toBeVisible();
    await expect(page.locator('text=Transaction rejected')).toBeVisible();
    
    // Vérifier que le bouton pour réessayer est disponible
    await expect(page.locator('button:has-text("Réessayer")')).toBeVisible();
  });
});

/**
 * Tests pour le marketplace de templates
 */
test.describe('Marketplace de templates', () => {
  // Avant chaque test, se connecter à l'application
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page d'accueil
    await page.goto('/');
    
    // Se connecter avec un compte de test
    await page.click('text=Connexion');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Se connecter")');
    
    // Naviguer vers le marketplace
    await page.click('text=Marketplace');
  });
  
  test('devrait afficher les templates disponibles', async ({ page }) => {
    // Vérifier que les templates sont affichés
    await expect(page.locator('.template-card')).toHaveCount.atLeast(3);
    
    // Vérifier que les filtres sont disponibles
    await expect(page.locator('text=Filtrer par')).toBeVisible();
    await expect(page.locator('select[name="category"]')).toBeVisible();
    await expect(page.locator('select[name="blockchain"]')).toBeVisible();
  });
  
  test('devrait filtrer les templates par catégorie', async ({ page }) => {
    // Sélectionner la catégorie Premium
    await page.selectOption('select[name="category"]', 'premium');
    
    // Vérifier que seuls les templates premium sont affichés
    await expect(page.locator('.template-card')).toHaveCount.atLeast(1);
    await expect(page.locator('.template-card:has-text("BASIC")')).toHaveCount(0);
  });
  
  test('devrait acheter un template et l\'utiliser', async ({ page }) => {
    // Sélectionner un template gratuit
    await page.click('.template-card:has-text("Standard ERC-20 Token")');
    
    // Vérifier les détails du template
    await expect(page.locator('h1:has-text("Standard ERC-20 Token")')).toBeVisible();
    await expect(page.locator('text=Gratuit')).toBeVisible();
    
    // Utiliser le template
    await page.click('button:has-text("Utiliser ce template")');
    
    // Vérifier que nous sommes redirigés vers la page de création de token
    // avec les champs pré-remplis
    await expect(page.url()).toContain('/create-token');
    await expect(page.locator('input[name="tokenName"]')).toHaveValue('');
    await expect(page.locator('input[name="tokenSymbol"]')).toHaveValue('');
    
    // Vérifier que les fonctionnalités du template sont sélectionnées
    await expect(page.locator('input[name="features.transferable"]')).toBeChecked();
    await expect(page.locator('input[name="features.mintable"]')).toBeChecked();
    await expect(page.locator('input[name="features.burnable"]')).toBeChecked();
  });
});
