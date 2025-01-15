import '@testing-library/jest-dom'

declare module '@testing-library/jest-dom' {
  export interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveStyle(style: Record<string, any>): R
  }
} 