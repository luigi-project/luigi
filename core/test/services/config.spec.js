import { LuigiConfig } from '../../src/core-api';
import { AsyncHelpers, GenericHelpers } from './../../src/utilities/helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Config', () => {
  describe('getConfigBooleanValue', () => {
    it('should return correct boolean value', async () => {
      //given
      LuigiConfig.config = {
        truthyAttribute: 'true',
        truthAttribute: true,
        falseAttribute: false
      };

      // then
      assert.equal(LuigiConfig.getConfigBooleanValue('truthyAttribute'), true);
      assert.equal(LuigiConfig.getConfigBooleanValue('truthAttribute'), true);
      assert.equal(LuigiConfig.getConfigBooleanValue('falseAttribute'), false);
    });

    it('should fallback to false in case if invalid value', async () => {
      // given
      LuigiConfig.config = {
        foo: 'bar'
      };

      // then
      assert.equal(LuigiConfig.getConfigBooleanValue('foo'), false);
    });

    it('should fallback to false in case if undefined value', async () => {
      // given
      LuigiConfig.config = {};

      // then
      assert.equal(LuigiConfig.getConfigBooleanValue('whatever'), false);
      assert.equal(LuigiConfig.getConfigBooleanValue('whateverparent.whateverchild'), false);
    });
  });

  describe('executeConfigFnAsync', () => {
    it('returns correct value', async () => {
      //given
      LuigiConfig.config = {
        truthyFn: (param1, param2) => 'value' + param1 + param2,
        truthyFnAsync: (param1, param2) => Promise.resolve('value' + param1 + param2)
      };

      const resultTruthyFn = await LuigiConfig.executeConfigFnAsync('truthyFn', false, 'foo', 'bar');
      assert.equal(resultTruthyFn, 'valuefoobar');

      const resultTruthyFnAsync = await LuigiConfig.executeConfigFnAsync('truthyFnAsync', false, 'foo', 'bar');
      assert.equal(resultTruthyFnAsync, 'valuefoobar');
    });

    it('returns undefined on non-existing fn', async () => {
      //given
      LuigiConfig.config = {};

      const resultUndefined = await LuigiConfig.executeConfigFnAsync('not.existing.value');
      assert.isUndefined(resultUndefined, 'async fn result is not undefined');
    });

    it('returns undefined on error/rejected promise', async () => {
      //given
      LuigiConfig.config = {
        rejectFnAsync: (param1, param2) => Promise.reject(new Error('rejected')),
        errFnAsync: (param1, param2) => {
          throw new Error({
            name: 'someError',
            message: 'something went wrong'
          });
        }
      };

      const resultRejectFnAsync = await LuigiConfig.executeConfigFnAsync('rejectFnAsync');
      assert.isUndefined(resultRejectFnAsync, 'rejection did not return');

      const resultErrFnAsync = await LuigiConfig.executeConfigFnAsync('errFnAsync');
      assert.isUndefined(resultErrFnAsync, 'error did not return');
    });

    it('throws an error if throwError flag is set', async () => {
      sinon.stub(AsyncHelpers, 'applyFunctionPromisified').returns(Promise.reject(new Error('rejected')));
      //given
      LuigiConfig.config = {
        rejectFnAsync: (param1, param2) => {}
      };

      // second parameter throws an error and we want it to throw an error on failure
      // catching it here to be able to evaluate the error message
      let res;
      try {
        res = await LuigiConfig.executeConfigFnAsync('rejectFnAsync', true);
      } catch (error) {
        res = error;
      }
      assert.equal(res.message, 'rejected', 'return error does not equal');
    });
  });

  describe('User settings', () => {
    let localStorageSpy;

    beforeAll(() => {
      const lsMock = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
      localStorageSpy = jest.spyOn(global, 'localStorage', 'get');
      localStorageSpy.mockImplementation(() => {
        return lsMock;
      });
    });
    afterAll(() => {
      localStorageSpy.mockRestore();
    });
    afterEach(() => {
      sinon.restore();
      sinon.reset();
    });
    const userSettingsObj = {
      userSettings: {
        userSettingGroups: {}
      }
    };
    const myConfig = {
      storeUserSettings: () => {
        console.log('write');
      },
      readUserSettings: () => {
        console.log('read');
      }
    };

    it('write user settings to local storage', async () => {
      sinon.stub(LuigiConfig, 'configChanged');
      await LuigiConfig.storeUserSettings(userSettingsObj, userSettingsObj);
      sinon.assert.called(global.localStorage.setItem);
    });
    it('write user settings to custom storage', async () => {
      sinon.stub(LuigiConfig, 'configChanged');
      console.log = sinon.spy();
      sinon.stub(LuigiConfig, 'getConfigValueAsync').returns(myConfig);
      sinon.stub(GenericHelpers, 'isFunction').returns(true);
      await LuigiConfig.storeUserSettings(userSettingsObj, userSettingsObj);
      sinon.assert.calledOnce(console.log);
    });
    it('read user settings from local storage', async () => {
      sinon.stub(JSON, 'parse').returns(JSON.stringify(userSettingsObj));
      await LuigiConfig.readUserSettings();
      sinon.assert.called(global.localStorage.getItem);
    });
    it('read user settings from custom storage', async () => {
      console.log = sinon.spy();
      sinon.stub(LuigiConfig, 'getConfigValueAsync').returns(myConfig);
      sinon.stub(GenericHelpers, 'isFunction').returns(true);
      await LuigiConfig.readUserSettings();
      sinon.assert.calledOnce(console.log);
    });
  });

  describe('clearNavigationCache', () => {
    it('should clean navigation titleResolver cache', () => {
      LuigiConfig.config = {
        navigation: {
          nodes: {
            titleResolver: {
              url: 'http://localhost',
              _cache: {
                key: 'cacheKey',
                value: 'cacheValue'
              }
            }
          }
        }
      };
      LuigiConfig.clearNavigationCache();

      const actual = LuigiConfig.getConfigValue('navigation.titleResolver._cache');
      const expected = undefined;
      assert.equal(actual, expected);
    });
  });
});
