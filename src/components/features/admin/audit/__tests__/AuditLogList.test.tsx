import { render, screen, fireEvent } from '@testing-library/react';

import { AuditLogList } from '../AuditLogList';
import type { AuditLog } from '../../../../../types/contracts';

describe('AuditLogList', () => {
  const mockOnDeleteLog = vi.fn();

  const mockLogs: AuditLog[] = [
    {
      id: 1,
      action: 'Transfer',
      data: 'Transferred 100 tokens',
      timestamp: Math.floor(Date.now() / 1000),
      address: '0x123...',
    },
    {
      id: 2,
      action: 'Mint',
      data: 'Minted 50 tokens',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      address: '0x456...',
    },
  ];

  const defaultProps = {
    logs: mockLogs,
    onDeleteLog: mockOnDeleteLog,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all logs with correct formatting', () => {
    render(<AuditLogList {...defaultProps} />);
    
    // Vérifie les actions comme chips
    expect(screen.getByText('Transfer')).toHaveClass('MuiChip-label');
    expect(screen.getByText('Mint')).toHaveClass('MuiChip-label');
    
    // Vérifie les données supplémentaires
    expect(screen.getByText('Transferred 100 tokens')).toBeTruthy();
    expect(screen.getByText('Minted 50 tokens')).toBeTruthy();
    
    // Vérifie les adresses en format monospace
    const addresses = screen.getAllByText(/0x[0-9a-f]+\.\.\./i);
    addresses.forEach(address => {
      expect(address).toHaveStyle({ fontFamily: 'monospace' });
    });
  });

  it('formats timestamps correctly with icons', () => {
    render(<AuditLogList {...defaultProps} />);
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    // Vérifie la présence des icônes
    expect(screen.getAllByTestId('EventIcon')).toHaveLength(2);
    expect(screen.getAllByTestId('PersonIcon')).toHaveLength(2);
    
    expect(screen.getByText(new RegExp(now.toLocaleString()))).toBeTruthy();
    expect(screen.getByText(new RegExp(oneHourAgo.toLocaleString()))).toBeTruthy();
  });

  it('shows delete button with tooltip when onDeleteLog is provided', () => {
    render(<AuditLogList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach(button => {
      expect(button.closest('span')?.parentElement).toHaveAttribute('title', 'Supprimer ce log');
    });
  });

  it('calls onDeleteLog with correct id when delete button is clicked', () => {
    render(<AuditLogList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteLog).toHaveBeenCalledWith(1);
  });

  it('does not render delete buttons when onDeleteLog is not provided', () => {
    render(<AuditLogList logs={mockLogs} />);
    
    expect(screen.queryByRole('button', { name: /delete/i })).toBeFalsy();
  });

  it('shows empty state message when no logs are provided', () => {
    render(<AuditLogList {...defaultProps} logs={[]} />);
    
    expect(screen.getByText('Aucun log d\'audit disponible')).toBeTruthy();
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<AuditLogList {...defaultProps} isLoading={true} />);
    
    // Vérifie la présence des skeletons
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Vérifie que le contenu normal n'est pas affiché
    expect(screen.queryByText('Transfer')).toBeFalsy();
    expect(screen.queryByText('Mint')).toBeFalsy();
  });

  it('disables delete buttons when isLoading is true', () => {
    render(<AuditLogList {...defaultProps} isLoading={true} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
