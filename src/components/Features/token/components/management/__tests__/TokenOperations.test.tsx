import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenOperations } from '../TokenOperations';
import { useTokenOperations } from '../../../hooks/useTokenOperations';

// Mock the hook
jest.mock('../../../hooks/useTokenOperations');

const mockTokenConfig = {
  name: 'Test Token',
  symbol: 'TEST',
  decimals: 18,
  totalSupply: '1000000',
  features: {
    mintable: true,
    burnable: true,
    pausable: true,
  },
};

describe('TokenOperations', () => {
  const mockTokenAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    // Reset mock implementation for each test
    (useTokenOperations as jest.Mock).mockImplementation(() => ({
      operations: [],
      mint: jest.fn(),
      burn: jest.fn(),
      pause: jest.fn(),
      unpause: jest.fn(),
      transfer: jest.fn(),
    }));
  });

  it('renders all operation buttons for premium features', () => {
    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.getByText('Mint Tokens')).toBeInTheDocument();
    expect(screen.getByText('Burn Tokens')).toBeInTheDocument();
    expect(screen.getByText('Pause Token')).toBeInTheDocument();
    expect(screen.getByText('Transfer Tokens')).toBeInTheDocument();
  });

  it('does not render premium feature buttons for basic token', () => {
    const basicConfig = {
      ...mockTokenConfig,
      features: {
        ...mockTokenConfig.features,
        mintable: false,
        pausable: false,
      },
    };

    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={basicConfig}
      />
    );

    expect(screen.queryByText('Mint Tokens')).not.toBeInTheDocument();
    expect(screen.queryByText('Pause Token')).not.toBeInTheDocument();
    expect(screen.getByText('Burn Tokens')).toBeInTheDocument();
    expect(screen.getByText('Transfer Tokens')).toBeInTheDocument();
  });

  it('opens dialog for mint operation', async () => {
    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    fireEvent.click(screen.getByText('Mint Tokens'));

    expect(screen.getByText('Mint Tokens', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText('Recipient Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('handles mint operation submission', async () => {
    const mockMint = jest.fn();
    (useTokenOperations as jest.Mock).mockImplementation(() => ({
      operations: [],
      mint: mockMint,
      burn: jest.fn(),
      pause: jest.fn(),
      unpause: jest.fn(),
      transfer: jest.fn(),
    }));

    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    // Open mint dialog
    fireEvent.click(screen.getByText('Mint Tokens'));

    // Fill form
    fireEvent.change(screen.getByLabelText('Recipient Address'), {
      target: { value: '0x1234...' },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '1000' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockMint).toHaveBeenCalledWith('0x1234...', '1000');
    });
  });

  it('displays success message after successful operation', async () => {
    (useTokenOperations as jest.Mock).mockImplementation(() => ({
      operations: [{
        type: 'mint',
        status: 'success',
        txHash: '0x123...',
      }],
      mint: jest.fn(),
      burn: jest.fn(),
      pause: jest.fn(),
      unpause: jest.fn(),
      transfer: jest.fn(),
    }));

    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.getByText('Operation completed successfully!')).toBeInTheDocument();
  });

  it('displays error message after failed operation', async () => {
    (useTokenOperations as jest.Mock).mockImplementation(() => ({
      operations: [{
        type: 'mint',
        status: 'error',
        error: 'Operation failed',
      }],
      mint: jest.fn(),
      burn: jest.fn(),
      pause: jest.fn(),
      unpause: jest.fn(),
      transfer: jest.fn(),
    }));

    render(
      <TokenOperations
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.getByText('Operation failed')).toBeInTheDocument();
  });
});
