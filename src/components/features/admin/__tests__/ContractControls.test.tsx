import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractControls from '../ContractControls';
import { useContract } from '../../../../hooks/useContract';

// Mock du hook useContract
jest.mock('../../../../hooks/useContract', () => ({
  useContract: jest.fn(),
}));

describe('ContractControls', () => {
  const mockContract = {
    pause: jest.fn(),
    unpause: jest.fn(),
  };

  beforeEach(() => {
    (useContract as jest.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the contract controls interface', () => {
    render(<ContractControls />);
    
    expect(screen.getByText('Contract Controls')).toBeInTheDocument();
    expect(screen.getByText('Contract Status')).toBeInTheDocument();
    expect(screen.getByText('Emergency Controls')).toBeInTheDocument();
  });

  it('displays active status by default', () => {
    render(<ContractControls />);
    
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles pause action successfully', async () => {
    mockContract.pause.mockResolvedValueOnce({
      wait: jest.fn().mockResolvedValueOnce({}),
    });

    render(<ContractControls />);
    
    fireEvent.click(screen.getByText('Pause Contract'));
    
    await waitFor(() => {
      expect(mockContract.pause).toHaveBeenCalled();
      expect(screen.getByText('Contract successfully paused')).toBeInTheDocument();
    });
  });

  it('handles unpause action successfully', async () => {
    mockContract.unpause.mockResolvedValueOnce({
      wait: jest.fn().mockResolvedValueOnce({}),
    });

    render(<ContractControls />);
    
    // D'abord mettre le contrat en pause
    const pauseButton = screen.getByText('Pause Contract');
    fireEvent.click(pauseButton);
    
    await waitFor(() => {
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });
    
    // Ensuite réactiver le contrat
    const unpauseButton = screen.getByText('Unpause Contract');
    fireEvent.click(unpauseButton);
    
    await waitFor(() => {
      expect(mockContract.unpause).toHaveBeenCalled();
      expect(screen.getByText('Contract successfully unpaused')).toBeInTheDocument();
    });
  });

  it('handles pause action error', async () => {
    mockContract.pause.mockRejectedValueOnce(new Error('Failed to pause'));

    render(<ContractControls />);
    
    fireEvent.click(screen.getByText('Pause Contract'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to pause contract')).toBeInTheDocument();
    });
  });

  it('disables button during transaction', async () => {
    mockContract.pause.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ContractControls />);
    
    const pauseButton = screen.getByText('Pause Contract');
    fireEvent.click(pauseButton);
    
    expect(pauseButton).toBeDisabled();
    
    await waitFor(() => {
      expect(pauseButton).not.toBeDisabled();
    });
  });

  it('shows loading indicator during transaction', async () => {
    mockContract.pause.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ContractControls />);
    
    fireEvent.click(screen.getByText('Pause Contract'));
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});
