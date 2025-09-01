import { ViewUrlDecorator } from './../../src/services/viewurl-decorator';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('ViewUrlDecorator', () => {
  beforeEach(() => {
    (ViewUrlDecorator as any).decorators = [];
    sinon.stub(GenericHelpers);
    GenericHelpers.prependOrigin.callsFake((url) => url);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('hasDecorators', () => {
    (ViewUrlDecorator as any).decorators = [{}, {}];
    assert.isTrue(ViewUrlDecorator.hasDecorators());
  });

  it('add decorator', () => {
    ViewUrlDecorator.add({
      uid: 'aaa',
      type: 'queryString',
      key: 'viewUrlParam',
      valueFn: () => 'one'
    });
    // duplicates should get filtered
    ViewUrlDecorator.add({
      uid: 'aaa',
      type: 'queryString',
      key: 'viewUrlParam',
      valueFn: () => 'two'
    });

    assert.isTrue(ViewUrlDecorator.hasDecorators());
    assert.equal((ViewUrlDecorator as any).decorators.length, 1);
  });

  it('applyDecorators queryString', () => {
    (ViewUrlDecorator as any).decorators = [
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

    const result = ViewUrlDecorator.applyDecorators('http://luigi-project.io', false);
    assert.equal(result, 'http://luigi-project.io/?viewUrlAAA=one&viewUrlBBB=two');
  });

  it('applyDecorators decoding', () => {
    (ViewUrlDecorator as any).decorators = [
      {
        uid: 'aaa',
        type: 'queryString',
        key: 'viewUrlAAA',
        valueFn: () => 'one'
      }
    ];

    assert.equal(
      ViewUrlDecorator.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', false),
      'http://luigi-project.io/?someURL=http%3A%2F%2Fsome.url%2Ffoo%2Fbar&viewUrlAAA=one'
    );

    assert.equal(
      ViewUrlDecorator.applyDecorators('http://luigi-project.io?someURL=http://some.url/foo/bar', true),
      'http://luigi-project.io/?someURL=http://some.url/foo/bar&viewUrlAAA=one'
    );
  });
});
