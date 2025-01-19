import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AlertForm } from '../AlertForm';

describe('AlertForm', () => {
  const mockOnNameChange = jest.fn();
  const mockOnConditionChange = jest.fn();
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    newRuleName: '',
    newRuleCondition: '',
    onNameChange: mockOnNameChange,
    onConditionChange: mockOnConditionChange,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements', () => {
    render(<AlertForm {...defaultProps} />);
    
    expect(screen.getByLabelText(/nom de la règle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('calls onChange handlers when inputs change', () => {
    render(<AlertForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/nom de la règle/i);
    const conditionInput = screen.getByLabelText(/condition/i);

    fireEvent.change(nameInput, { target: { value: 'New Rule' } });
    fireEvent.change(conditionInput, { target: { value: 'value > 100' } });

    expect(mockOnNameChange).toHaveBeenCalledWith('New Rule');
    expect(mockOnConditionChange).toHaveBeenCalledWith('value > 100');
  });

  it('disables submit button when inputs are empty', () => {
    render(<AlertForm {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both inputs have values', () => {
    render(
      <AlertForm
        {...defaultProps}
        newRuleName="Test Rule"
        newRuleCondition="value > 0"
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit when button is clicked', () => {
    render(
      <AlertForm
        {...defaultProps}
        newRuleName="Test Rule"
        newRuleCondition="value > 0"
      />
    );
    
    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
