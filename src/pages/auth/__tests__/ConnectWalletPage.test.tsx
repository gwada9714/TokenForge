import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConnectWalletPage } from '../ConnectWalletPage';
import { TokenForgeAuthProvider } from '../../../features/auth';

vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
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
    expect(screen.getByText('Connect Your Wallet')).toBeTruthy();
  });

  it('displays the connect button', () => {
    expect(screen.getByText('Connect Wallet')).toBeTruthy();
  });
});
