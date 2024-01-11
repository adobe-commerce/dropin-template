export const framework = {
  name: '@storybook/preact-webpack5',
  options: {},
};

export const addons = [
  '@storybook/addon-essentials',
  '@storybook/addon-a11y',
  '@adobe/elsie/config/storybook/addon',
  '@adobe/elsie/storybook-stories', // core stories
  '../storybook-stories', // this project stories
];

export const docs = {
  autodocs: true,
};

export const staticDirs = ['./public'];
