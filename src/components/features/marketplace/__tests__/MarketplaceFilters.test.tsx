import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarketplaceFilters } from '../components/MarketplaceFilters';

describe('MarketplaceFilters', () => {
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    mockOnFilter.mockClear();
  });

  it('renders all filter fields', () => {
    render(<MarketplaceFilters onFilter={mockOnFilter} />);

    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prix min/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prix max/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/trier par/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/direction/i)).toBeInTheDocument();
  });

  it('calls onFilter with default values when mounted', () => {
    render(<MarketplaceFilters onFilter={mockOnFilter} />);
    
    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'active',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  });

  it('updates status filter correctly', () => {
    render(<MarketplaceFilters onFilter={mockOnFilter} />);
    
    const statusSelect = screen.getByLabelText(/statut/i);
    fireEvent.change(statusSelect, { target: { value: 'sold' } });
    
    const applyButton = screen.getByText(/appliquer/i);
    fireEvent.click(applyButton);

    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      status: 'sold',
    }));
  });

  it('updates price filters correctly', () => {
    render(<MarketplaceFilters onFilter={mockOnFilter} />);
    
    const minPriceInput = screen.getByLabelText(/prix min/i);
    const maxPriceInput = screen.getByLabelText(/prix max/i);
    
    fireEvent.change(minPriceInput, { target: { value: '100' } });
    fireEvent.change(maxPriceInput, { target: { value: '1000' } });
    
    const applyButton = screen.getByText(/appliquer/i);
    fireEvent.click(applyButton);

    expect(mockOnFilter).toHaveBeenCalledWith(expect.objectContaining({
      minPrice: '100',
      maxPrice: '1000',
    }));
  });

  it('resets filters to default values', () => {
    render(<MarketplaceFilters onFilter={mockOnFilter} />);
    
    // Change some values first
    const minPriceInput = screen.getByLabelText(/prix min/i);
    fireEvent.change(minPriceInput, { target: { value: '100' } });
    
    // Reset filters
    const resetButton = screen.getByText(/réinitialiser/i);
    fireEvent.click(resetButton);

    expect(mockOnFilter).toHaveBeenCalledWith({
      status: 'active',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
  });
});
