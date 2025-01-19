import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuditLogs } from '../AuditLogs';
import { useTokenForgeAdmin } from '../../../../../hooks/useTokenForgeAdmin';

jest.mock('../../../../../hooks/useTokenForgeAdmin');

describe('AuditLogs', () => {
  const mockContract = {
    getAuditLogs: jest.fn(),
    deleteAuditLog: jest.fn(),
    purgeAuditLogs: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
    });
  });

  it('loads audit logs on mount', async () => {
    const mockLogs = [
      { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
    ];
    mockContract.getAuditLogs.mockResolvedValueOnce(mockLogs);

    await act(async () => {
      render(<AuditLogs />);
    });

    expect(mockContract.getAuditLogs).toHaveBeenCalled();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
  });

  it('shows loading state while fetching logs', async () => {
    mockContract.getAuditLogs.mockImplementation(() => new Promise(() => {}));

    render(<AuditLogs />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles log deletion', async () => {
    const mockLogs = [
      { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
    ];
    mockContract.getAuditLogs.mockResolvedValue(mockLogs);

    await act(async () => {
      render(<AuditLogs />);
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockContract.deleteAuditLog).toHaveBeenCalledWith(1);
    expect(mockContract.getAuditLogs).toHaveBeenCalledTimes(2);
  });

  it('handles log purge', async () => {
    const mockLogs = [
      { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
    ];
    mockContract.getAuditLogs.mockResolvedValue(mockLogs);

    await act(async () => {
      render(<AuditLogs />);
    });

    const purgeButton = screen.getByRole('button', { name: /purger/i });

    await act(async () => {
      fireEvent.click(purgeButton);
    });

    expect(mockContract.purgeAuditLogs).toHaveBeenCalled();
    expect(mockContract.getAuditLogs).toHaveBeenCalledTimes(2);
  });

  it('handles export functionality', async () => {
    const mockLogs = [
      { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
    ];
    mockContract.getAuditLogs.mockResolvedValue(mockLogs);

    // Mock des fonctions du DOM pour l'export
    const mockCreateElement = jest.spyOn(document, 'createElement');
    const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL');
    const mockRevokeObjectURL = jest.spyOn(URL, 'revokeObjectURL');
    const mockAppendChild = jest.spyOn(document.body, 'appendChild');
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild');
    
    const mockLink = {
      click: jest.fn(),
      href: '',
      download: '',
    };
    
    mockCreateElement.mockReturnValue(mockLink as any);
    mockCreateObjectURL.mockReturnValue('blob:test');

    await act(async () => {
      render(<AuditLogs />);
    });

    const exportButton = screen.getByRole('button', { name: /exporter/i });

    await act(async () => {
      fireEvent.click(exportButton);
    });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test');

    // Nettoyage des mocks
    mockCreateElement.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockContract.getAuditLogs.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<AuditLogs />);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
