import { fireEvent, waitFor, screen } from '@testing-library/react';
import { render } from '../../../test-utils/test-wrapper';
import { AlertsManagement } from '../AlertsManagement';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import { useContractRead, useWriteContract } from 'wagmi';
import '@testing-library/jest-dom';

// Mock des hooks
jest.mock('../../../hooks/useTokenForgeAdmin', () => ({
  useTokenForgeAdmin: jest.fn()
}));

jest.mock('wagmi', () => ({
  useContractRead: jest.fn(),
  useWriteContract: jest.fn()
}));

// Mock des composants MUI
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    // Surcharger uniquement les composants qui posent problème
    CircularProgress: () => null,
  };
});

jest.mock('@mui/icons-material/Delete', () => ({
  __esModule: true,
  default: () => 'delete',
}));

jest.mock('@mui/icons-material/Add', () => ({
  __esModule: true,
  default: () => 'add',
}));

describe('AlertsManagement', () => {
  const mockContract = {
    addAlertRule: jest.fn().mockResolvedValue(undefined),
    toggleAlertRule: jest.fn().mockResolvedValue(undefined),
    deleteAlertRule: jest.fn().mockResolvedValue(undefined),
  };

  const mockWriteContractAsync = jest.fn().mockResolvedValue(undefined);
  const mockRefetchRules = jest.fn();

  const mockRules = [
    { id: BigInt(1), name: 'Test Rule 1', condition: 'value > 100', enabled: true },
    { id: BigInt(2), name: 'Test Rule 2', condition: 'value < 50', enabled: false },
  ];

  beforeEach(() => {
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
    });

    (useWriteContract as jest.Mock).mockReturnValue({
      writeContractAsync: mockWriteContractAsync,
    });

    (useContractRead as jest.Mock).mockReturnValue({
      data: mockRules,
      refetch: mockRefetchRules,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the alert management interface', () => {
    render(<AlertsManagement />);
    expect(screen.getByText('Gestion des Alertes')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom de la règle')).toBeInTheDocument();
    expect(screen.getByLabelText('Condition')).toBeInTheDocument();
  });

  it('displays existing alert rules', () => {
    render(<AlertsManagement />);
    expect(screen.getByText('Test Rule 1')).toBeInTheDocument();
    expect(screen.getByText('Test Rule 2')).toBeInTheDocument();
    expect(screen.getByText('value > 100')).toBeInTheDocument();
    expect(screen.getByText('value < 50')).toBeInTheDocument();
  });

  it('handles adding a new alert rule', async () => {
    render(<AlertsManagement />);
    
    const nameInput = screen.getByLabelText('Nom de la règle');
    const conditionInput = screen.getByLabelText('Condition');
    
    fireEvent.change(nameInput, { target: { value: 'New Rule' } });
    fireEvent.change(conditionInput, { target: { value: 'value > 200' } });
    
    const addButton = screen.getByText('Ajouter une règle');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'addAlertRule',
        args: ['New Rule', 'value > 200'],
      }));
      expect(mockRefetchRules).toHaveBeenCalled();
    });
  });

  it('handles toggling an alert rule', async () => {
    render(<AlertsManagement />);
    
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]); // Toggle first rule

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'toggleAlertRule',
        args: [BigInt(1)],
      }));
      expect(mockRefetchRules).toHaveBeenCalled();
    });
  });

  it('handles deleting an alert rule', async () => {
    render(<AlertsManagement />);
    
    const deleteButtons = screen.getAllByLabelText('delete');
    fireEvent.click(deleteButtons[0]); // Delete first rule

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith(expect.objectContaining({
        functionName: 'deleteAlertRule',
        args: [BigInt(1)],
      }));
      expect(mockRefetchRules).toHaveBeenCalled();
    });
  });

  it('disables add button when inputs are empty', () => {
    render(<AlertsManagement />);
    const addButton = screen.getByText('Ajouter une règle');
    expect(addButton).toBeDisabled();
  });

  it('disables controls when loading', async () => {
    render(<AlertsManagement />);
    
    const nameInput = screen.getByLabelText('Nom de la règle');
    const conditionInput = screen.getByLabelText('Condition');
    
    fireEvent.change(nameInput, { target: { value: 'New Rule' } });
    fireEvent.change(conditionInput, { target: { value: 'value > 200' } });
    
    const addButton = screen.getByText('Ajouter une règle');
    fireEvent.click(addButton);

    // Pendant le chargement, tous les contrôles devraient être désactivés
    await waitFor(() => {
      expect(addButton).toBeDisabled();
      expect(nameInput).toBeDisabled();
      expect(conditionInput).toBeDisabled();
      expect(screen.getAllByRole('switch')[0]).toBeDisabled();
      expect(screen.getAllByLabelText('delete')[0]).toBeDisabled();
    });
  });
});
