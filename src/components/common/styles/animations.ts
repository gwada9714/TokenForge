import { keyframes } from "styled-components";

// Animation de forge incandescente
export const forgeGlow = keyframes`
  0% { box-shadow: 0 0 5px rgba(217, 119, 6, 0.2); }
  50% { box-shadow: 0 0 20px rgba(217, 119, 6, 0.4); }
  100% { box-shadow: 0 0 5px rgba(217, 119, 6, 0.2); }
`;

// Animation de particules de forge
export const forgeSpark = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-20px) scale(0); opacity: 0; }
`;

// Animation d'apparition progressive
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Animation de hover
export const hover = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0); }
`;

// Animation de rotation pour les icônes de chargement
export const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
