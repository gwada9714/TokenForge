import { render, screen } from '@testing-library/react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { adminRoutes } from '../adminRoutes';
import authReducer from '../../store/slices/authSlice';

// Mock des composants lazy-loadés
vi.mock('../../components/features/admin/AdminDashboard', () => ({
  __esModule: true,
  default: () => <div>Admin Dashboard</div>,
}));

vi.mock('../../components/features/admin/contract/ContractControls', () => ({
  __esModule: true,
  default: () => <div>Contract Controls</div>,
}));

describe('Admin Routes Configuration', () => {
  const createMockStore = (isAuthenticated = false, isAdmin = false) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated,
          isAdmin,
          address: isAuthenticated ? '0x123' : null,
        },
      },
    });
  };

  const renderWithProviders = (
    initialEntry: string,
    { isAuthenticated = true, isAdmin = true } = {}
  ) => {
    const store = createMockStore(isAuthenticated, isAdmin);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path={adminRoutes.path} element={adminRoutes.element}>
              {adminRoutes.children.map((route) => (
                route.index ? (
                  <Route key="index" index element={route.element} />
                ) : (
                  <Route key={route.path} path={route.path} element={route.element} />
                )
              ))}
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('renders admin dashboard at /admin path', async () => {
    renderWithProviders('/admin');
    await screen.findByText('Admin Dashboard');
    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
  });

  it('renders contract controls at /admin/contract path', async () => {
    renderWithProviders('/admin/contract');
    await screen.findByText('Contract Controls');
    expect(screen.getByText('Contract Controls')).toBeTruthy();
  });

  it('redirects to unauthorized when user is not admin', async () => {
    renderWithProviders('/admin', { isAuthenticated: true, isAdmin: false });
    await screen.findByText('Unauthorized Page');
    expect(screen.getByText('Unauthorized Page')).toBeTruthy();
  });

  it('redirects to login when user is not authenticated', async () => {
    renderWithProviders('/admin', { isAuthenticated: false, isAdmin: false });
    await screen.findByText('Login Page');
    expect(screen.getByText('Login Page')).toBeTruthy();
  });
});
