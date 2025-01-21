import '@testing-library/jest-dom'

// Mock des variables d'environnement pour les tests
process.env.VITE_TOKEN_FACTORY_MAINNET = '0x1234567890123456789012345678901234567890'
process.env.VITE_TOKEN_FACTORY_SEPOLIA = '0x2345678901234567890123456789012345678901'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveStyle(style: Record<string, any>): R
    }
  }
}