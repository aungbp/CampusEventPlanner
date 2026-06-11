
export default {
  clearMocks: true,

  collectCoverage: true,

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.test.*',
    '!src/**/__tests__/**',
    '!src/vite-env.d.ts',
  ],

  coverageDirectory: 'coverage',

  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  errorOnDeprecated: true,

  moduleFileExtensions: [
    'js',
    'mjs',
    'cjs',
    'jsx',
    'ts',
    'mts',
    'cts',
    'tsx',
    'json',
    'node',
  ],

  restoreMocks: true,

  setupFiles: ['<rootDir>/tests/setupIndexedDB.js'],

  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  testEnvironment: 'jsdom',

  testMatch: ['**/tests/**/*.test.(js|jsx|ts|tsx)'],

  testPathIgnorePatterns: ['\\\\node_modules\\\\'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  transformIgnorePatterns: ['\\\\node_modules\\\\'],

}
