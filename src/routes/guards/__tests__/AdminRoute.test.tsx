import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AdminRoute from '../AdminRoute';
import authReducer from '../../../store/slices/authSlice';

describe('AdminRoute', () => {
  const createMockStore = (isAuthenticated: boolean, isAdmin: boolean) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated,
          isAdmin,
          address: '0x123',
        },
      },
    });
  };

  const renderWithProviders = (
    element: React.ReactElement,
    { isAuthenticated = false, isAdmin = false } = {}
  ) => {
    const store = createMockStore(isAuthenticated, isAdmin);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  {element}
                </AdminRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('redirects to login when user is not authenticated', () => {
    renderWithProviders(<div>Admin Content</div>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to unauthorized when user is authenticated but not admin', () => {
    renderWithProviders(<div>Admin Content</div>, { isAuthenticated: true, isAdmin: false });
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders children when user is authenticated and admin', () => {
    renderWithProviders(<div>Admin Content</div>, { isAuthenticated: true, isAdmin: true });
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
