import { render, screen, fireEvent, act } from '@testing-library/react';

import { AuditLogs } from '../AuditLogs';
import { useTokenForgeAdmin } from '../../../../../hooks/useTokenForgeAdmin';

vi.mock('../../../../../hooks/useTokenForgeAdmin');

describe('AuditLogs', () => {
  const mockContract = {
    getAuditLogs: vi.fn(),
    deleteAuditLog: vi.fn(),
    purgeAuditLogs: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTokenForgeAdmin as vi.Mock).mockReturnValue({
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
    expect(screen.getByText('Transfer')).toBeTruthy();
  });

  it('shows loading state while fetching logs', async () => {
    mockContract.getAuditLogs.mockImplementation(() => new Promise(() => {}));

    render(<AuditLogs />);

    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  describe('Delete Log Functionality', () => {
    it('shows confirmation dialog before deleting log', async () => {
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

      expect(screen.getByText('Confirmer la suppression')).toBeTruthy();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer ce log ?')).toBeTruthy();
    });

    it('deletes log when confirmed and shows success message', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);

      await act(async () => {
        render(<AuditLogs />);
      });

      // Cliquer sur le bouton de suppression
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Confirmer la suppression
      const confirmButton = screen.getByRole('button', { name: /confirmer/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(mockContract.deleteAuditLog).toHaveBeenCalledWith(1);
      expect(mockContract.getAuditLogs).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Log supprimé avec succès')).toBeTruthy();
    });

    it('cancels log deletion when dialog is dismissed', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);

      await act(async () => {
        render(<AuditLogs />);
      });

      // Cliquer sur le bouton de suppression
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Annuler la suppression
      const cancelButton = screen.getByRole('button', { name: /annuler/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      expect(mockContract.deleteAuditLog).not.toHaveBeenCalled();
      expect(screen.queryByText('Confirmer la suppression')).toBeFalsy();
    });
  });

  describe('Purge Functionality', () => {
    it('shows confirmation dialog before purging logs', async () => {
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

      expect(screen.getByText('Confirmer la purge')).toBeTruthy();
      expect(screen.getByText('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')).toBeTruthy();
    });

    it('purges logs when confirmed and shows success message', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);

      await act(async () => {
        render(<AuditLogs />);
      });

      // Cliquer sur le bouton de purge
      const purgeButton = screen.getByRole('button', { name: /purger/i });
      await act(async () => {
        fireEvent.click(purgeButton);
      });

      // Confirmer la purge
      const confirmButton = screen.getByRole('button', { name: /confirmer/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(mockContract.purgeAuditLogs).toHaveBeenCalled();
      expect(mockContract.getAuditLogs).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Logs purgés avec succès')).toBeTruthy();
    });
  });

  describe('Export Functionality', () => {
    it('exports logs to CSV file', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);

      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
      const mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
      const mockAppendChild = vi.spyOn(document.body, 'appendChild');
      const mockRemoveChild = vi.spyOn(document.body, 'removeChild');
      
      const mockLink = {
        click: vi.fn(),
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
      expect(screen.getByText('Logs exportés avec succès')).toBeTruthy();

      // Nettoyage des mocks
      mockCreateElement.mockRestore();
      mockCreateObjectURL.mockRestore();
      mockRevokeObjectURL.mockRestore();
      mockAppendChild.mockRestore();
      mockRemoveChild.mockRestore();
    });

    it('shows error message when export fails', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);

      const mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL');
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Failed to create URL');
      });

      await act(async () => {
        render(<AuditLogs />);
      });

      const exportButton = screen.getByRole('button', { name: /exporter/i });
      await act(async () => {
        fireEvent.click(exportButton);
      });

      expect(screen.getByText('Erreur lors de l\'export des logs')).toBeTruthy();
      mockCreateObjectURL.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('shows error message when loading logs fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockContract.getAuditLogs.mockRejectedValueOnce(new Error('API Error'));

      await act(async () => {
        render(<AuditLogs />);
      });

      expect(screen.getByText('Erreur lors du chargement des logs')).toBeTruthy();
      consoleErrorSpy.mockRestore();
    });

    it('shows error message when deleting log fails', async () => {
      const mockLogs = [
        { id: 1, action: 'Transfer', data: 'Test', timestamp: Date.now() / 1000, address: '0x123' },
      ];
      mockContract.getAuditLogs.mockResolvedValue(mockLogs);
      mockContract.deleteAuditLog.mockRejectedValueOnce(new Error('Delete Error'));

      await act(async () => {
        render(<AuditLogs />);
      });

      // Cliquer sur le bouton de suppression
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      // Confirmer la suppression
      const confirmButton = screen.getByRole('button', { name: /confirmer/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });

      expect(screen.getByText('Erreur lors de la suppression du log')).toBeTruthy();
    });
  });
});
