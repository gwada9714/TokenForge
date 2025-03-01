import { render, screen, fireEvent, act } from '@testing-library/react';

import { AlertsManagement } from '../AlertsManagement';
import { useTokenForgeAdmin } from '../../../../../hooks/useTokenForgeAdmin';

// Mock du hook useTokenForgeAdmin
vi.mock('../../../../../hooks/useTokenForgeAdmin');

describe('AlertsManagement', () => {
  const mockContract = {
    getAlertRules: vi.fn(),
    addAlertRule: vi.fn(),
    toggleAlertRule: vi.fn(),
    deleteAlertRule: vi.fn(),
  };

  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTokenForgeAdmin as vi.Mock).mockReturnValue({
      contract: mockContract,
    });
  });

  it('loads alert rules on mount', async () => {
    const mockRules = [
      { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    ];
    mockContract.getAlertRules.mockResolvedValueOnce(mockRules);

    await act(async () => {
      render(<AlertsManagement onError={mockOnError} />);
    });

    expect(mockContract.getAlertRules).toHaveBeenCalled();
    expect(screen.getByText('Rule 1')).toBeTruthy();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('adds a new rule', async () => {
    mockContract.getAlertRules.mockResolvedValue([]);
    mockContract.addAlertRule.mockResolvedValueOnce(undefined);

    await act(async () => {
      render(<AlertsManagement onError={mockOnError} />);
    });

    const nameInput = screen.getByLabelText(/nom de la règle/i);
    const conditionInput = screen.getByLabelText(/condition/i);
    const addButton = screen.getByRole('button', { name: /ajouter/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Rule' } });
      fireEvent.change(conditionInput, { target: { value: 'value > 20' } });
      fireEvent.click(addButton);
    });

    expect(mockContract.addAlertRule).toHaveBeenCalledWith({
      name: 'New Rule',
      condition: 'value > 20',
    });
    expect(mockOnError).not.toHaveBeenCalled();
  });

  describe('Error Handling', () => {
    it('handles error when loading rules fails', async () => {
      const error = new Error('Failed to load rules');
      mockContract.getAlertRules.mockRejectedValueOnce(error);

      await act(async () => {
        render(<AlertsManagement onError={mockOnError} />);
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to load rules');
    });

    it('handles error when adding rule fails', async () => {
      mockContract.getAlertRules.mockResolvedValue([]);
      mockContract.addAlertRule.mockRejectedValueOnce(new Error('Failed to add rule'));

      await act(async () => {
        render(<AlertsManagement onError={mockOnError} />);
      });

      const nameInput = screen.getByLabelText(/nom de la règle/i);
      const conditionInput = screen.getByLabelText(/condition/i);
      const addButton = screen.getByRole('button', { name: /ajouter/i });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'New Rule' } });
        fireEvent.change(conditionInput, { target: { value: 'value > 20' } });
        fireEvent.click(addButton);
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to add rule');
    });

    it('handles error when toggling rule fails', async () => {
      const mockRules = [
        { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
      ];
      mockContract.getAlertRules.mockResolvedValue(mockRules);
      mockContract.toggleAlertRule.mockRejectedValueOnce(new Error('Failed to toggle rule'));

      await act(async () => {
        render(<AlertsManagement onError={mockOnError} />);
      });

      const toggleButton = screen.getByRole('switch');
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to toggle rule');
    });

    it('handles error when deleting rule fails', async () => {
      const mockRules = [
        { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
      ];
      mockContract.getAlertRules.mockResolvedValue(mockRules);
      mockContract.deleteAlertRule.mockRejectedValueOnce(new Error('Failed to delete rule'));

      await act(async () => {
        render(<AlertsManagement onError={mockOnError} />);
      });

      const deleteButton = screen.getByRole('button', { name: /supprimer/i });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(mockOnError).toHaveBeenCalledWith('Failed to delete rule');
    });
  });

  it('toggles a rule', async () => {
    const mockRules = [
      { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    ];
    mockContract.getAlertRules.mockResolvedValue(mockRules);

    await act(async () => {
      render(<AlertsManagement onError={mockOnError} />);
    });

    const toggleSwitch = screen.getByRole('switch');

    await act(async () => {
      fireEvent.click(toggleSwitch);
    });

    expect(mockContract.toggleAlertRule).toHaveBeenCalledWith(1);
    expect(mockContract.getAlertRules).toHaveBeenCalledTimes(2);
  });

  it('deletes a rule', async () => {
    const mockRules = [
      { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    ];
    mockContract.getAlertRules.mockResolvedValue(mockRules);

    await act(async () => {
      render(<AlertsManagement onError={mockOnError} />);
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockContract.deleteAlertRule).toHaveBeenCalledWith(1);
    expect(mockContract.getAlertRules).toHaveBeenCalledTimes(2);
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockContract.getAlertRules.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<AlertsManagement onError={mockOnError} />);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
