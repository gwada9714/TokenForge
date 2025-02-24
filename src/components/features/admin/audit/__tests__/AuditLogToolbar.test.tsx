import { render, screen, fireEvent } from '@testing-library/react';
;
import { AuditLogToolbar } from '../AuditLogToolbar';

describe('AuditLogToolbar', () => {
  const mockOnExport = vi.fn();
  const mockOnPurge = vi.fn();

  const defaultProps = {
    onExport: mockOnExport,
    onPurge: mockOnPurge,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export and purge buttons', () => {
    render(<AuditLogToolbar {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /exporter/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /purger/i })).toBeTruthy();
  });

  it('calls onExport when export button is clicked', () => {
    render(<AuditLogToolbar {...defaultProps} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    fireEvent.click(exportButton);
    
    expect(mockOnExport).toHaveBeenCalled();
  });

  it('calls onPurge when purge button is clicked', () => {
    render(<AuditLogToolbar {...defaultProps} />);
    
    const purgeButton = screen.getByRole('button', { name: /purger/i });
    fireEvent.click(purgeButton);
    
    expect(mockOnPurge).toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<AuditLogToolbar {...defaultProps} disabled={true} />);
    
    expect(screen.getByRole('button', { name: /exporter/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /purger/i })).toBeDisabled();
  });

  it('enables buttons when disabled prop is false', () => {
    render(<AuditLogToolbar {...defaultProps} disabled={false} />);
    
    expect(screen.getByRole('button', { name: /exporter/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /purger/i })).not.toBeDisabled();
  });

  it('shows correct tooltips when disabled', () => {
    render(<AuditLogToolbar {...defaultProps} disabled={true} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    const purgeButton = screen.getByRole('button', { name: /purger/i });
    
    expect(exportButton.closest('span')?.parentElement).toHaveAttribute('title', 'Aucun log disponible');
    expect(purgeButton.closest('span')?.parentElement).toHaveAttribute('title', 'Aucun log à purger');
  });

  it('shows correct tooltips when enabled', () => {
    render(<AuditLogToolbar {...defaultProps} disabled={false} />);
    
    const exportButton = screen.getByRole('button', { name: /exporter/i });
    const purgeButton = screen.getByRole('button', { name: /purger/i });
    
    expect(exportButton.closest('span')?.parentElement).toHaveAttribute('title', 'Exporter les logs au format CSV');
    expect(purgeButton.closest('span')?.parentElement).toHaveAttribute('title', 'Supprimer tous les logs');
  });

  it('has responsive styles', () => {
    render(<AuditLogToolbar {...defaultProps} />);
    
    const container = screen.getByRole('button', { name: /exporter/i }).closest('div');
    expect(container).toHaveStyle({ display: 'flex' });
  });
});
