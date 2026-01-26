import { AsyncHelpers } from './../../../src/utilities/helpers/async-helpers';
import { GenericHelpers } from './../../../src/utilities/helpers/generic-helpers';

const sinon = require('sinon');

describe('Async-helpers', () => {
  let clock: any;
  let obj: any;

  beforeEach(() => {
    // sinon.stub(LuigiConfig, 'getConfigValue');
    obj = {
      client: 'here'
    };
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    // sinon.restore();
    clock.restore();
  });

  describe('wrapAsPromise', () => {
    it('returns a wrapped promise', async () => {
      const value = 'my value';
      const prom = AsyncHelpers.wrapAsPromise(value);

      expect(GenericHelpers.isPromise(prom)).toBe(true);
      expect(await prom).toEqual(value);
    });
  });

  describe('applyFunctionPromisified', () => {
    it('executes a pure function and returns a new promise', async () => {
      const plainFunc = (one, two, three) => {
        return three;
      };
      const thirdParam = 'hello';
      const prom = AsyncHelpers.applyFunctionPromisified(plainFunc, [undefined, undefined, thirdParam]);

      expect(GenericHelpers.isPromise(prom)).toBe(true);
      expect(await prom).toEqual(thirdParam);
    });

    it('executes an async function and returns its promise', async () => {
      const promiseFunc = (one, two, three) => {
        return new Promise((resolve) => {
          resolve(three);
        });
      };
      const thirdParam = 'hello';
      const prom = AsyncHelpers.applyFunctionPromisified(promiseFunc, [undefined, undefined, thirdParam]);

      expect(GenericHelpers.isPromise(prom)).toBe(true);
      expect(await prom).toEqual(thirdParam);
    });
  });
});
