import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WrongNetworkPage } from '../WrongNetworkPage';
import { TokenForgeAuthProvider } from '../../../features/auth';
import { mainnet, sepolia } from '../../../config/chains';

jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Switch Network</button>,
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
    expect(screen.getByText('Wrong Network')).toBeInTheDocument();
  });

  it('displays supported networks', () => {
    expect(screen.getByText(new RegExp(`Ethereum Mainnet.*${mainnet.id}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Sepolia Testnet.*${sepolia.id}`))).toBeInTheDocument();
  });

  it('displays the network switch button', () => {
    expect(screen.getByText('Switch Network')).toBeInTheDocument();
  });
});
