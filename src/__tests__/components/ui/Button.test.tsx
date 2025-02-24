import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { THEME_CONFIG } from '@/config/constants/theme';
import { Button } from '@/components/ui/Button';

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={THEME_CONFIG}>
      {component}
    </ThemeProvider>
  );
};

describe('Button Component', () => {
  it('renders with default props', () => {
    renderWithTheme(<Button>Test Button</Button>);
    const button = screen.getByText('Test Button');
    expect(button).toBeDefined();
    expect(button.tagName).toBe('BUTTON');
  });

  it('applies primary variant styles', () => {
    renderWithTheme(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.primary}
    `);
  });

  it('applies secondary variant styles', () => {
    renderWithTheme(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button).toHaveStyle(`
      background-color: ${THEME_CONFIG.colors.secondary}
    `);
  });

  it('applies outline variant styles', () => {
    renderWithTheme(<Button variant="outline">Outline</Button>);
    const button = screen.getByText('Outline');
    expect(button).toHaveStyle(`
      background-color: transparent;
      border: 1px solid ${THEME_CONFIG.colors.primary}
    `);
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Clickable</Button>);
    
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state correctly', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    
    expect(button).toBeDisabled();
    expect(button).toHaveStyle('opacity: 0.5');
  });

  it('applies full width style when specified', () => {
    renderWithTheme(<Button fullWidth>Full Width</Button>);
    const button = screen.getByText('Full Width');
    expect(button).toHaveStyle('width: 100%');
  });

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
    let button = screen.getByText('Small');
    expect(button).toHaveStyle('font-size: 0.875rem');

    rerender(
      <ThemeProvider theme={THEME_CONFIG}>
        <Button size="large">Large</Button>
      </ThemeProvider>
    );
    button = screen.getByText('Large');
    expect(button).toHaveStyle('font-size: 1.125rem');
  });
}); 