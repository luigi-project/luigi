import { storageManager } from '../src/storageManager';
import { helpers } from '../src/helpers';

describe('StorageManager', () => {
  let sendPostMessageSpy;
  let getRandomIdSpy;

  beforeEach(() => {
    getRandomIdSpy = jest.spyOn(helpers, 'getRandomId').mockImplementation(() => 'test');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize storage event processor', () => {
      expect(storageManager.storageEventProcessor).toBeTruthy();
    });
  });

  describe('setItem', () => {
    it('should store an item for a specific key if promise is resolved', async () => {
      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'OK',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.setItem(resultMock.key, resultMock.value);

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'setItem', resultMock);
      expect(promiseResult).toEqual(resultMock);
    });

    it('should reject when `setItem` operation fails', async () => {
      expect.assertions(2);

      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'ERROR',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.setItem(resultMock.key, resultMock.value);
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'setItem', resultMock);
        expect(error).toEqual(resultMock);
      }
    });
  });

  describe('getItem', () => {
    it('should get stored item for a specific key if promise is resolved', async () => {
      const keyMock = 'test';
      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'OK',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.getItem(keyMock);

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'getItem', { key: keyMock });
      expect(promiseResult).toEqual(resultMock);
    });

    it('should reject when `getItem` operation fails', async () => {
      expect.assertions(2);

      const keyMock = 'test';
      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'ERROR',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.getItem(keyMock);
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'getItem', {
          key: keyMock
        });
        expect(error).toEqual(resultMock);
      }
    });
  });

  describe('removeItem', () => {
    it('should remove item for a specific key if promise is resolved', async () => {
      const keyMock = 'test';
      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'OK',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.removeItem(keyMock);

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'removeItem', {
        key: keyMock
      });
      expect(promiseResult).toEqual(resultMock);
    });

    it('should reject when `removeItem` operation fails', async () => {
      expect.assertions(2);

      const keyMock = 'test';
      const resultMock = {
        key: 'keyExample',
        value: 'valueExample'
      };

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'ERROR',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.removeItem(keyMock);
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'removeItem', {
          key: keyMock
        });
        expect(error).toEqual(resultMock);
      }
    });
  });

  describe('clear', () => {
    it('should remove all stored items if promise is resolved', async () => {
      const resultMock = {};

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'OK',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.clear();

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'clear', resultMock);
      expect(promiseResult).toEqual(resultMock);
    });

    it('should reject when `clear` operation fails', async () => {
      expect.assertions(2);

      const resultMock = {};

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'ERROR',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.clear();
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'clear', resultMock);
        expect(error).toEqual(resultMock);
      }
    });
  });

  describe('has', () => {
    it('should check if item exists for a specific key if promise is resolved', async () => {
      const keyMock = 'test';

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'OK',
              result: true
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.has(keyMock);

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'has', { key: keyMock });
      expect(promiseResult).toEqual(true);
    });

    it('should reject when `has` operation fails', async () => {
      expect.assertions(2);

      const keyMock = 'test';

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: keyMock,
              status: 'ERROR',
              result: false
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.has(keyMock);
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'has', { key: keyMock });
        expect(error).toEqual(false);
      }
    });
  });

  describe('getAllKeys', () => {
    it('should get all the keys used in the storage if promise is resolved', async () => {
      const resultMock = ['foo', 'bar'];

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'OK',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');
      const promiseResult = await storageManager.getAllKeys();

      expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'getAllKeys', {});
      expect(promiseResult).toEqual(resultMock);
    });

    it('should reject when `getAllKeys` operation fails', async () => {
      expect.assertions(2);

      const resultMock = ['foo', 'bar'];

      sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {
        return storageManager.storageEventProcessor.processEvent({
          data: {
            data: {
              id: 'test',
              status: 'ERROR',
              result: resultMock
            }
          }
        });
      });

      const executeSpy = jest.spyOn(storageManager.storageEventProcessor, 'execute');

      try {
        await storageManager.getAllKeys();
      } catch (error) {
        expect(executeSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), 'getAllKeys', {});
        expect(error).toEqual(resultMock);
      }
    });
  });
});
