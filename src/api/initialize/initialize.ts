import {
  State,
  Initializer,
  // events,
} from '@adobe/elsie/lib';

type Config = {};

export const config = new State<Config>({});

export const initialize = new Initializer({
  init: async (_config: Config) => {},

  listeners: () => [],
});
