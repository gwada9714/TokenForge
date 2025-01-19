import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminTabs } from '../AdminTabs';

describe('AdminTabs', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all tabs with correct labels', () => {
    render(<AdminTabs value={0} onChange={mockOnChange} />);
    
    expect(screen.getByText('Contrôle du contrat')).toBeInTheDocument();
    expect(screen.getByText('Gestion de la propriété')).toBeInTheDocument();
    expect(screen.getByText('Alertes')).toBeInTheDocument();
    expect(screen.getByText('Logs & Statistiques')).toBeInTheDocument();
  });

  it('highlights the selected tab', () => {
    const { rerender } = render(<AdminTabs value={0} onChange={mockOnChange} />);
    expect(screen.getByText('Contrôle du contrat').closest('[role="tab"]')).toHaveAttribute('aria-selected', 'true');

    rerender(<AdminTabs value={1} onChange={mockOnChange} />);
    expect(screen.getByText('Gestion de la propriété').closest('[role="tab"]')).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when a tab is clicked', () => {
    render(<AdminTabs value={0} onChange={mockOnChange} />);
    
    fireEvent.click(screen.getByText('Alertes'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByText('Logs & Statistiques'));
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });

  it('renders all tab icons', () => {
    render(<AdminTabs value={0} onChange={mockOnChange} />);
    
    const tabs = screen.getAllByRole('tab');
    tabs.forEach(tab => {
      expect(tab.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('has correct ARIA attributes', () => {
    render(<AdminTabs value={0} onChange={mockOnChange} />);
    
    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab, index) => {
      expect(tab).toHaveAttribute('id', `tab-${index}`);
      expect(tab).toHaveAttribute('aria-controls', `tabpanel-${index}`);
    });
  });
});
