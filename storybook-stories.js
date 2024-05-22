const { name } = require('./.elsie');

module.exports = {
  stories: [
    {
      directory: './src',
      titlePrefix: name,
      files: '**/*.(mdx|stories.@(js|jsx|ts|tsx))',
    },
  ],
};
