import React from 'react';

/**
 * Version simplifiée de SEOHead qui ne dépend pas de react-helmet-async
 * pour le mode diagnostic
 */
interface DiagnosticSEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  children?: React.ReactNode;
}

export const DiagnosticSEOHead: React.FC<DiagnosticSEOHeadProps> = ({
  title = 'TokenForge - Mode Diagnostic',
  description = 'TokenForge en mode diagnostic sans dépendances',
  children
}) => {
  // En mode diagnostic, nous ne modifions pas réellement le titre de la page
  // pour éviter les dépendances à react-helmet-async
  console.log(`[DiagnosticSEOHead] Titre simulé: ${title}`);
  console.log(`[DiagnosticSEOHead] Description simulée: ${description}`);
  
  // Rendu sans effet réel sur le HEAD du document
  return <>{children}</>;
};

// Exporter comme composant SEOHead par défaut pour les tests
export { DiagnosticSEOHead as SEOHead };
