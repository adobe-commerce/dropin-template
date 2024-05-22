import { name } from '../.elsie';

export const stories = [
  {
    directory: '../src',
    titlePrefix: name,
  },
];

export const framework = '@storybook/preact-vite';

export const addons = [
  '@storybook/addon-essentials',
  '@storybook/addon-a11y',
  '@storybook/addon-interactions',
  '@storybook/addon-coverage',
  '@adobe/elsie/config/storybook/addon',
  '@adobe/elsie/storybook-stories', // core stories
];

export const staticDirs = ['./public'];
