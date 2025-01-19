import React from 'react';

const createMuiComponent = (tag: string, defaultProps = {}) => {
  return ({ children, ...props }: any) => 
    React.createElement(tag, { ...defaultProps, ...props }, children);
};

// Base components
export const Box = createMuiComponent('div');
export const Container = createMuiComponent('div', { className: 'MuiContainer-root' });
export const Paper = createMuiComponent('div', { className: 'MuiPaper-root' });
export const Card = createMuiComponent('div', { className: 'MuiCard-root' });
export const CardContent = createMuiComponent('div', { className: 'MuiCardContent-root' });

// Typography
export const Typography = ({ children, component = 'div', variant, ...props }: any) => 
  React.createElement(component, { 
    role: component === 'h1' ? 'heading' : undefined,
    'aria-level': component === 'h1' ? 1 : undefined,
    className: `MuiTypography-${variant}`,
    ...props 
  }, children);

// Form components
export const TextField = ({ label, ...props }: any) => 
  React.createElement('div', { className: 'MuiTextField-root' }, [
    React.createElement('label', { key: 'label' }, label),
    React.createElement('input', { 
      key: 'input',
      'aria-label': label,
      ...props 
    })
  ]);

export const Button = ({ children, variant = 'contained', ...props }: any) =>
  React.createElement('button', { 
    className: `MuiButton-root MuiButton-${variant}`,
    ...props 
  }, children);

// List components
export const List = createMuiComponent('ul', { className: 'MuiList-root' });
export const ListItem = createMuiComponent('li', { className: 'MuiListItem-root' });
export const ListItemText = ({ primary, secondary, ...props }: any) =>
  React.createElement('div', { 
    className: 'MuiListItemText-root',
    ...props 
  }, [
    React.createElement('div', { key: 'primary', className: 'MuiListItemText-primary' }, primary),
    secondary && React.createElement('div', { key: 'secondary', className: 'MuiListItemText-secondary' }, secondary)
  ]);

export const ListItemSecondaryAction = createMuiComponent('div', { className: 'MuiListItemSecondaryAction-root' });

// Switch component
export const Switch = (props: any) =>
  React.createElement('input', { 
    type: 'checkbox',
    role: 'switch',
    className: 'MuiSwitch-root',
    ...props 
  });

// Icon Button
export const IconButton = ({ children, 'aria-label': ariaLabel, ...props }: any) =>
  React.createElement('button', { 
    className: 'MuiIconButton-root',
    'aria-label': ariaLabel,
    ...props 
  }, children);

// Progress
export const CircularProgress = createMuiComponent('div', { 
  className: 'MuiCircularProgress-root',
  role: 'progressbar'
});

// Grid
export const Grid = createMuiComponent('div', { className: 'MuiGrid-root' });

// Icons (mock as text for simplicity)
export const DeleteIcon = () => 'delete';
export const AddIcon = () => 'add';
