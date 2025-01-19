import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../AdminDashboard';

// Mock des composants enfants
jest.mock('../ContractControls', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="contract-controls">Contract Controls</div>
  };
});

jest.mock('../OwnershipManagement', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="ownership-management">Ownership Management</div>
  };
});

jest.mock('../AlertsManagement', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="alerts-management">Alerts Management</div>
  };
});

jest.mock('../AuditLogs', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="audit-logs">Audit Logs</div>
  };
});

jest.mock('../audit/AuditStats', () => ({
  AuditStats: (): React.ReactElement => <div data-testid="audit-stats">Audit Stats</div>,
}));

jest.mock('../AdminHeader', () => ({
  AdminHeader: (): React.ReactElement => <div data-testid="admin-header">Admin Header</div>,
}));

jest.mock('../AdminTabs', () => ({
  AdminTabs: ({ value, onChange }: { value: number; onChange: (event: React.SyntheticEvent, value: number) => void }): React.ReactElement => (
    <div data-testid="admin-tabs" onClick={(e) => onChange(e, value + 1)}>
      Admin Tabs (Current: {value})
    </div>
  ),
}));

describe('AdminDashboard', () => {
  it('renders all tabs correctly', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Contract Controls')).toBeInTheDocument();
    expect(screen.getByText('Ownership')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('switches between tabs correctly', () => {
    render(<AdminDashboard />);
    
    // Par défaut, le premier onglet devrait être visible
    expect(screen.getByTestId('contract-controls')).toBeVisible();
    
    // Cliquer sur l'onglet Ownership
    fireEvent.click(screen.getByText('Ownership'));
    expect(screen.getByTestId('ownership-management')).toBeVisible();
    
    // Cliquer sur l'onglet Alerts
    fireEvent.click(screen.getByText('Alerts'));
    expect(screen.getByTestId('alerts-management')).toBeVisible();
    
    // Cliquer sur l'onglet Audit Logs
    fireEvent.click(screen.getByText('Audit Logs'));
    expect(screen.getByTestId('audit-logs')).toBeVisible();
  });

  it('shows error message when triggered', async () => {
    render(<AdminDashboard />);
    
    // Simuler une erreur
    fireEvent.click(screen.getByTestId('contract-controls'));
    
    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('maintains tab state when switching', () => {
    render(<AdminDashboard />);
    
    // Aller à l'onglet Audit Logs
    fireEvent.click(screen.getByText('Audit Logs'));
    expect(screen.getByTestId('audit-logs')).toBeVisible();
    
    // Revenir à l'onglet Contract Controls
    fireEvent.click(screen.getByText('Contract Controls'));
    expect(screen.getByTestId('contract-controls')).toBeVisible();
  });
});
