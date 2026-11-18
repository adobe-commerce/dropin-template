import {
  defineConfig,
  globals,
  typescript,
  preact,
  tests,
} from '@adobe-commerce/elsie/configs/eslint.js';

export default defineConfig(
  globals('browser', ['src/**', 'tests/**', '.storybook/preview.jsx']),
  globals('node', ['*.js', '.storybook/*.js', '.storybook/preview.jsx']),
  typescript(),
  preact(),
  tests(),
);
