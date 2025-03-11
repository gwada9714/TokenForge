import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LaunchpadPage } from '../../src/components/features/launchpad/LaunchpadPage';
import { useNetwork } from '../../src/hooks/useNetwork';
import { useLiquidityManager } from '../../src/hooks/useLiquidityManager';

// Mock des hooks
vi.mock('../../src/hooks/useNetwork', () => ({
  useNetwork: vi.fn()
}));

vi.mock('../../src/hooks/useLiquidityManager', () => ({
  useLiquidityManager: vi.fn()
}));

// Mock des composants enfants
vi.mock('../../src/components/features/launchpad/LaunchpadForm', () => ({
  LaunchpadForm: vi.fn().mockImplementation(({ contractAddress }) => (
    <div data-testid="launchpad-form">
      Launchpad Form Component (Contract: {contractAddress})
    </div>
  ))
}));

vi.mock('../../src/components/features/launchpad/AutoLiquidityManager', () => ({
  AutoLiquidityManager: vi.fn().mockImplementation(() => (
    <div data-testid="liquidity-manager">
      Auto Liquidity Manager Component
    </div>
  ))
}));

vi.mock('../../src/components/shared/NetworkNotSupported', () => ({
  NetworkNotSupported: vi.fn().mockImplementation(({ message }) => (
    <div data-testid="network-not-supported">{message}</div>
  ))
}));

describe('LaunchpadPage Component', () => {
  // Configuration par défaut pour le mock de useNetwork
  const setupMockNetwork = (overrides = {}) => {
    const defaultNetwork = {
      chain: {
        id: 11155111,
        name: 'Sepolia'
      }
    };
    
    return {
      ...defaultNetwork,
      ...overrides
    };
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    
    // Configuration par défaut du hook useLiquidityManager
    (useLiquidityManager as any).mockReturnValue({
      userTokens: [],
      userLiquiditySettings: {},
      liquidityStatus: {},
      isLoading: false,
      setupAutomaticLiquidity: vi.fn(),
      modifyLiquiditySettings: vi.fn(),
      triggerRebalance: vi.fn()
    });
    
    // Ajouter les variables d'environnement nécessaires
    process.env.VITE_LAUNCHPAD_CONTRACT_SEPOLIA = '0xSepoliaContractAddress';
    process.env.VITE_LAUNCHPAD_CONTRACT_MAINNET = '0xMainnetContractAddress';
    process.env.VITE_LAUNCHPAD_CONTRACT_LOCAL = '0xLocalContractAddress';
  });
  
  it('renders the component with network connected', () => {
    // Configurer le mock useNetwork
    (useNetwork as any).mockReturnValue(setupMockNetwork());
    
    // Rendu du composant
    render(<LaunchpadPage />);
    
    // Vérification du titre
    expect(screen.getByText(/Plateforme de Lancement et Gestion de Liquidité/i)).toBeInTheDocument();
    
    // Vérification des onglets
    expect(screen.getByText(/Créer un Lancement/i)).toBeInTheDocument();
    expect(screen.getByText(/Gestionnaire de Liquidité Automatique/i)).toBeInTheDocument();
    
    // Par défaut, l'onglet de lancement est affiché
    expect(screen.getByTestId('launchpad-form')).toBeInTheDocument();
    expect(screen.queryByTestId('liquidity-manager')).not.toBeInTheDocument();
  });
  
  it('shows a warning when wallet is not connected', () => {
    // Configurer le mock useNetwork sans chain
    (useNetwork as any).mockReturnValue({ chain: null });
    
    // Rendu du composant
    render(<LaunchpadPage />);
    
    // Vérification du message d'avertissement
    expect(screen.getByText(/Please connect your wallet to continue/i)).toBeInTheDocument();
  });
  
  it('shows network not supported message on unsupported networks', () => {
    // Configurer le mock useNetwork avec un réseau non supporté
    (useNetwork as any).mockReturnValue({
      chain: {
        id: 137,
        name: 'Polygon'
      }
    });
    
    // Rendu du composant
    render(<LaunchpadPage />);
    
    // Vérification du message
    expect(screen.getByTestId('network-not-supported')).toBeInTheDocument();
    expect(screen.getByText(/Launchpad is not available on Polygon/i)).toBeInTheDocument();
  });
  
  it('switches between launch and liquidity manager tabs', () => {
    // Configurer le mock useNetwork
    (useNetwork as any).mockReturnValue(setupMockNetwork());
    
    // Rendu du composant
    render(<LaunchpadPage />);
    
    // Par défaut, l'onglet de lancement est affiché
    expect(screen.getByTestId('launchpad-form')).toBeInTheDocument();
    expect(screen.queryByTestId('liquidity-manager')).not.toBeInTheDocument();
    
    // Cliquer sur l'onglet du gestionnaire de liquidité
    fireEvent.click(screen.getByText(/Gestionnaire de Liquidité Automatique/i));
    
    // Vérifier que le composant de gestion de liquidité est maintenant affiché
    expect(screen.queryByTestId('launchpad-form')).not.toBeInTheDocument();
    expect(screen.getByTestId('liquidity-manager')).toBeInTheDocument();
    
    // Revenir à l'onglet de lancement
    fireEvent.click(screen.getByText(/Créer un Lancement/i));
    
    // Vérifier que le composant de lancement est à nouveau affiché
    expect(screen.getByTestId('launchpad-form')).toBeInTheDocument();
    expect(screen.queryByTestId('liquidity-manager')).not.toBeInTheDocument();
  });
  
  it('passes the correct contract address to LaunchpadForm based on network', () => {
    // Test pour Sepolia
    (useNetwork as any).mockReturnValue(setupMockNetwork({ chain: { id: 11155111, name: 'Sepolia' } }));
    const { unmount, getByText } = render(<LaunchpadPage />);
    expect(getByText(/0xSepoliaContractAddress/i)).toBeInTheDocument();
    unmount();
    
    // Test pour Mainnet
    (useNetwork as any).mockReturnValue(setupMockNetwork({ chain: { id: 1, name: 'Ethereum' } }));
    const { unmount: unmount2, getByText: getByText2 } = render(<LaunchpadPage />);
    expect(getByText2(/0xMainnetContractAddress/i)).toBeInTheDocument();
    unmount2();
    
    // Test pour Local
    (useNetwork as any).mockReturnValue(setupMockNetwork({ chain: { id: 31337, name: 'Localhost' } }));
    const { getByText: getByText3 } = render(<LaunchpadPage />);
    expect(getByText3(/0xLocalContractAddress/i)).toBeInTheDocument();
  });
});
