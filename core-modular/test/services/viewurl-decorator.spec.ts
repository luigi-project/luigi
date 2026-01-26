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
    expect(viewUrlDecoratorService.hasDecorators()).toBe(false);
    viewUrlDecoratorService.add({
      uid: 'testDecorator',
      type: 'queryString',
      key: 'testKey',
      valueFn: () => 'testValue'
    });
    expect(viewUrlDecoratorService.hasDecorators()).toBe(true);
    expect(viewUrlDecoratorService.decorators.length).toEqual(1);
    viewUrlDecoratorService.add({
      uid: 'testDecorator',
      type: 'queryString',
      key: 'testKey2',
      valueFn: () => 'testValue2'
    });
    expect(viewUrlDecoratorService.decorators.length).toEqual(1);
    viewUrlDecoratorService.add({
      uid: 'anotherDecorator',
      type: 'queryString',
      key: 'anotherKey',
      valueFn: () => 'anotherValue'
    });
    expect(viewUrlDecoratorService.decorators.length).toEqual(2);
  });

  it('should apply decorators to URL correctly', () => {
    const url = 'http://luigi-project.io/path?existingKey=existingValue';
    viewUrlDecoratorService.add({ uid: 'decorator1', type: 'queryString', key: 'newKey1', valueFn: () => 'newValue1' });
    viewUrlDecoratorService.add({ uid: 'decorator2', type: 'queryString', key: 'newKey2', valueFn: () => 'newValue2' });
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    const urlObj = new URL(decoratedUrl);
    expect(urlObj.searchParams.get('existingKey')).toEqual('existingValue');
    expect(urlObj.searchParams.get('newKey1')).toEqual('newValue1');
    expect(urlObj.searchParams.get('newKey2')).toEqual('newValue2');
  });

  it('should handle URL without existing query parameters', () => {
    const url = 'http://luigi-project.io/path';
    viewUrlDecoratorService.add({ uid: 'decorator1', type: 'queryString', key: 'newKey1', valueFn: () => 'newValue1' });
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    const urlObj = new URL(decoratedUrl);
    expect(urlObj.searchParams.get('newKey1')).toEqual('newValue1');
  });

  it('should return original URL if null or undefined', () => {
    expect(viewUrlDecoratorService.applyDecorators(undefined as any, false)).not.toBeDefined();
    expect(viewUrlDecoratorService.applyDecorators(null as any, false)).toBeNull();
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
    expect(result).toEqual('http://luigi-project.io/?viewUrlAAA=one&viewUrlBBB=two');
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

    expect(
      viewUrlDecoratorService.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', false)
    ).toEqual(
      'http://luigi-project.io/?someURL=http%3A%2F%2Fsome.url%2Ffoo%2Fbar&viewUrlAAA=one'
    );

    expect(
      viewUrlDecoratorService.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', true)
    ).toEqual('http://luigi-project.io/?someURL=http://some.url/foo/bar&viewUrlAAA=one');
  });

  it('should not decode URL if decode flag is false', () => {
    const url = 'http://luigi-project.io/path?encodedKey=encoded%20Value';
    const decoratedUrl = viewUrlDecoratorService.applyDecorators(url, false);
    expect(decoratedUrl).toContain('encodedKey=encoded%20Value');
  });
});
