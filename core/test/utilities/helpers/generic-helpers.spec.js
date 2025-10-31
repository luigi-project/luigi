import { LuigiConfig, LuigiElements } from '../../../src/core-api';
import { GenericHelpers } from '../../../src/utilities/helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Generic-helpers', () => {
  let windowLocationImplementation;

  beforeAll(() => {
    windowLocationImplementation = window.location;
    delete window.location;
    window.location = {
      search: function () {
        return '';
      }
    };
  });

  afterAll(() => {
    window.location = windowLocationImplementation;
  });

  it('getUrlParameter', () => {
    const setLocationSearch = (url) => {
      sinon.stub(window.location, 'search').get(() => url);
    };
    const catName = 'spencer';

    setLocationSearch('?param=1&foo=bar&cat=' + catName);
    assert.equal(GenericHelpers.getUrlParameter('cat'), catName, 'url with ? and multiple params');

    setLocationSearch('#foo=bar&cat=' + catName + '&param=1');
    assert.equal(GenericHelpers.getUrlParameter('cat'), catName, 'url with # and multiple params');
  });

  it('getUrlWithoutHash', () => {
    const url = 'http://luigi.url.de/#hashsomething';
    const withoutHash = GenericHelpers.getUrlWithoutHash(url);
    assert.equal(withoutHash, 'http://luigi.url.de/');
  });

  it('hasHash', () => {
    const path = '#luigi/tets/something';
    const includingHash = GenericHelpers.hasHash(path);
    assert.isTrue(includingHash);
  });

  it('getPathWithoutHash', () => {
    const path = '#/tets';
    assert.equal(GenericHelpers.getPathWithoutHash(path), 'tets');
  });

  it('addLeadingSlash', () => {
    assert.equal(GenericHelpers.addLeadingSlash('luigi'), '/luigi');
  });

  it('trimLeadingSlash', () => {
    assert.equal(GenericHelpers.trimLeadingSlash('/luigi'), 'luigi');
  });

  it('isString', () => {
    assert.equal(GenericHelpers.isString('foo'), true);
    assert.equal(GenericHelpers.isString(true), false);
    assert.equal(GenericHelpers.isString(12345), false);
  });

  it('isFunction', () => {
    const func = () => {};
    assert.equal(GenericHelpers.isFunction(func), true);
    assert.equal(GenericHelpers.isFunction('foo'), false);
    assert.equal(GenericHelpers.isFunction(true), false);
    assert.equal(GenericHelpers.isFunction(12345), false);
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

  it('isEmptyObject', () => {
    const obj = { foo: 'bar' };
    const obj2 = {};
    const obj3 = undefined;
    assert.equal(GenericHelpers.isEmptyObject(obj), false);
    assert.equal(GenericHelpers.isEmptyObject(obj2), true);
    assert.equal(GenericHelpers.isEmptyObject(obj3), false);
  });

  it('removeInternalProperties', () => {
    const input = {
      some: true,
      value: true,
      _internal: true,
      _somefn: () => true
    };
    const expected = {
      some: true,
      value: true
    };
    assert.deepEqual(GenericHelpers.removeInternalProperties(input), expected);
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
    assert.deepEqual(GenericHelpers.removeProperties(input, keys), expected);
  });

  it('replaceVars', () => {
    const context = {
      a: 'a_val',
      b: {
        c: 'c_val'
      }
    };
    assert.equal(
      GenericHelpers.replaceVars('index.html#/{context.a}', context, 'context.'),
      'index.html#/a_val',
      'first level context vars being interpolated'
    );
    assert.equal(
      GenericHelpers.replaceVars('index.html#/{context.b.c}', context, 'context.'),
      'index.html#/c_val',
      'nested context vars being interpolated'
    );
    assert.equal(
      GenericHelpers.replaceVars('index.html#/:a/{context.b.c}', context, ':', false),
      'index.html#/a_val/{context.b.c}',
      'colon prefix, no paranthesis'
    );
  });

  describe('semverCompare', () => {
    it('standard versions', () => {
      const input = ['1.1.1', '0.6.4', '0.7.7', '0.7.1', '1.0.0'];
      const expected = ['0.6.4', '0.7.1', '0.7.7', '1.0.0', '1.1.1'];
      assert.deepEqual(input.sort(GenericHelpers.semverCompare), expected);
    });

    it('with beta and next', () => {
      const input = ['1.1.1-dev.0000', '0.6.4', '0.7.7-beta.0', '0.7.1', '1.0.0'];
      const expected = ['0.6.4', '0.7.1', '0.7.7-beta.0', '1.0.0', '1.1.1-dev.0000'];
      assert.deepEqual(input.sort(GenericHelpers.semverCompare), expected);
    });

    it('single comparison', () => {
      assert.equal(GenericHelpers.semverCompare('0.7.4', '1.1.1'), -1);
      assert.equal(GenericHelpers.semverCompare('1.1.1', '0.7.4'), 1);
    });
  });

  describe('request experimental feature', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfig');
      console.warn = sinon.spy();
      LuigiConfig.getConfig.returns({
        settings: {
          experimental: {
            test: true
          }
        }
      });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('experimental feature is configured', () => {
      assert.equal(GenericHelpers.requestExperimentalFeature('test', true), true);
    });
    it('experimental feature NOT configured and show console warn', () => {
      assert.equal(GenericHelpers.requestExperimentalFeature('tets', true), false);
      sinon.assert.calledOnce(console.warn);
    });
    it('experimental feature NOT configured and no console warn', () => {
      assert.equal(GenericHelpers.requestExperimentalFeature('tets', false), false);
      sinon.assert.neverCalledWith(console.warn);
    });
  });

  describe('get shellbar height', () => {
    beforeEach(() => {
      sinon.stub(LuigiElements, 'getShellbar');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('shellbar is present', () => {
      const shellbarHeight = 30;
      LuigiElements.getShellbar.returns({
        clientHeight: shellbarHeight
      });
      assert.equal(GenericHelpers.getShellbarHeight(), shellbarHeight);
    });

    it('shellbar is not present', () => {
      LuigiElements.getShellbar.returns(undefined);
      assert.equal(GenericHelpers.getShellbarHeight(), 0);
    });

    it('shellbar is present, no clientHeight', () => {
      LuigiElements.getShellbar.returns({});
      assert.equal(GenericHelpers.getShellbarHeight(), 0);
    });
  });

  describe('calcMFELocation', () => {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    });

    it.each([null, undefined, ''])('should check if element is present', (el) => {
      assert.equal(GenericHelpers.calcMFELocation(el), undefined);
    });

    it.each(['main', undefined])('should check if element has special attribute', (context) => {
      const el = document.createElement('div');

      if (!context) {
        el.setAttribute('lui_web_component', true);
      }

      assert.equal(GenericHelpers.calcMFELocation(el), context);
    });

    it.each([
      { main: '.main' },
      { drawer: '.drawer' },
      { modal: '.iframeModalCtn' },
      { splitView: '.iframeSplitViewCnt' }
    ])('should check if element has specific wrapper', (obj) => {
      const el = document.createElement('div');
      const key = Object.keys(obj)[0];

      sb.stub(Element.prototype, 'closest').callsFake((selector) => {
        if (selector === obj[key] && selector !== '.main') {
          return document.createElement('div');
        }

        return null;
      });

      assert.equal(GenericHelpers.calcMFELocation(el), key);
    });
  });
});
