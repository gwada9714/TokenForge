import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OwnershipManagement from '../OwnershipManagement';
import { useContract } from '../../../../hooks/useContract';

// Mock du hook useContract et ethers
jest.mock('../../../../hooks/useContract', () => ({
  useContract: jest.fn(),
}));

jest.mock('ethers', () => ({
  ethers: {
    isAddress: jest.fn((address: string) => address === '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'),
  },
}));

describe('OwnershipManagement', () => {
  const mockContract = {
    transferOwnership: jest.fn(),
  };

  const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  beforeEach(() => {
    (useContract as jest.Mock).mockReturnValue({ contract: mockContract });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the ownership management interface', () => {
    render(<OwnershipManagement />);
    
    expect(screen.getByText('Ownership Management')).toBeInTheDocument();
    expect(screen.getByText('Current Owner')).toBeInTheDocument();
    expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
  });

  it('opens transfer dialog when clicking transfer button', () => {
    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
    expect(screen.getByLabelText('New Owner Address')).toBeInTheDocument();
  });

  it('validates ethereum address format', async () => {
    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    const input = screen.getByLabelText('New Owner Address');
    const invalidAddress = '0xinvalid';
    
    fireEvent.change(input, { target: { value: invalidAddress } });
    
    expect(screen.getByText('Please enter a valid Ethereum address')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeDisabled();
    
    fireEvent.change(input, { target: { value: validAddress } });
    
    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid Ethereum address')).not.toBeInTheDocument();
      expect(screen.getByText('Transfer')).not.toBeDisabled();
    });
  });

  it('handles transfer ownership successfully', async () => {
    mockContract.transferOwnership.mockResolvedValueOnce({
      wait: jest.fn().mockResolvedValueOnce({}),
    });

    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    const input = screen.getByLabelText('New Owner Address');
    fireEvent.change(input, { target: { value: validAddress } });
    
    fireEvent.click(screen.getByText('Transfer'));
    
    await waitFor(() => {
      expect(mockContract.transferOwnership).toHaveBeenCalledWith(validAddress);
      expect(screen.getByText('Ownership transferred successfully')).toBeInTheDocument();
    });
    
    // Le dialogue devrait être fermé
    expect(screen.queryByText('Transfer Ownership')).not.toBeInTheDocument();
  });

  it('handles transfer ownership error', async () => {
    mockContract.transferOwnership.mockRejectedValueOnce(new Error('Transfer failed'));

    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    const input = screen.getByLabelText('New Owner Address');
    fireEvent.change(input, { target: { value: validAddress } });
    
    fireEvent.click(screen.getByText('Transfer'));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to transfer ownership')).toBeInTheDocument();
    });
    
    // Le dialogue devrait rester ouvert
    expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
  });

  it('shows loading state during transfer', async () => {
    mockContract.transferOwnership.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    const input = screen.getByLabelText('New Owner Address');
    fireEvent.change(input, { target: { value: validAddress } });
    
    fireEvent.click(screen.getByText('Transfer'));
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('closes dialog without making changes', () => {
    render(<OwnershipManagement />);
    
    fireEvent.click(screen.getByText('Transfer to New Owner'));
    
    const input = screen.getByLabelText('New Owner Address');
    fireEvent.change(input, { target: { value: validAddress } });
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.queryByText('Transfer Ownership')).not.toBeInTheDocument();
    expect(mockContract.transferOwnership).not.toHaveBeenCalled();
  });
});
