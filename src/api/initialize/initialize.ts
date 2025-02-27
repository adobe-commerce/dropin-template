import { Initializer } from '@adobe/elsie/lib';
import { Lang } from '@adobe/elsie/i18n';
// import { events } from '@adobe/event-bus';

type ConfigProps = {
  langDefinitions?: Lang;
};

export const initialize = new Initializer<ConfigProps>({
  init: async (config) => {
    const defaultConfig = {};

    initialize.config.setConfig({ ...defaultConfig, ...config });
  },

  listeners: () => [
    // events.on('authenticated', (authenticated) => {
    //   console.log('authenticated', authenticated);
    // }),
  ],
});

export const config = initialize.config;
