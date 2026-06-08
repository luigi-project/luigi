// Mock the Luigi global that auth plugins read at runtime.
// Tests that need different behavior can reassign these methods.
global.Luigi = {
  getConfigValue: jest.fn(() => undefined),
  executeConfigFnAsync: jest.fn(async (key, ack, ...args) => args[0]),
  auth: jest.fn(() => ({
    store: {
      setAuthData: jest.fn(),
      removeAuthData: jest.fn()
    },
    handleAuthEvent: jest.fn()
  }))
};
