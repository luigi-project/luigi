import { ConfigHelpers } from "../../../src/utilities/helpers/config-helpers";

describe('ConfigHelpers', () => {
    let getConfigValue: jest.Mock;
    let getConfigValueAsync: jest.Mock;
    let getEngine: jest.Mock;

    beforeEach(() => {
        getConfigValue = jest.fn();
        getConfigValueAsync = jest.fn();
        getEngine = jest.fn();
        jest.spyOn(window, 'window', 'get').mockImplementation(() => { return {
            Luigi : {
                getConfigValue,
                getConfigValueAsync,
                getEngine
            }
        } as (Window & typeof globalThis)});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('getConfigValue', () => {
        ConfigHelpers.getConfigValue('some.config.value');
        expect(getConfigValue).toHaveBeenCalledWith('some.config.value');
    });

    it('getConfigValueAsync', () => {
        ConfigHelpers.getConfigValueAsync('some.config.value.async');
        expect(getConfigValueAsync).toHaveBeenCalledWith('some.config.value.async');
    });

    it('executeConfigFnAsync', () => {
        const syncFn = jest.fn();
        const error = new Error('Computer says NO!');
        const promFn = (param: unknown) => {
            return new Promise((resolve) => {
                resolve(param);
            });
        }
        getConfigValue.mockImplementation((key: string) => {
            if (key === 'some.config.fn') {
                return syncFn;
            } else if (key === 'some.config.asyncFn') {
                return promFn;
            } else if (key === 'some.config.fnThrowingError') {
                return () => {
                    throw error;
                };
            }
            return undefined;
        });
        const syncRes = ConfigHelpers.executeConfigFnAsync('some.config.fn', true, 'param');
        expect(syncFn).toHaveBeenCalledWith('param');
        expect(syncRes).toHaveProperty('then');
        
        const asyncRes = ConfigHelpers.executeConfigFnAsync('some.config.asyncFn', true, 'param');                
        expect(asyncRes).toHaveProperty('then');
        
        expect(ConfigHelpers.executeConfigFnAsync('some.config.notexists', true, 'param')).resolves.toEqual(undefined);
        expect(ConfigHelpers.executeConfigFnAsync('some.config.fnThrowingError', true, 'param')).rejects.toEqual(error);
        expect(ConfigHelpers.executeConfigFnAsync('some.config.fnThrowingError', false, 'param')).resolves.toEqual(undefined);
    });

    it('setErrorMessage', () => {
        const connFatalErrorFn = jest.fn();
        getEngine.mockReturnValue({
            _connector: {
                showFatalError: connFatalErrorFn
            }
        });
        ConfigHelpers.setErrorMessage('ERROR!');
        expect(connFatalErrorFn).toHaveBeenCalledWith('ERROR!');
    });
});