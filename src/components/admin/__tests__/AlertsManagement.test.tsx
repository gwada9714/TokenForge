import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlertsManagement } from '../AlertsManagement';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import '@testing-library/jest-dom';

// Mock du hook useTokenForgeAdmin
jest.mock('../../../hooks/useTokenForgeAdmin', () => ({
  useTokenForgeAdmin: jest.fn()
}));

describe('AlertsManagement', () => {
  const mockContract = {
    addAlertRule: jest.fn().mockResolvedValue(undefined),
    toggleAlertRule: jest.fn().mockResolvedValue(undefined),
    deleteAlertRule: jest.fn().mockResolvedValue(undefined),
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

  it('renders the alert management interface', () => {
    render(<AlertsManagement />);
    expect(screen.getByText('Gestion des Alertes')).toBeInTheDocument();
    expect(screen.getByLabelText("Nom de l'alerte")).toBeInTheDocument();
    expect(screen.getByLabelText('Condition')).toBeInTheDocument();
  });

  it('handles adding a new alert rule', async () => {
    render(<AlertsManagement />);
    
    const nameInput = screen.getByLabelText("Nom de l'alerte");
    const conditionInput = screen.getByLabelText('Condition');
    
    fireEvent.change(nameInput, { target: { value: 'Test Alert' } });
    fireEvent.change(conditionInput, { target: { value: 'value > 100' } });
    
    const addButton = screen.getByText('Ajouter une alerte');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockContract.addAlertRule).toHaveBeenCalledWith('Test Alert', 'value > 100');
    });
  });

  it('disables add button when inputs are empty', () => {
    render(<AlertsManagement />);
    const addButton = screen.getByText('Ajouter une alerte');
    expect(addButton).toBeDisabled();
  });

  it('disables controls when processing', () => {
    (useTokenForgeAdmin as jest.Mock).mockReturnValue({
      contract: mockContract,
      isProcessing: true,
    });

    render(<AlertsManagement />);
    const addButton = screen.getByText('Ajouter une alerte');
    expect(addButton).toBeDisabled();
  });
});
