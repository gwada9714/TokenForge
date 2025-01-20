/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '<rootDir>/src/setupTests.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@mui/material$': '<rootDir>/src/features/auth/components/__tests__/__mocks__/mui.ts',
    '^@mui/material/styles$': '<rootDir>/src/features/auth/components/__tests__/__mocks__/mui.ts',
    '^@mui/icons-material/.*$': '<rootDir>/src/features/auth/components/__tests__/__mocks__/mui.ts'
  },
  testMatch: [
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: true
    }]
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
      useESM: true
    },
    'import.meta': {
      env: {
        VITE_ENV: 'test',
        VITE_API_URL: 'http://localhost:3000',
        VITE_LOCAL_CHAIN_ID: '31337',
        VITE_MAINNET_RPC_URL: 'https://eth-mainnet.g.alchemy.com/v2/test',
        VITE_SEPOLIA_RPC_URL: 'https://eth-sepolia.g.alchemy.com/v2/test',
        VITE_ALCHEMY_API_KEY: 'test-key',
        VITE_WALLET_CONNECT_PROJECT_ID: 'test-project-id',
        VITE_SUPPORTED_CHAINS: '1,11155111',
        VITE_DEPLOYMENT_OWNER: '0x0000000000000000000000000000000000000000',
        VITE_DEFAULT_GAS_LIMIT: '3000000',
        VITE_GAS_PRICE_MULTIPLIER: '1.1',
        VITE_MAX_PRIORITY_FEE: '2',
        VITE_DEPLOYMENT_TIMEOUT: '120000',
        VITE_VERIFICATION_RETRIES: '5',
        VITE_BASIC_PLAN_PRICE: '100',
        VITE_PREMIUM_PLAN_PRICE: '1000',
        VITE_TKN_PAYMENT_DISCOUNT: '2000',
        VITE_ALLOW_THIRD_PARTY_COOKIES: 'false'
      }
    }
  }
};