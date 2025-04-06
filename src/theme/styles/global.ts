import { createGlobalStyle } from "styled-components";
import { THEME, COLORS } from "@/config/constants/theme";

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: ${THEME.PRIMARY};
    --color-secondary: ${THEME.SECONDARY};
    --color-success: ${THEME.SUCCESS};
    --color-warning: ${THEME.WARNING};
    --color-error: ${THEME.ERROR};
    --color-info: ${THEME.INFO};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
    background-color: ${COLORS.background.secondary};
    color: ${COLORS.text.primary};
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${COLORS.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${COLORS.text.secondary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${COLORS.text.primary};
  }
`;
