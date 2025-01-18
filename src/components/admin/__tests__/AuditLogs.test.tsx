import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditLogs } from '../AuditLogs';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import '@testing-library/jest-dom';

jest.mock('../../../hooks/useTokenForgeAdmin', () => ({
  useTokenForgeAdmin: jest.fn()
}));

describe('AuditLogs', () => {
  const mockLogs = [
    {
      id: '1',
      timestamp: '2025-01-18T16:00:00',
      action: 'Contract Pause',
      details: 'Contract was paused',
      address: '0x123...',
    },
  ];

  const mockContract = {
    getAuditLogs: jest.fn().mockResolvedValue(mockLogs),
    purgeAuditLogs: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
      isProcessing: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the audit logs interface', () => {
    render(<AuditLogs />);
    expect(screen.getByText("Logs d'Audit")).toBeInTheDocument();
    expect(screen.getByText('Exporter')).toBeInTheDocument();
    expect(screen.getByText('Purger')).toBeInTheDocument();
  });

  it('fetches and displays logs on mount', async () => {
    render(<AuditLogs />);
    
    expect(screen.getByText('Chargement des logs...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockContract.getAuditLogs).toHaveBeenCalled();
      expect(screen.getByText('Contract Pause')).toBeInTheDocument();
    });
  });

  it('handles purge action with confirmation', async () => {
    window.confirm = jest.fn(() => true);
    
    render(<AuditLogs />);
    await waitFor(() => {
      expect(screen.getByText('Contract Pause')).toBeInTheDocument();
    });

    const purgeButton = screen.getByText('Purger');
    fireEvent.click(purgeButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockContract.purgeAuditLogs).toHaveBeenCalled();
    });
  });

  it('disables buttons when processing', async () => {
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
      isProcessing: true,
    });

    render(<AuditLogs />);
    
    const exportButton = screen.getByText('Exporter');
    const purgeButton = screen.getByText('Purger');
    
    expect(exportButton).toBeDisabled();
    expect(purgeButton).toBeDisabled();
  });
});
