import { assert } from 'chai';
import { ViewUrlDecoratorSvc } from '../../src/services/viewurl-decorator';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
import { Luigi } from '../../src/core-api/luigi';
const sinon = require('sinon');

describe('View Decorator Service', () => {
  let viewUrlDecoratorService: ViewUrlDecoratorSvc;
  beforeEach(() => {
    viewUrlDecoratorService = new ViewUrlDecoratorSvc();
    viewUrlDecoratorService.decorators = [];
    const prependOriginStub = sinon.stub(GenericHelpers, 'prependOrigin');
    prependOriginStub.callsFake((url: string) => url);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should add and check decorators correctly', () => {
    assert.isFalse(viewUrlDecoratorService.hasDecorators());
    viewUrlDecoratorService.add({
      uid: 'testDecorator',
      type: 'queryString',
      key: 'testKey',
      valueFn: () => 'testValue'
    });
    assert.isTrue(viewUrlDecoratorService.hasDecorators());
    assert.equal(viewUrlDecoratorService.decorators.length, 1);
    viewUrlDecoratorService.add({
      uid: 'testDecorator',
      type: 'queryString',
      key: 'testKey2',
      valueFn: () => 'testValue2'
    });
    assert.equal(viewUrlDecoratorService.decorators.length, 1, 'should replace decorator with same uid');
    viewUrlDecoratorService.add({
      uid: 'anotherDecorator',
      type: 'queryString',
      key: 'anotherKey',
      valueFn: () => 'anotherValue'
    });
    assert.equal(viewUrlDecoratorService.decorators.length, 2);
  });

  it('should apply decorators to URL correctly', () => {
    const url = 'http://luigi-project.io/path?existingKey=existingValue';
    viewUrlDecoratorService.add({ uid: 'decorator1', type: 'queryString', key: 'newKey1', valueFn: () => 'newValue1' });
    viewUrlDecoratorService.add({ uid: 'decorator2', type: 'queryString', key: 'newKey2', valueFn: () => 'newValue2' });
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    const urlObj = new URL(decoratedUrl);
    assert.equal(urlObj.searchParams.get('existingKey'), 'existingValue');
    assert.equal(urlObj.searchParams.get('newKey1'), 'newValue1');
    assert.equal(urlObj.searchParams.get('newKey2'), 'newValue2');
  });

  it('should handle URL without existing query parameters', () => {
    const url = 'http://luigi-project.io/path';
    viewUrlDecoratorService.add({ uid: 'decorator1', type: 'queryString', key: 'newKey1', valueFn: () => 'newValue1' });
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    const urlObj = new URL(decoratedUrl);
    assert.equal(urlObj.searchParams.get('newKey1'), 'newValue1');
  });

  it('should return original URL if null or undefined', () => {
    assert.isUndefined(viewUrlDecoratorService.applyDecorators(undefined as any, false));
    assert.isNull(viewUrlDecoratorService.applyDecorators(null as any, false));
  });

  it('applyDecorators queryString', () => {
    viewUrlDecoratorService.decorators = [
      {
        uid: 'aaa',
        type: 'queryString',
        key: 'viewUrlAAA',
        valueFn: () => 'one'
      },
      {
        uid: 'bbb',
        type: 'queryString',
        key: 'viewUrlBBB',
        valueFn: () => 'two'
      },
      { uid: 'ccc', type: 'anotherInvalid', key: 'something' }
    ];

    const result = viewUrlDecoratorService.applyDecorators('http://luigi-project.io', false);
    assert.equal(result, 'http://luigi-project.io/?viewUrlAAA=one&viewUrlBBB=two');
  });

  it('applyDecorators decoding', () => {
    viewUrlDecoratorService.decorators = [
      {
        uid: 'aaa',
        type: 'queryString',
        key: 'viewUrlAAA',
        valueFn: () => 'one'
      }
    ];

    assert.equal(
      viewUrlDecoratorService.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', false),
      'http://luigi-project.io/?someURL=http%3A%2F%2Fsome.url%2Ffoo%2Fbar&viewUrlAAA=one'
    );

    assert.equal(
      viewUrlDecoratorService.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', true),
      'http://luigi-project.io/?someURL=http://some.url/foo/bar&viewUrlAAA=one'
    );
  });

  it('should not decode URL if decode flag is false', () => {
    const url = 'http://luigi-project.io/path?encodedKey=encoded%20Value';
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    assert.include(decoratedUrl, 'encodedKey=encoded%20Value');
  });
});
