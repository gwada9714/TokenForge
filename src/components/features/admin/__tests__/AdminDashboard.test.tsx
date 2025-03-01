import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import AdminDashboard from '../AdminDashboard';

// Mock des composants enfants
vi.mock('../ContractControls', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="contract-controls">Contract Controls</div>
  };
});

vi.mock('../OwnershipManagement', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="ownership-management">Ownership Management</div>
  };
});

vi.mock('../AlertsManagement', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="alerts-management">Alerts Management</div>
  };
});

vi.mock('../AuditLogs', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="audit-logs">Audit Logs</div>
  };
});

vi.mock('../audit/AuditStats', () => ({
  AuditStats: (): React.ReactElement => <div data-testid="audit-stats">Audit Stats</div>,
}));

vi.mock('../AdminHeader', () => ({
  AdminHeader: (): React.ReactElement => <div data-testid="admin-header">Admin Header</div>,
}));

vi.mock('../AdminTabs', () => ({
  AdminTabs: ({ value, onChange }: { value: number; onChange: (event: React.SyntheticEvent, value: number) => void }): React.ReactElement => (
    <div data-testid="admin-tabs" onClick={(e) => onChange(e, value + 1)}>
      Admin Tabs (Current: {value})
    </div>
  ),
}));

describe('AdminDashboard', () => {
  it('renders all tabs correctly', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Contract Controls')).toBeTruthy();
    expect(screen.getByText('Ownership')).toBeTruthy();
    expect(screen.getByText('Alerts')).toBeTruthy();
    expect(screen.getByText('Audit Logs')).toBeTruthy();
  });

  it('switches between tabs correctly', () => {
    render(<AdminDashboard />);
    
    // Par défaut, le premier onglet devrait être visible
    expect(screen.getByTestId('contract-controls')).toBeTruthy();
    
    // Cliquer sur l'onglet Ownership
    fireEvent.click(screen.getByText('Ownership'));
    expect(screen.getByTestId('ownership-management')).toBeTruthy();
    
    // Cliquer sur l'onglet Alerts
    fireEvent.click(screen.getByText('Alerts'));
    expect(screen.getByTestId('alerts-management')).toBeTruthy();
    
    // Cliquer sur l'onglet Audit Logs
    fireEvent.click(screen.getByText('Audit Logs'));
    expect(screen.getByTestId('audit-logs')).toBeTruthy();
  });

  it('shows error message when triggered', async () => {
    render(<AdminDashboard />);
    
    // Simuler une erreur
    fireEvent.click(screen.getByTestId('contract-controls'));
    
    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('maintains tab state when switching', () => {
    render(<AdminDashboard />);
    
    // Aller à l'onglet Audit Logs
    fireEvent.click(screen.getByText('Audit Logs'));
    expect(screen.getByTestId('audit-logs')).toBeTruthy();
    
    // Revenir à l'onglet Contract Controls
    fireEvent.click(screen.getByText('Contract Controls'));
    expect(screen.getByTestId('contract-controls')).toBeTruthy();
  });
});
