import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertsManagement from '../AlertsManagement';
import { useContract } from '../../../../hooks/useContract';

// Mock du hook useContract
jest.mock('../../../../hooks/useContract', () => ({
  useContract: jest.fn(),
}));

describe('AlertsManagement', () => {
  const mockContract = {
    addAlert: jest.fn(),
    updateAlert: jest.fn(),
    deleteAlert: jest.fn(),
  };

  beforeEach(() => {
    (useContract as jest.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the alerts management interface', () => {
    render(<AlertsManagement />);
    
    expect(screen.getByText('Alerts Management')).toBeInTheDocument();
    expect(screen.getByText('Add Alert')).toBeInTheDocument();
  });

  it('opens add alert dialog when clicking add button', () => {
    render(<AlertsManagement />);
    
    fireEvent.click(screen.getByText('Add Alert'));
    
    expect(screen.getByText('Add New Alert')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<AlertsManagement />);
    
    // Ouvrir le dialogue
    fireEvent.click(screen.getByText('Add Alert'));
    
    // Le bouton Add devrait être désactivé initialement
    const addButton = screen.getByText('Add');
    expect(addButton).toBeDisabled();
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Test alert message' },
    });
    
    // Le bouton devrait être activé maintenant
    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
    });
  });

  it('adds a new alert successfully', async () => {
    mockContract.addAlert.mockResolvedValueOnce({
      wait: jest.fn().mockResolvedValueOnce({}),
    });

    render(<AlertsManagement />);
    
    // Ouvrir le dialogue
    fireEvent.click(screen.getByText('Add Alert'));
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Test alert message' },
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Add'));
    
    // Vérifier que le contrat a été appelé
    await waitFor(() => {
      expect(mockContract.addAlert).toHaveBeenCalledWith('info', 'Test alert message');
    });
    
    // Vérifier le message de succès
    expect(await screen.findByText('Alert added successfully')).toBeInTheDocument();
  });

  it('handles add alert error', async () => {
    mockContract.addAlert.mockRejectedValueOnce(new Error('Failed to add alert'));

    render(<AlertsManagement />);
    
    // Ouvrir le dialogue
    fireEvent.click(screen.getByText('Add Alert'));
    
    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText('Message'), {
      target: { value: 'Test alert message' },
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByText('Add'));
    
    // Vérifier le message d'erreur
    expect(await screen.findByText('Failed to add alert')).toBeInTheDocument();
  });

  it('closes dialog on cancel', () => {
    render(<AlertsManagement />);
    
    // Ouvrir le dialogue
    fireEvent.click(screen.getByText('Add Alert'));
    
    // Fermer le dialogue
    fireEvent.click(screen.getByText('Cancel'));
    
    // Vérifier que le dialogue est fermé
    expect(screen.queryByText('Add New Alert')).not.toBeInTheDocument();
  });
});
