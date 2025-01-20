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
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleDirectories: ['node_modules', 'src'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};