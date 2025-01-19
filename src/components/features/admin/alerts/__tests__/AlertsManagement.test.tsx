import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertsManagement } from '../AlertsManagement';
import { useTokenForgeAdmin } from '../../../../../hooks/useTokenForgeAdmin';

// Mock du hook useTokenForgeAdmin
jest.mock('../../../../../hooks/useTokenForgeAdmin');

describe('AlertsManagement', () => {
  const mockContract = {
    getAlertRules: jest.fn(),
    addAlertRule: jest.fn(),
    toggleAlertRule: jest.fn(),
    deleteAlertRule: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
    });
  });

  it('loads alert rules on mount', async () => {
    const mockRules = [
      { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    ];
    mockContract.getAlertRules.mockResolvedValueOnce(mockRules);

    await act(async () => {
      render(<AlertsManagement />);
    });

    expect(mockContract.getAlertRules).toHaveBeenCalled();
    expect(screen.getByText('Rule 1')).toBeInTheDocument();
  });

  it('adds a new rule', async () => {
    mockContract.getAlertRules.mockResolvedValue([]);
    mockContract.addAlertRule.mockResolvedValueOnce(undefined);

    await act(async () => {
      render(<AlertsManagement />);
    });

    const nameInput = screen.getByLabelText(/nom de la règle/i);
    const conditionInput = screen.getByLabelText(/condition/i);
    const addButton = screen.getByRole('button', { name: /ajouter/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Rule' } });
      fireEvent.change(conditionInput, { target: { value: 'value > 100' } });
      fireEvent.click(addButton);
    });

    expect(mockContract.addAlertRule).toHaveBeenCalledWith('New Rule', 'value > 100');
    expect(mockContract.getAlertRules).toHaveBeenCalledTimes(2);
  });

  it('toggles a rule', async () => {
    const mockRules = [
      { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    ];
    mockContract.getAlertRules.mockResolvedValue(mockRules);

    await act(async () => {
      render(<AlertsManagement />);
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
      render(<AlertsManagement />);
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockContract.deleteAlertRule).toHaveBeenCalledWith(1);
    expect(mockContract.getAlertRules).toHaveBeenCalledTimes(2);
  });

  it('handles errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockContract.getAlertRules.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<AlertsManagement />);
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
