import { defineConfig } from '@adobe-commerce/elsie/configs/jest.js';
import tsconfig from './tsconfig.json' with { type: 'json' };

const paths = Object.fromEntries(
  Object.entries(tsconfig.compilerOptions.paths).filter(
    ([alias]) => alias !== '@adobe-commerce/elsie/*',
  ),
);

export default defineConfig({
  preset: 'preact',

  setupFiles: ['<rootDir>/tests/__mocks__/browserMocks.ts'],
  paths,

  coverageThreshold: 100,
});
