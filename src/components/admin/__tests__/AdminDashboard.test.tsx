import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDashboard } from '../AdminDashboard';

// Mock des composants enfants
jest.mock('../ContractControls', () => ({
  ContractControls: () => <div data-testid="contract-controls">Contract Controls</div>,
}));

jest.mock('../OwnershipManagement', () => ({
  OwnershipManagement: () => <div data-testid="ownership-management">Ownership Management</div>,
}));

jest.mock('../AlertsManagement', () => ({
  AlertsManagement: () => <div data-testid="alerts-management">Alerts Management</div>,
}));

jest.mock('../AuditStats', () => ({
  AuditStats: () => <div data-testid="audit-stats">Audit Stats</div>,
}));

jest.mock('../AuditLogs', () => ({
  AuditLogs: () => <div data-testid="audit-logs">Audit Logs</div>,
}));

describe('AdminDashboard', () => {
  it('renders the header', () => {
    render(<AdminDashboard />);
    expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
  });

  it('shows ContractControls by default', () => {
    render(<AdminDashboard />);
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<AdminDashboard />);

    // Vérifier le contenu initial
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();

    // Cliquer sur l'onglet "Gestion de la propriété"
    fireEvent.click(screen.getByText('Gestion de la propriété'));
    expect(screen.getByTestId('ownership-management')).toBeInTheDocument();

    // Cliquer sur l'onglet "Alertes"
    fireEvent.click(screen.getByText('Alertes'));
    expect(screen.getByTestId('alerts-management')).toBeInTheDocument();

    // Cliquer sur l'onglet "Logs & Statistiques"
    fireEvent.click(screen.getByText('Logs & Statistiques'));
    expect(screen.getByTestId('audit-stats')).toBeInTheDocument();
    expect(screen.getByTestId('audit-logs')).toBeInTheDocument();
  });

  it('maintains tab state when switching', () => {
    render(<AdminDashboard />);

    // Aller à l'onglet Alertes
    fireEvent.click(screen.getByText('Alertes'));
    expect(screen.getByTestId('alerts-management')).toBeInTheDocument();

    // Revenir à l'onglet Contract Controls
    fireEvent.click(screen.getByText('Contrôle du contrat'));
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();

    // Les autres composants ne devraient pas être visibles
    expect(screen.queryByTestId('alerts-management')).not.toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<AdminDashboard />);
    
    // Vérifier la structure de base
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    
    // Vérifier que le container existe
    expect(container.firstChild).toHaveClass('MuiContainer-root');
  });
});
