const path = require('path');

const { name } = require('./.elsie');

module.exports = {
  stories: [
    {
      directory: path.resolve(__dirname, './src'),
      titlePrefix: name,
      files: '**/*.mdx',
    },
    {
      directory: path.resolve(__dirname, './src'),
      titlePrefix: name,
      files: '**/*.stories.@(js|jsx|ts|tsx)',
    },
  ],
};
