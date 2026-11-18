import { createConfig } from '@adobe-commerce/elsie/storybook/config';
import config from '../.elsierc.json' with { type: 'json' };

export default createConfig({
  stories: [{ directory: '../src', titlePrefix: config.name }],
  staticDirs: ['./public'],
});
