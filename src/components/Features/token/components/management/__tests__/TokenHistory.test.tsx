import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TokenHistory } from '../TokenHistory';
import { TokenEvent } from '../../../types';

describe('TokenHistory', () => {
  const mockTokenAddress = '0x1234567890123456789012345678901234567890';

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays loading state initially', () => {
    render(<TokenHistory tokenAddress={mockTokenAddress} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays empty state when no events are found', async () => {
    // Mock the useEffect to resolve immediately with no events
    jest.spyOn(React, 'useEffect').mockImplementationOnce((cb) => cb());

    render(<TokenHistory tokenAddress={mockTokenAddress} />);

    await waitFor(() => {
      expect(screen.getByText('No events found for this token')).toBeInTheDocument();
    });
  });

  it('displays events in a table when data is loaded', async () => {
    const mockEvents: TokenEvent[] = [
      {
        id: '1',
        event: 'Transfer',
        from: '0x1234...5678',
        to: '0x8765...4321',
        amount: '1000',
        timestamp: Date.now(),
        transactionHash: '0xabcd...efgh',
      },
    ];

    // Mock the useEffect to set events
    jest.spyOn(React, 'useEffect').mockImplementationOnce((cb) => {
      const setState = jest.fn();
      setState(mockEvents);
      return cb();
    });

    render(<TokenHistory tokenAddress={mockTokenAddress} />);

    await waitFor(() => {
      expect(screen.getByText('Transfer')).toBeInTheDocument();
      expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
      expect(screen.getByText('0x8765...4321')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const mockEvents: TokenEvent[] = Array.from({ length: 25 }, (_, i) => ({
      id: i.toString(),
      event: 'Transfer',
      from: `0x${i}...`,
      to: `0x${i + 1}...`,
      amount: (i * 100).toString(),
      timestamp: Date.now(),
      transactionHash: `0xabcd...${i}`,
    }));

    // Mock the useEffect to set events
    jest.spyOn(React, 'useEffect').mockImplementationOnce((cb) => {
      const setState = jest.fn();
      setState(mockEvents);
      return cb();
    });

    render(<TokenHistory tokenAddress={mockTokenAddress} />);

    // Wait for the table to be rendered
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Check initial page
    expect(screen.getByText('0x0...')).toBeInTheDocument();
    expect(screen.queryByText('0x15...')).not.toBeInTheDocument();

    // Go to next page
    fireEvent.click(screen.getByRole('button', { name: /next page/i }));

    // Check second page
    await waitFor(() => {
      expect(screen.queryByText('0x0...')).not.toBeInTheDocument();
      expect(screen.getByText('0x15...')).toBeInTheDocument();
    });
  });

  it('allows changing rows per page', async () => {
    const mockEvents: TokenEvent[] = Array.from({ length: 25 }, (_, i) => ({
      id: i.toString(),
      event: 'Transfer',
      from: `0x${i}...`,
      to: `0x${i + 1}...`,
      amount: (i * 100).toString(),
      timestamp: Date.now(),
      transactionHash: `0xabcd...${i}`,
    }));

    // Mock the useEffect to set events
    jest.spyOn(React, 'useEffect').mockImplementationOnce((cb) => {
      const setState = jest.fn();
      setState(mockEvents);
      return cb();
    });

    render(<TokenHistory tokenAddress={mockTokenAddress} />);

    // Wait for the table to be rendered
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Change rows per page to 25
    fireEvent.mouseDown(screen.getByRole('button', { name: /rows per page/i }));
    fireEvent.click(screen.getByRole('option', { name: '25' }));

    // Check that more rows are visible
    await waitFor(() => {
      expect(screen.getByText('0x0...')).toBeInTheDocument();
      expect(screen.getByText('0x24...')).toBeInTheDocument();
    });
  });
});
