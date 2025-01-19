import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConnectWalletPage } from '../ConnectWalletPage';
import { TokenForgeAuthProvider } from '../../../features/auth';

jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
}));

describe('ConnectWalletPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <ConnectWalletPage />
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  });

  it('renders connect wallet message', () => {
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
  });

  it('displays the connect button', () => {
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
