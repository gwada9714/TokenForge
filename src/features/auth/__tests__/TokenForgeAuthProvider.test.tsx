import { render, renderHook } from '@testing-library/react';
import { TokenForgeAuthProvider, useTokenForgeAuthContext } from '../context/TokenForgeAuthProvider';

describe('TokenForgeAuthProvider', () => {
  it('should provide auth context to children', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TokenForgeAuthProvider>{children}</TokenForgeAuthProvider>
    );

    const { result } = renderHook(() => useTokenForgeAuthContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isConnected).toBe(false);
  });

  it('should throw error when used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn(); // Suppress React error logging

    expect(() => {
      renderHook(() => useTokenForgeAuthContext());
    }).toThrow('useTokenForgeAuthContext must be used within a TokenForgeAuthProvider');

    console.error = consoleError; // Restore console.error
  });

  it('should render children', () => {
    const TestChild = () => <div data-testid="test-child">Test</div>;

    const { getByTestId } = render(
      <TokenForgeAuthProvider>
        <TestChild />
      </TokenForgeAuthProvider>
    );

    expect(getByTestId('test-child')).toBeInTheDocument();
  });
});
