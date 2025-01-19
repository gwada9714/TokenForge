import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertList } from '../AlertList';
import type { AlertRule } from '../../../../../types/contracts';

describe('AlertList', () => {
  const mockOnToggleRule = jest.fn();
  const mockOnDeleteRule = jest.fn();

  const mockRules: AlertRule[] = [
    { id: 1, name: 'Rule 1', condition: 'value > 10', enabled: true },
    { id: 2, name: 'Rule 2', condition: 'value < 5', enabled: false },
  ];

  const defaultProps = {
    rules: mockRules,
    onToggleRule: mockOnToggleRule,
    onDeleteRule: mockOnDeleteRule,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all rules', () => {
    render(<AlertList {...defaultProps} />);
    
    expect(screen.getByText('Rule 1')).toBeInTheDocument();
    expect(screen.getByText('value > 10')).toBeInTheDocument();
    expect(screen.getByText('Rule 2')).toBeInTheDocument();
    expect(screen.getByText('value < 5')).toBeInTheDocument();
  });

  it('calls onToggleRule when switch is clicked', () => {
    render(<AlertList {...defaultProps} />);
    
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    
    expect(mockOnToggleRule).toHaveBeenCalledWith(1);
  });

  it('calls onDeleteRule when delete button is clicked', () => {
    render(<AlertList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDeleteRule).toHaveBeenCalledWith(1);
  });

  it('renders switches with correct enabled state', () => {
    render(<AlertList {...defaultProps} />);
    
    const switches = screen.getAllByRole('switch');
    expect(switches[0]).toBeChecked();
    expect(switches[1]).not.toBeChecked();
  });

  it('renders empty list when no rules provided', () => {
    render(<AlertList {...defaultProps} rules={[]} />);
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});
