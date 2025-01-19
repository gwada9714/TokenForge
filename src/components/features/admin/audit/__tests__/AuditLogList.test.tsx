import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogList } from '../AuditLogList';
import type { AuditLog } from '../../../../../types/contracts';

describe('AuditLogList', () => {
  const mockOnDeleteLog = jest.fn();

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
    jest.clearAllMocks();
  });

  it('renders all logs', () => {
    render(<AuditLogList {...defaultProps} />);
    
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('Mint')).toBeInTheDocument();
    expect(screen.getByText(/0x123/)).toBeInTheDocument();
    expect(screen.getByText(/0x456/)).toBeInTheDocument();
  });

  it('formats timestamps correctly', () => {
    render(<AuditLogList {...defaultProps} />);
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    
    expect(screen.getByText(new RegExp(now.toLocaleString()))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(oneHourAgo.toLocaleString()))).toBeInTheDocument();
  });

  it('calls onDeleteLog when delete button is clicked', () => {
    render(<AuditLogList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteLog).toHaveBeenCalledWith(1);
  });

  it('does not render delete buttons when onDeleteLog is not provided', () => {
    render(<AuditLogList logs={mockLogs} />);
    
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('renders empty list when no logs provided', () => {
    render(<AuditLogList {...defaultProps} logs={[]} />);
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
