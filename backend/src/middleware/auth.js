/**
 * Middleware d'authentification
 * Vérifie que l'utilisateur est authentifié avant d'accéder aux routes protégées
 */

/**
 * Middleware d'authentification
 * @param {Object} req Requête Express
 * @param {Object} res Réponse Express
 * @param {Function} next Fonction suivante
 */
const auth = (req, res, next) => {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }
    
    // Dans une implémentation réelle, on vérifierait le token avec JWT
    // Pour la démo, on simule un utilisateur authentifié
    
    // Simuler un utilisateur authentifié
    req.user = {
      id: 'user123',
      email: 'user@example.com',
      role: 'user',
      subscription: 'pro'
    };
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Authentification invalide' });
  }
};

/**
 * Middleware pour vérifier le rôle d'un utilisateur
 * @param {string} role Rôle requis
 * @returns {Function} Middleware
 */
const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    next();
  };
};

/**
 * Middleware pour vérifier l'abonnement d'un utilisateur
 * @param {Array} subscriptions Abonnements requis
 * @returns {Function} Middleware
 */
const checkSubscription = (subscriptions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    if (!subscriptions.includes(req.user.subscription)) {
      return res.status(403).json({ message: 'Abonnement requis' });
    }
    
    next();
  };
};

module.exports = {
  auth,
  checkRole,
  checkSubscription
};
