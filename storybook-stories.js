import config from './.elsierc.json' with { type: 'json' };

export default {
  stories: [
    {
      directory: './src',
      titlePrefix: config.name,
      files: '**/*.(mdx|stories.@(js|jsx|ts|tsx))',
    },
  ],
};
