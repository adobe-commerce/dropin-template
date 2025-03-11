import { initialize } from './initialize';

describe('Cart/api/initialize', () => {
  const listeners = new Set<any>();

  beforeEach(() => {
    jest.clearAllMocks();

    listeners.forEach((listener) => {
      listener.off();
    });

    initialize.listeners().forEach((listener) => {
      listeners.add(listener);
    });
  });

  test('set config', async () => {
    await expect(initialize.init({})).resolves.toBeUndefined();

    expect(initialize.config.getConfig()).toEqual({});
  });
});
