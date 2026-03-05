import { GenericHelpers } from '../../../src/utilities/helpers/generic-helpers';

describe('Generic-helpers', () => {
  let locationSearchString: string;

  beforeAll(() => {
    jest.spyOn(window, 'window', 'get').mockImplementation(() => {
      return {
        location: {
          search: locationSearchString
        },
        crypto: globalThis.crypto
      } as unknown as Window & typeof globalThis;
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    locationSearchString = '';
  });

  it('getRandomId', () => {
    expect(typeof GenericHelpers.getRandomId()).toBe('number');
  });

  it('isFunction', () => {
    const func = () => {};
    expect(GenericHelpers.isFunction(func)).toEqual(true);
    expect(GenericHelpers.isFunction('foo')).toEqual(false);
    expect(GenericHelpers.isFunction(true)).toEqual(false);
    expect(GenericHelpers.isFunction(12345)).toEqual(false);
  });

  it('isString', () => {
    expect(GenericHelpers.isString('foo')).toEqual(true);
    expect(GenericHelpers.isString(true)).toEqual(false);
    expect(GenericHelpers.isString(12345)).toEqual(false);
  });

  it('isObject', () => {
    const obj = { foo: 'bar' };
    const func = () => {};
    expect(GenericHelpers.isObject(obj)).toEqual(true);
    expect(GenericHelpers.isObject(func)).toEqual(false);
    expect(GenericHelpers.isObject('foo')).toEqual(false);
    expect(GenericHelpers.isObject(true)).toEqual(false);
    expect(GenericHelpers.isObject(12345)).toEqual(false);
  });

  it('trimLeadingSlash', () => {
    expect(GenericHelpers.trimLeadingSlash('/luigi')).toEqual('luigi');
  });

  it('trimTrailingSlash', () => {
    expect(GenericHelpers.trimTrailingSlash('luigi/')).toEqual('luigi');
  });

  it('getNodeList', () => {
    expect(GenericHelpers.getNodeList('body').length).toEqual(1);
    expect(GenericHelpers.getNodeList('luigi-container').length).toEqual(0);
  });

  it('getUrlParameter', () => {
    locationSearchString = '?qp=val&qp2=val2';
    expect(GenericHelpers.getUrlParameter('notThere')).toBeFalsy();
    expect(GenericHelpers.getUrlParameter('qp')).toEqual('val');
    expect(GenericHelpers.getUrlParameter('qp2')).toEqual('val2');
  });
});

describe('replaceVars', () => {
  describe('when parenthesis = true (default)', () => {
    it('should replace variables inside curly braces', () => {
      const result = GenericHelpers.replaceVars('/users/{:id}', { id: 123 }, ':');

      expect(result).toBe('/users/123');
    });

    it('should remove unresolved prefixed variables', () => {
      const result = GenericHelpers.replaceVars('/users/{:id}', {}, ':');

      expect(result).toBe('/users/');
    });

    it('should keep value if param does not exist and no prefix match', () => {
      const result = GenericHelpers.replaceVars('/users/{id}', {}, ':');

      expect(result).toBe('/users/{id}');
    });
  });

  describe('when parenthesis = false', () => {
    it('should replace prefixed params directly in string', () => {
      const result = GenericHelpers.replaceVars('/users/:id', { id: 123 }, ':', false);

      expect(result).toBe('/users/123');
    });

    it('should replace multiple occurrences', () => {
      const result = GenericHelpers.replaceVars('/:id/details/:id', { id: 55 }, ':', false);

      expect(result).toBe('/55/details/55');
    });

    it('should URL encode values', () => {
      const result = GenericHelpers.replaceVars('/search/:query', { query: 'hello world' }, ':', false);

      expect(result).toBe('/search/hello%20world');
    });
  });

  describe('edge cases', () => {
    it('should return original string if params is null', () => {
      const result = GenericHelpers.replaceVars('/users/:id', null as any, ':', false);

      expect(result).toBe('/users/:id');
    });

    it('should return original string if params is undefined', () => {
      const result = GenericHelpers.replaceVars('/users/:id', undefined as any, ':', false);

      expect(result).toBe('/users/:id');
    });
  });
});
