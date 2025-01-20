import type { ReactNode } from 'react';
import React from 'react';

interface ButtonProps {
  children?: ReactNode;
  variant?: string;
  size?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  startIcon?: ReactNode;
}

interface CircularProgressProps {
  size?: number | string;
  thickness?: number;
  className?: string;
  color?: 'inherit' | 'primary' | 'secondary';
}

interface Theme {
  spacing: (value: number) => string;
  palette: {
    primary: { main: string };
    secondary: { main: string };
  };
}

const mockTheme: Theme = {
  spacing: (value: number) => `${value * 8}px`,
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
};

// Mock du composant Button
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, variant, size, fullWidth, disabled, startIcon, className: extraClassName, ...rest } = props;
  
  // Garder la taille en minuscules comme MUI le fait
  const formattedSize = size?.toLowerCase();
  
  const className = [
    'MuiButton-root',
    variant && `MuiButton-${variant}`,
    size && `MuiButton-size${formattedSize}`,
    fullWidth && 'MuiButton-fullWidth',
    extraClassName
  ].filter(Boolean).join(' ');

  return React.createElement('button', {
    ...rest,
    ref,
    className,
    disabled,
    'data-testid': 'mui-button',
    children: [
      startIcon && React.createElement('span', { 
        key: 'startIcon',
        className: 'MuiButton-startIcon'
      }, startIcon),
      children
    ].filter(Boolean)
  });
});

// Mock du composant CircularProgress
const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>((props, ref) => {
  const { className: extraClassName, ...rest } = props;
  
  const className = [
    'MuiCircularProgress-root',
    props.color && `MuiCircularProgress-${props.color}`,
    extraClassName
  ].filter(Boolean).join(' ');

  return React.createElement('div', {
    ...rest,
    ref,
    className,
    role: 'progressbar',
    'data-testid': 'mui-progress'
  });
});

// Mock de styled-components
const styled = (Component: any) => {
  return (styles: any) => {
    const StyledComponent = React.forwardRef((props: any, ref) => {
      const computedStyles = typeof styles === 'function' 
        ? styles({ theme: mockTheme }) 
        : styles;

      const componentProps = {
        ...props,
        ref,
        className: [
          props.className,
          'styled-component'
        ].filter(Boolean).join(' '),
        style: computedStyles
      };

      return React.createElement(Component, componentProps);
    });

    StyledComponent.displayName = `Styled(${Component.displayName || 'Component'})`;
    return StyledComponent;
  };
};

Button.displayName = 'Button';
CircularProgress.displayName = 'CircularProgress';

export { Button, CircularProgress, styled };
export default {
  Button,
  CircularProgress,
  styled
};
