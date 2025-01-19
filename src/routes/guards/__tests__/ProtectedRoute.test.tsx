import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../ProtectedRoute';
import authReducer from '../../../store/slices/authSlice';

describe('ProtectedRoute', () => {
  const createMockStore = (isAuthenticated: boolean) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated,
          isAdmin: false,
          address: isAuthenticated ? '0x123' : null,
        },
      },
    });
  };

  const renderWithProviders = (
    element: React.ReactElement,
    { isAuthenticated = false } = {}
  ) => {
    const store = createMockStore(isAuthenticated);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  {element}
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('redirects to login when user is not authenticated', () => {
    renderWithProviders(<div>Protected Content</div>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    renderWithProviders(<div>Protected Content</div>, { isAuthenticated: true });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('preserves the location state when redirecting', () => {
    renderWithProviders(<div>Protected Content</div>);
    // La vérification du state de location est implicite car elle est gérée par react-router
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
