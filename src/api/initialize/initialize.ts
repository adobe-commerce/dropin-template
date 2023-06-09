import { Initializer } from '@adobe/elsie/lib';
// import { events } from '@adobe/event-bus';

type ConfigProps = {};

export const initialize = new Initializer<ConfigProps>({
  init: async (config) => {
    //
  },

  listeners: () => [
    // events.on('authenticated', (authenticated) => {
    //   console.log('authenticated', authenticated);
    // }),
  ],
});

export const config = initialize.config;
