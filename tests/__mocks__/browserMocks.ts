// Override BroadcastChannel Mock
jest.spyOn(Date, 'now').mockImplementation(() => 0);

class BroadcastChannelMock {
  static callbacks = new Set<Function>();

  postMessage(data: any) {
    BroadcastChannelMock.callbacks.forEach((callback) => {
      callback({ data });
    });
  }

  addEventListener(_type: string, callback: Function) {
    BroadcastChannelMock.callbacks.add(callback);
  }

  close() {
    BroadcastChannelMock.callbacks.clear();
  }
}

// Override BroadcastChannel mock from Elsie
jest
  .spyOn(window, 'BroadcastChannel')
  // @ts-ignore
  .mockImplementation(() => new BroadcastChannelMock());
