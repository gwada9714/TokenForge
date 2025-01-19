import { render, screen, fireEvent } from '@testing-library/react';
import { TokenDetails } from '../TokenDetails';

describe('TokenDetails', () => {
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

  const mockTokenAddress = '0x1234567890123456789012345678901234567890';
  const mockExplorer = 'https://etherscan.io';

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
  });

  it('renders token information correctly', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.getByText('Test Token')).toBeInTheDocument();
    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });

  it('displays feature chips correctly', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.getByText('Mintable')).toBeInTheDocument();
    expect(screen.getByText('Burnable')).toBeInTheDocument();
    expect(screen.getByText('Pausable')).toBeInTheDocument();
  });

  it('copies address to clipboard when copy button is clicked', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy address/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockTokenAddress);
  });

  it('displays explorer link when networkExplorer is provided', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
        networkExplorer={mockExplorer}
      />
    );

    const explorerLink = screen.getByText('View on Explorer');
    expect(explorerLink).toHaveAttribute(
      'href',
      `${mockExplorer}/token/${mockTokenAddress}`
    );
  });

  it('does not display explorer link when networkExplorer is not provided', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    expect(screen.queryByText('View on Explorer')).not.toBeInTheDocument();
  });

  it('formats address correctly', () => {
    render(
      <TokenDetails
        tokenAddress={mockTokenAddress}
        tokenConfig={mockTokenConfig}
      />
    );

    const formattedAddress = screen.getByText('0x1234...7890');
    expect(formattedAddress).toBeInTheDocument();
  });
});
