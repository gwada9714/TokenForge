import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WrongNetworkPage } from '../WrongNetworkPage';
import { TokenForgeAuthProvider } from '../../../features/auth';
import { mainnet, sepolia } from '../../../config/chains';

vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Switch Network</button>,
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } }),
}));

describe('WrongNetworkPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <TokenForgeAuthProvider>
          <WrongNetworkPage />
        </TokenForgeAuthProvider>
      </BrowserRouter>
    );
  });

  it('renders wrong network message', () => {
    expect(screen.getByText('Wrong Network')).toBeTruthy();
  });

  it('displays supported networks', () => {
    expect(screen.getByText(new RegExp(`Ethereum Mainnet.*${mainnet.id}`))).toBeTruthy();
    expect(screen.getByText(new RegExp(`Sepolia Testnet.*${sepolia.id}`))).toBeTruthy();
  });

  it('displays the network switch button', () => {
    expect(screen.getByText('Switch Network')).toBeTruthy();
  });
});
