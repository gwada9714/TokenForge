import type { ReactNode } from 'react';

const mockStyled = (Component: any) => Component;

const Button = ({ children }: { children: ReactNode }) => {
  return `<button>${children}</button>`;
};

const CircularProgress = () => {
  return `<div role="progressbar"></div>`;
};

module.exports = {
  Button,
  CircularProgress,
  styled: mockStyled,
  default: {
    Button,
    CircularProgress,
    styled: mockStyled,
  },
};
