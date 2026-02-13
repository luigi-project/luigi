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

  it('addLeadingSlash', () => {
    expect(GenericHelpers.addLeadingSlash('luigi')).toEqual('/luigi');
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

  it('hasHash', () => {
    const path = '#luigi/tets/something';
    const includingHash = GenericHelpers.hasHash(path);

    expect(includingHash).toBeTruthy();
  });

  it('getPathWithoutHash', () => {
    const path = '#/tets';

    expect(GenericHelpers.getPathWithoutHash(path)).toEqual('tets');
  });

  it('removeProperties', () => {
    const input = {
      some: true,
      value: true,
      _internal: true,
      _somefn: () => true,
      internalOne: true,
      internalTwo: true
    };
    const keys = ['_*', 'value', 'internal*'];
    const expected = {
      some: true
    };

    expect(GenericHelpers.removeProperties(input, keys)).toEqual(expected);
  });
});
