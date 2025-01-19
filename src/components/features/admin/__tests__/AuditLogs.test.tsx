import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditLogs from '../AuditLogs';
import { useContract } from '../../../../hooks/useContract';

// Mock du hook useContract
jest.mock('../../../../hooks/useContract', () => ({
  useContract: jest.fn(),
}));

describe('AuditLogs', () => {
  const mockLogs = [
    {
      id: '1',
      action: 'Contract Paused',
      address: '0x1234...5678',
      timestamp: Date.now(),
      details: 'Contract paused by admin',
      status: 'success' as const,
      blockNumber: 12345,
      transactionHash: '0xabcd...efgh',
    },
    {
      id: '2',
      action: 'Ownership Transferred',
      address: '0x5678...9abc',
      timestamp: Date.now() - 3600000,
      details: 'Ownership transferred to new address',
      status: 'success' as const,
      blockNumber: 12344,
      transactionHash: '0xijkl...mnop',
    },
  ];

  const mockContract = {
    queryFilter: jest.fn().mockResolvedValue(
      mockLogs.map(log => ({
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        args: {
          action: log.action,
          account: log.address,
          details: log.details,
          success: log.status === 'success',
        },
        getBlock: jest.fn().mockResolvedValue({ timestamp: Math.floor(log.timestamp / 1000) }),
      }))
    ),
  };

  beforeEach(() => {
    (useContract as jest.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the audit logs interface', async () => {
    render(<AuditLogs />);
    
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Contract Paused')).toBeInTheDocument();
      expect(screen.getByText('Ownership Transferred')).toBeInTheDocument();
    });
  });

  it('allows searching logs', async () => {
    render(<AuditLogs />);
    
    await waitFor(() => {
      expect(screen.getByText('Contract Paused')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'Ownership' } });
    
    expect(screen.queryByText('Contract Paused')).not.toBeInTheDocument();
    expect(screen.getByText('Ownership Transferred')).toBeInTheDocument();
  });

  it('handles pagination correctly', async () => {
    render(<AuditLogs />);
    
    await waitFor(() => {
      expect(screen.getByText('Contract Paused')).toBeInTheDocument();
    });
    
    const rowsPerPageSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(screen.getByText('25'));
    
    expect(screen.getByText('1-2 of 2')).toBeInTheDocument();
  });

  it('exports logs to CSV', async () => {
    // Mock URL.createObjectURL et URL.revokeObjectURL
    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    render(<AuditLogs />);
    
    await waitFor(() => {
      expect(screen.getByText('Contract Paused')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByTitle('Export logs');
    fireEvent.click(exportButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('displays error state when contract call fails', async () => {
    const mockError = new Error('Failed to fetch logs');
    mockContract.queryFilter.mockRejectedValueOnce(mockError);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AuditLogs />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch audit logs:', mockError);
    });
    
    consoleSpy.mockRestore();
  });
});
