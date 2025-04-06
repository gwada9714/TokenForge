import styled from "styled-components";
import { Link } from "react-router-dom";
import { COLORS, SPACING } from "@/config/constants/theme";

/**
 * Container - Composant conteneur principal
 * Utilisé pour centrer et contraindre la largeur du contenu
 */
export const Container = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${SPACING.xl};
`;

/**
 * Title - Composant titre principal
 * Utilisé pour les titres de niveau 1 (h1)
 */
export const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${COLORS.text.primary};
  margin-bottom: ${SPACING.lg};
`;

/**
 * Subtitle - Composant sous-titre
 * Utilisé pour les titres de niveau 2 (h2)
 */
export const Subtitle = styled.h2`
  font-size: 1.25rem;
  color: ${COLORS.text.secondary};
  margin-bottom: ${SPACING.lg};
`;

/**
 * Text - Composant texte standard
 * Utilisé pour les paragraphes et le texte courant
 */
export const Text = styled.p`
  color: ${COLORS.text.secondary};
  margin-bottom: ${SPACING.md};
`;

/**
 * Button - Composant bouton standard
 * Bouton principal avec style par défaut
 */
export const Button = styled.button`
  padding: ${SPACING.sm} ${SPACING.lg};
  font-size: 1rem;
  font-weight: 500;
  color: ${COLORS.background.primary};
  background-color: var(--color-primary);
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-secondary);
  }
`;

/**
 * LinkButton - Composant lien stylisé comme un bouton
 * Utilisé pour la navigation avec l'apparence d'un bouton
 */
export const LinkButton = styled(Link)`
  padding: ${SPACING.sm} ${SPACING.lg};
  font-size: 1rem;
  font-weight: 500;
  color: ${COLORS.background.primary};
  background-color: var(--color-primary);
  border-radius: 0.375rem;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-secondary);
  }
`;
