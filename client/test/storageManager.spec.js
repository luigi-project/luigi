import { storageManager } from '../src/storageManager';

describe('StorageManager', () => {
  const pendingOperation = new Map();

  beforeEach(() => {
    storageManager.storageEventProcessor = {
      processEvent: jest.fn(),
      waitForSyncResult: jest.fn(),
      execute: jest.fn(),
      createPendingOperation: jest.fn(),
      sendMessage: jest.fn()
    };
  });

  afterEach(() => {
    pendingOperation.clear();
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize storage event processor', () => {
      expect(storageManager.storageEventProcessor).toBeTruthy();
    });
  });

  describe('setItem', () => {
    it('should store an item for a specific key', async () => {
      const storageKey = 'test';

      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          if (!pendingOperation.has(storageKey)) {
            pendingOperation.set(storageKey, params);
            resolve(params);
          }
        });

      const storedParams = await storageManager.setItem('keyExample', 'valueExample');

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'setItem',
        {
          key: 'keyExample',
          value: 'valueExample'
        }
      );
      expect(storedParams).toEqual({
        key: 'keyExample',
        value: 'valueExample'
      });
      expect(pendingOperation.size).toEqual(1);
    });
  });

  describe('getItem', () => {
    it('should get stored item for a specific key', async () => {
      const storageKey = 'test';

      pendingOperation.set(storageKey, { key: 'keyExample' });
      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          if (pendingOperation.has(storageKey)) {
            resolve(pendingOperation.get(storageKey));
          }
        });

      const storedItem = await storageManager.getItem(storageKey);

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'getItem',
        { key: storageKey }
      );
      expect(storedItem).toEqual({ key: 'keyExample' });
      expect(pendingOperation.size).toEqual(1);
    });
  });

  describe('removeItem', () => {
    it('should remove item for a specific key', async () => {
      const storageKey = 'test';

      pendingOperation.set(storageKey, { key: 'keyExample' });
      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          if (pendingOperation.has(storageKey)) {
            resolve(pendingOperation.get(storageKey));
            pendingOperation.delete(storageKey);
          }
        });

      expect(pendingOperation.size).toEqual(1);

      const removedItem = await storageManager.removeItem(storageKey);

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'removeItem',
        { key: storageKey }
      );
      expect(removedItem).toEqual({ key: 'keyExample' });
      expect(pendingOperation.size).toEqual(0);
    });
  });

  describe('clear', () => {
    it('should remove all stored items', async () => {
      pendingOperation.set('foo', { key: 'keyFoo' });
      pendingOperation.set('bar', { key: 'keyBar' });
      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          if (pendingOperation.size) {
            resolve();
            pendingOperation.clear();
          }
        });

      expect(pendingOperation.size).toEqual(2);

      const result = await storageManager.clear();

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'clear',
        {}
      );
      expect(result).toEqual(undefined);
      expect(pendingOperation.size).toEqual(0);
    });
  });

  describe('has', () => {
    it.each([
      { input: 'aaa', output: true },
      { input: 'bbb', output: false }
    ])('should check if item exists for a specific key', async (data) => {
      pendingOperation.set('aaa', { key: 'keyExample' });
      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          resolve(pendingOperation.has(data.input));
        });

      const result = await storageManager.has(data.input);

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'has',
        { key: data.input }
      );
      expect(result).toEqual(data.output);
    });
  });

  describe('getAllKeys', () => {
    it('should get all the keys used in the storage', async () => {
      pendingOperation.set('foo', { key: 'keyFoo' });
      pendingOperation.set('bar', { key: 'keyBar' });
      storageManager.storageEventProcessor.execute = jest
        .fn()
        .mockImplementation((resolve, reject, operation, params) => {
          if (pendingOperation.size) {
            resolve(Array.from(pendingOperation.keys()));
          }
        });

      const result = await storageManager.getAllKeys();

      expect(storageManager.storageEventProcessor.execute).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        'getAllKeys',
        {}
      );
      expect(result).toEqual(['foo', 'bar']);
      expect(pendingOperation.size).toEqual(2);
    });
  });
});
