import { render, screen } from '@testing-library/react';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RouterProvider } from 'react-router-dom';
import { router } from '../routes';
import authReducer from '../../store/slices/authSlice';

// Mock des composants lazy-loadés
vi.mock('../../pages/Home', () => ({
  __esModule: true,
  default: () => <div>Home Page</div>,
}));

vi.mock('../../components/auth/LoginForm', () => ({
  __esModule: true,
  LoginForm: () => <div>Login Form</div>,
}));

describe('Router Configuration', () => {
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
    { isAuthenticated = false, isAdmin = false } = {}
  ) => {
    const store = createMockStore(isAuthenticated, isAdmin);
    return render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  };

  it('renders home page at root path', async () => {
    renderWithProviders();
    // Attendre le chargement des composants lazy
    await screen.findByText('Home Page');
    expect(screen.getByText('Home Page')).toBeTruthy();
  });

  it('renders login form at /login path', async () => {
    window.history.pushState({}, '', '/login');
    renderWithProviders();
    await screen.findByText('Login Form');
    expect(screen.getByText('Login Form')).toBeTruthy();
  });

  it('renders 404 page for unknown routes', async () => {
    window.history.pushState({}, '', '/unknown-route');
    renderWithProviders();
    await screen.findByText('404');
    expect(screen.getByText('404')).toBeTruthy();
  });

  // Nettoyage après chaque test
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });
});
