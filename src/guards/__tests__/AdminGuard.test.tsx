import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminGuard } from '../AdminGuard';
import { useTokenForgeAuth } from '@/features/auth/hooks/useTokenForgeAuth';
import { MemoryRouter } from 'react-router-dom';

// Mock the useTokenForgeAuth hook
vi.mock('@/features/auth/hooks/useTokenForgeAuth', () => ({
    useTokenForgeAuth: vi.fn()
}));

// Mock the Navigate component
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
    };
});

describe('AdminGuard', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should render children when user is authenticated and admin', () => {
        // Mock the hook to return authenticated and admin user
        vi.mocked(useTokenForgeAuth).mockReturnValue({
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false
        } as any);

        render(
            <MemoryRouter>
                <AdminGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AdminGuard>
            </MemoryRouter>
        );

        // Check that the children are rendered
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('should redirect to auth page when user is not authenticated', () => {
        // Mock the hook to return unauthenticated user
        vi.mocked(useTokenForgeAuth).mockReturnValue({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false
        } as any);

        render(
            <MemoryRouter>
                <AdminGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AdminGuard>
            </MemoryRouter>
        );

        // Check that it redirects to auth page
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/auth');
    });

    it('should redirect to home page when user is authenticated but not admin', () => {
        // Mock the hook to return authenticated but not admin user
        vi.mocked(useTokenForgeAuth).mockReturnValue({
            isAuthenticated: true,
            isAdmin: false,
            isLoading: false
        } as any);

        render(
            <MemoryRouter>
                <AdminGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AdminGuard>
            </MemoryRouter>
        );

        // Check that it redirects to home page
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toBeInTheDocument();
        expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });

    it('should show loading state when isLoading is true', () => {
        // Mock the hook to return loading state
        vi.mocked(useTokenForgeAuth).mockReturnValue({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: true
        } as any);

        render(
            <MemoryRouter>
                <AdminGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AdminGuard>
            </MemoryRouter>
        );

        // Check that it shows loading state
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
        expect(screen.getByText('Chargement...')).toBeInTheDocument();
    });
});
