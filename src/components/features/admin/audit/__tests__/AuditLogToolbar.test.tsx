import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogToolbar } from '../AuditLogToolbar';

describe('AuditLogToolbar', () => {
  const mockOnExport = jest.fn();
  const mockOnPurge = jest.fn();

  const defaultProps = {
    onExport: mockOnExport,
    onPurge: mockOnPurge,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders export and purge buttons', () => {
    render(<AuditLogToolbar {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: /exporter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /purger/i })).toBeInTheDocument();
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
});
