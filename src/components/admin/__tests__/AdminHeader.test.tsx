import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminHeader } from '../AdminHeader';

describe('AdminHeader', () => {
  it('renders the header title', () => {
    render(<AdminHeader />);
    expect(screen.getByText('Tableau de bord administrateur')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<AdminHeader />);
    expect(
      screen.getByText(/Gérez les paramètres du contrat, les alertes et consultez les logs d'audit/)
    ).toBeInTheDocument();
  });

  it('renders with correct HTML structure', () => {
    render(<AdminHeader />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Tableau de bord administrateur');
  });
});
