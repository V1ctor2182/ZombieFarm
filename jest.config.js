/** @type {import('jest').Config} */
export default {
  // Test environment - jsdom for React/DOM testing
  testEnvironment: 'jsdom',

  // TypeScript transformation
  preset: 'ts-jest',

  // Use ts-jest for ESM support
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Module name mapper for path aliases (must match tsconfig.json)
  moduleNameMapper: {
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    // Mock Phaser to avoid canvas API errors in jsdom
    '^phaser$': '<rootDir>/src/__mocks__/phaser.ts',
  },

  // Transform configuration for TypeScript files
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },

  // Test file patterns - only test files in src/
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)',
    '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // Coverage thresholds (enforces quality standards)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },

  // Coverage output
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Ignore patterns - exclude reference codebases and build artifacts
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/Sunflowerland-ref/',
    '/coverage/',
  ],

  // Module paths
  modulePaths: ['<rootDir>/src'],

  // Verbose output for better debugging
  verbose: true,

  // Clear mocks between tests automatically
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Maximum worker threads for parallel test execution
  maxWorkers: '50%',
};
