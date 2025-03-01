import * as admin from 'firebase-admin';
const serviceAccount = require('path/to/tokenforge-4028e-firebase-adminsdk-obyl4-62ec2799d3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tokenforge-4028e.firebaseio.com" // Remplacez par l'URL de votre base de données
});

export default admin; 