import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UnauthorizedPage } from '../UnauthorizedPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('UnauthorizedPage', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <UnauthorizedPage />
      </BrowserRouter>
    );
  });

  it('renders access denied message', () => {
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('has home button that navigates to home', () => {
    const homeButton = screen.getByText('Go to Home');
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('has back button that navigates back', () => {
    const backButton = screen.getByText('Go Back');
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
