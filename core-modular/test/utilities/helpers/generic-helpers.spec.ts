import { GenericHelpers } from '../../../src/utilities/helpers/generic-helpers';

const chai = require('chai');
const assert = chai.assert;

describe('Generic-helpers', () => {
  let windowLocationImplementation: any;

  beforeAll(() => {
    windowLocationImplementation = window.location;
    delete window.location;
    window.location = {
      search: function() {
        return '';
      }
    } as any;
  });

  afterAll(() => {
    window.location = windowLocationImplementation;
  });

  it('getRandomId', () => {
    assert.typeOf(GenericHelpers.getRandomId(), 'number');
  });

  it('isFunction', () => {
    const func = () => {};
    assert.equal(GenericHelpers.isFunction(func), true);
    assert.equal(GenericHelpers.isFunction('foo'), false);
    assert.equal(GenericHelpers.isFunction(true), false);
    assert.equal(GenericHelpers.isFunction(12345), false);
  });

  it('isString', () => {
    assert.equal(GenericHelpers.isString('foo'), true);
    assert.equal(GenericHelpers.isString(true), false);
    assert.equal(GenericHelpers.isString(12345), false);
  });

  it('isObject', () => {
    const obj = { foo: 'bar' };
    const func = () => {};
    assert.equal(GenericHelpers.isObject(obj), true);
    assert.equal(GenericHelpers.isObject(func), false);
    assert.equal(GenericHelpers.isObject('foo'), false);
    assert.equal(GenericHelpers.isObject(true), false);
    assert.equal(GenericHelpers.isObject(12345), false);
  });

  it('trimLeadingSlash', () => {
    assert.equal(GenericHelpers.trimLeadingSlash('/luigi'), 'luigi');
  });

  it('trimTrailingSlash', () => {
    assert.equal(GenericHelpers.trimTrailingSlash('luigi/'), 'luigi');
  });

  it('getNodeList', () => {
    assert.equal(GenericHelpers.getNodeList('body').length, 1);
    assert.equal(GenericHelpers.getNodeList('luigi-container').length, 0);
  });
});
