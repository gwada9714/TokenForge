import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { theme } from '../../../styles/theme';
import { Container, Title, Subtitle, Text, Button, LinkButton } from '../../../components/common/styles';

const renderWithTheme = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('Common Style Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Container', () => {
    it('should render with correct styles', () => {
      renderWithTheme(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container).toBeDefined();
      expect(container.style.padding).toBe('1rem');
      expect(container.style.margin).toBe('0 auto');
      expect(container.style.maxWidth).toBe('1200px');
    });
  });

  describe('Title', () => {
    it('should render with correct styles', () => {
      renderWithTheme(<Title data-testid="title">Title</Title>);
      const title = screen.getByTestId('title');
      expect(title).toBeDefined();
      expect(title.style.fontSize).toBe('2rem');
      expect(title.style.fontWeight).toBe('bold');
      expect(title.style.marginBottom).toBe('1rem');
    });
  });

  describe('Subtitle', () => {
    it('should render with correct styles', () => {
      renderWithTheme(<Subtitle data-testid="subtitle">Subtitle</Subtitle>);
      const subtitle = screen.getByTestId('subtitle');
      expect(subtitle).toBeDefined();
      expect(subtitle.style.fontSize).toBe('1.5rem');
      expect(subtitle.style.fontWeight).toBe('normal');
      expect(subtitle.style.marginBottom).toBe('0.5rem');
    });
  });

  describe('Text', () => {
    it('should render with correct styles', () => {
      renderWithTheme(<Text data-testid="text">Text</Text>);
      const text = screen.getByTestId('text');
      expect(text).toBeDefined();
      expect(text.style.fontSize).toBe('1rem');
      expect(text.style.lineHeight).toBe('1.5');
    });
  });

  describe('Button', () => {
    it('should render with correct styles and handle click', async () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <Button data-testid="button" onClick={handleClick}>
          Click me
        </Button>
      );
      
      const button = screen.getByTestId('button');
      expect(button).toBeDefined();
      expect(button.style.padding).toBe('0.5rem 1rem');
      expect(button.style.borderRadius).toBe('4px');
      expect(button.style.cursor).toBe('pointer');

      await userEvent.click(button);
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should render disabled state correctly', () => {
      renderWithTheme(
        <Button data-testid="button" disabled>
          Disabled
        </Button>
      );
      
      const button = screen.getByTestId('button') as HTMLButtonElement;
      expect(button).toBeDefined();
      expect(button.disabled).toBe(true);
      expect(button.style.opacity).toBe('0.5');
      expect(button.style.cursor).toBe('not-allowed');
    });
  });

  describe('LinkButton', () => {
    it('should render with correct styles and attributes', () => {
      renderWithTheme(
        <LinkButton data-testid="link-button" to="/test">
          Link
        </LinkButton>
      );
      
      const linkButton = screen.getByTestId('link-button');
      expect(linkButton).toBeDefined();
      expect(linkButton.getAttribute('href')).toBe('/test');
      expect(linkButton.style.textDecoration).toBe('none');
      expect(linkButton.style.display).toBe('inline-block');
    });
  });
});