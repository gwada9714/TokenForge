import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ethers } from 'ethers';

interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
}

export const authenticateWallet = functions.https.onRequest(async (req, res) => {
  // Activer CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { walletAddress, signature } = req.body as WalletAuthRequest;

    // Valider l'adresse du wallet
    if (!ethers.isAddress(walletAddress)) {
      res.status(400).json({ error: 'Invalid wallet address' });
      return;
    }

    // Vérifier la signature
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `Sign this message to authenticate with TokenForge\nNonce: ${timestamp}`;
    
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Vérifier si l'utilisateur existe déjà
    let userRecord: admin.auth.UserRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(`${walletAddress.toLowerCase()}@tokenforge.eth`);
    } catch (error) {
      // Créer un nouvel utilisateur si non existant
      userRecord = await admin.auth().createUser({
        email: `${walletAddress.toLowerCase()}@tokenforge.eth`,
        emailVerified: true, // L'adresse est vérifiée par la signature
        displayName: walletAddress,
      });

      // Ajouter les claims personnalisés
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        walletAddress: walletAddress.toLowerCase(),
        lastAuthenticated: timestamp,
      });
    }

    // Générer un token personnalisé
    const token = await admin.auth().createCustomToken(userRecord.uid, {
      walletAddress: walletAddress.toLowerCase(),
    });

    // Enregistrer l'authentification dans Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      walletAddress: walletAddress.toLowerCase(),
      lastAuthenticated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});
