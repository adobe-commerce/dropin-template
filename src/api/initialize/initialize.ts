import { Config, Initializer } from '@adobe/elsie/lib';
// import { events } from '@adobe/event-bus';

type ConfigProps = {};

export const config = new Config<ConfigProps>({});

export const initialize = new Initializer({
  init: async (_config?: ConfigProps) => {
    if (_config) config.setConfig(_config);
  },

  listeners: () => [
    // events.on('authenticated', (authenticated) => {
    //   console.log('authenticated', authenticated);
    // }),
  ],
});
