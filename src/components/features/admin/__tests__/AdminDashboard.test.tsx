import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDashboard } from '../AdminDashboard';

// Mock des composants enfants
jest.mock('../contract/ContractControls', () => ({
  ContractControls: ({ onError }: { onError: (msg: string) => void }): React.ReactElement => (
    <div data-testid="contract-controls" onClick={() => onError('test error')}>Contract Controls</div>
  ),
}));

jest.mock('../ownership/OwnershipManagement', () => ({
  OwnershipManagement: ({ onError }: { onError: (msg: string) => void }): React.ReactElement => (
    <div data-testid="ownership-management" onClick={() => onError('ownership error')}>Ownership Management</div>
  ),
}));

jest.mock('../alerts/AlertsManagement', () => ({
  AlertsManagement: ({ onError }: { onError: (msg: string) => void }): React.ReactElement => (
    <div data-testid="alerts-management" onClick={() => onError('alerts error')}>Alerts Management</div>
  ),
}));

jest.mock('../audit/AuditLogs', () => ({
  AuditLogs: ({ onError }: { onError: (msg: string) => void }): React.ReactElement => (
    <div data-testid="audit-logs" onClick={() => onError('audit error')}>Audit Logs</div>
  ),
}));

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
  const mockOnError = jest.fn();

  beforeEach(() => {
    render(<AdminDashboard onError={mockOnError} />);
    mockOnError.mockClear();
  });

  it('renders all components initially', () => {
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('admin-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();
  });

  it('changes tab content when clicking tabs', () => {
    const tabs = screen.getByTestId('admin-tabs');
    
    // Initialement, on voit ContractControls
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();
    
    // Premier clic : passage à OwnershipManagement
    fireEvent.click(tabs);
    expect(screen.getByTestId('ownership-management')).toBeInTheDocument();
    
    // Deuxième clic : passage à AlertsManagement
    fireEvent.click(tabs);
    expect(screen.getByTestId('alerts-management')).toBeInTheDocument();
    
    // Troisième clic : passage à AuditLogs
    fireEvent.click(tabs);
    expect(screen.getByTestId('audit-logs')).toBeInTheDocument();
  });

  it('propagates errors from child components', () => {
    // Test des erreurs de ContractControls
    fireEvent.click(screen.getByTestId('contract-controls'));
    expect(mockOnError).toHaveBeenCalledWith('test error');

    // Passage à OwnershipManagement et test des erreurs
    fireEvent.click(screen.getByTestId('admin-tabs'));
    fireEvent.click(screen.getByTestId('ownership-management'));
    expect(mockOnError).toHaveBeenCalledWith('ownership error');

    // Passage à AlertsManagement et test des erreurs
    fireEvent.click(screen.getByTestId('admin-tabs'));
    fireEvent.click(screen.getByTestId('alerts-management'));
    expect(mockOnError).toHaveBeenCalledWith('alerts error');

    // Passage à AuditLogs et test des erreurs
    fireEvent.click(screen.getByTestId('admin-tabs'));
    fireEvent.click(screen.getByTestId('audit-logs'));
    expect(mockOnError).toHaveBeenCalledWith('audit error');
  });
});
