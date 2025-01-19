import { fireEvent, waitFor, screen } from '@testing-library/react';
import { render } from '../../../test-utils/test-wrapper';
import { AlertsManagement } from '../AlertsManagement';
import { useTokenForgeAdmin } from '../../../hooks/useTokenForgeAdmin';
import '@testing-library/jest-dom';
import { TOKEN_FORGE_ADDRESS } from '../../../constants/addresses';
import { TokenForgeFactoryABI } from '../../../abi/TokenForgeFactory';

// Mock des hooks
jest.mock('../../../hooks/useTokenForgeAdmin', () => ({
  useTokenForgeAdmin: jest.fn()
}));

// Mock de wagmi
const mockWriteContractAsync = jest.fn().mockResolvedValue({ hash: '0x123' });
const mockRefetch = jest.fn();

jest.mock('wagmi', () => ({
  useContractRead: () => ({
    data: [
      { id: BigInt(1), name: 'Test Rule 1', condition: 'value > 100', enabled: true },
      { id: BigInt(2), name: 'Test Rule 2', condition: 'value < 50', enabled: false },
    ],
    isLoading: false,
    refetch: mockRefetch
  }),
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    isLoading: false,
    error: null
  }),
  useAccount: () => ({
    address: '0x123' as `0x${string}`,
    isConnected: true
  }),
  useNetwork: () => ({
    chain: { id: 11155111, name: 'Sepolia' }
  })
}));

// Mock des composants MUI
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    CircularProgress: () => null,
  };
});

jest.mock('@mui/icons-material/Delete', () => ({
  __esModule: true,
  default: () => 'delete',
}));

jest.mock('@mui/icons-material/Add', () => ({
  __esModule: true,
  default: () => 'add',
}));

describe('AlertsManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useTokenForgeAdmin } = jest.requireMock('../../../hooks/useTokenForgeAdmin');
    useTokenForgeAdmin.mockReturnValue({
      contract: {
        addAlertRule: jest.fn().mockResolvedValue({ hash: '0x123' }),
        toggleAlertRule: jest.fn().mockResolvedValue({ hash: '0x123' }),
        deleteAlertRule: jest.fn().mockResolvedValue({ hash: '0x123' }),
      },
      isLoading: false,
      error: null
    });
  });

  it('renders alert rules list', async () => {
    render(<AlertsManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Rule 1')).toBeInTheDocument();
      expect(screen.getByText('Test Rule 2')).toBeInTheDocument();
    });
  });

  it('handles adding a new rule', async () => {
    render(<AlertsManagement />);

    const nameInput = screen.getByLabelText(/nom de la règle/i);
    const conditionInput = screen.getByLabelText(/condition/i);
    
    fireEvent.change(nameInput, { target: { value: 'New Rule' } });
    fireEvent.change(conditionInput, { target: { value: 'value > 200' } });

    const addButton = screen.getByRole('button', { name: /ajouter une règle/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'addAlertRule',
        args: ['New Rule', 'value > 200'],
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles toggling a rule', async () => {
    render(<AlertsManagement />);

    const toggleSwitch = screen.getAllByRole('checkbox')[0];
    fireEvent.click(toggleSwitch);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'toggleAlertRule',
        args: [BigInt(1)],
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles deleting a rule', async () => {
    render(<AlertsManagement />);

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith({
        abi: TokenForgeFactoryABI.abi,
        address: TOKEN_FORGE_ADDRESS,
        functionName: 'deleteAlertRule',
        args: [BigInt(1)],
      });
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
