import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDashboard } from '../AdminDashboard';

// Mock des composants enfants
jest.mock('../contract', () => ({
  ContractControls: (): React.ReactElement => <div data-testid="contract-controls">Contract Controls</div>,
}));

jest.mock('../ownership', () => ({
  OwnershipManagement: (): React.ReactElement => <div data-testid="ownership-management">Ownership Management</div>,
}));

jest.mock('../alerts', () => ({
  AlertsManagement: (): React.ReactElement => <div data-testid="alerts-management">Alerts Management</div>,
}));

jest.mock('../audit', () => ({
  AuditStats: (): React.ReactElement => <div data-testid="audit-stats">Audit Stats</div>,
  AuditLogs: (): React.ReactElement => <div data-testid="audit-logs">Audit Logs</div>,
}));

jest.mock('../AdminHeader', () => ({
  AdminHeader: (): React.ReactElement => <div data-testid="admin-header">Admin Header</div>,
}));

jest.mock('../AdminTabs', () => ({
  AdminTabs: ({ value, onChange }: { value: number; onChange: (event: React.SyntheticEvent, value: number) => void }): React.ReactElement => (
    <div data-testid="admin-tabs" onClick={(e) => onChange(e, value + 1)}>
      Admin Tabs
    </div>
  ),
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    render(<AdminDashboard />);
  });

  it('renders all components', () => {
    expect(screen.getByTestId('admin-header')).toBeInTheDocument();
    expect(screen.getByTestId('admin-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();
  });

  it('changes tab content when clicking tabs', () => {
    const tabs = screen.getByTestId('admin-tabs');
    
    // Initialement, on voit ContractControls
    expect(screen.getByTestId('contract-controls')).toBeInTheDocument();
    
    // Premier clic - devrait montrer OwnershipManagement
    fireEvent.click(tabs);
    expect(screen.getByTestId('ownership-management')).toBeInTheDocument();
    
    // Deuxième clic - devrait montrer AlertsManagement
    fireEvent.click(tabs);
    expect(screen.getByTestId('alerts-management')).toBeInTheDocument();
    
    // Troisième clic - devrait montrer AuditStats et AuditLogs
    fireEvent.click(tabs);
    expect(screen.getByTestId('audit-stats')).toBeInTheDocument();
    expect(screen.getByTestId('audit-logs')).toBeInTheDocument();
  });
});
