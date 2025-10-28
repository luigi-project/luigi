import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';
const chai = require('chai');
const sinon = require('sinon');
import type { SinonStub } from 'sinon';
const assert = chai.assert;

describe('Routing-helpers', () => {
  let luigi: any = {};
  beforeEach(() => {
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      navigation: () => ({ navigate: () => {} }),
      routing: () => ({ getSearchParams: () => ({}) }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: (key: string) => {
        if (key === 'routing.contentViewParamPrefix') {
          return luigi.getConfig().routing.contentViewParamPrefix;
        }
        return null;
      },
      getActiveFeatureToggles: () => []
    };
  });
  afterEach(() => {
    sinon.restore();
  });

  it('addParamsOnHashRouting should add parameters to hash routing', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash);
    assert.include(updatedHash, 'param1=value1');
    assert.include(updatedHash, 'param2=value2');
  });

  it('addParamsOnHashRouting should add parameters to hash routing with prefix', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue&prefix_test=tets';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash, 'prefix_');
    assert.include(updatedHash, 'prefix_param1=value1');
    assert.include(updatedHash, 'prefix_param2=value2');
    assert.include(updatedHash, 'prefix_test=tets');
  });

  it('modifySearchParams should modify search parameters', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    assert.equal(searchParams.get('param1'), 'value1');
    assert.equal(searchParams.get('param2'), 'value2');
    assert.equal(searchParams.get('existingParam'), 'existingValue');
  });
  it('modifySearchParams should delete search parameters', () => {
    const params = { param1: 'value1', param2: 'value2', existingParam: undefined };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    assert.equal(searchParams.get('param1'), 'value1');
    assert.equal(searchParams.get('param2'), 'value2');
    assert.equal(searchParams.get('existingParam'), undefined);
  });

  it('modifySearchParams should modify search parameters with prefex', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams, 'prefix_');
    assert.equal(searchParams.get('prefix_param1'), 'value1');
    assert.equal(searchParams.get('prefix_param2'), 'value2');
    assert.equal(searchParams.get('prefix_existingParam'), undefined);
  });

  it('filterNodeParams should filter and sanitize node parameters', () => {
    const params = {
      '~param1': 'value1',
      '~param2': 'value2',
      otherParam: 'value3'
    };

    const filteredParams = RoutingHelpers.filterNodeParams(params, luigi as any);
    assert.deepEqual(filteredParams, { param1: 'value1', param2: 'value2' });
  });

  it('getContentViewParamPrefix should return the configured content view param prefix', () => {
    luigi.getConfig = () => ({ routing: { contentViewParamPrefix: '~' } });
    const prefix = RoutingHelpers.getContentViewParamPrefix(luigi);
    assert.equal(prefix, '~');
  });

  it('sanitizeParamsMap should sanitize parameter keys and values', () => {
    const paramsMap = {
      param1: 'value1',
      param2: '<script>alert("xss")</script>'
    };
    const sanitizedMap = RoutingHelpers.sanitizeParamsMap(paramsMap);
    assert.equal(sanitizedMap['param1'], 'value1');
    assert.equal(sanitizedMap['param2'], '&lt;script&gt;alert(&quot;xss&quot;)&lt;&sol;script&gt;');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path?param1=value1&param2=value2';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    assert.equal(currentPath.path, 'some/path');
    assert.equal(currentPath.query, 'param1=value1&param2=value2');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    assert.equal(currentPath.path, 'some/path');
    assert.equal(currentPath.query, undefined);
  });

  it('prepareSearchParamsForClient should filter search params based on client permissions', () => {
    sinon.stub(luigi, 'routing').returns({
      getSearchParams: () => ({ param1: 'value1', param2: 'value2' })
    });
    const currentNode = {
      children: [],
      clientPermissions: {
        urlParameters: {
          param1: { read: true },
          param2: { read: false }
        }
      }
    };
    const filteredParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
    assert.deepEqual(filteredParams, { param1: 'value1' });
  });

  it('prepareSearchParamsForClient should return an empty object if no client permissions are defined', () => {
    sinon.stub(luigi, 'routing').returns({
      getSearchParams: () => ({ param1: 'value1', param2: 'value2' })
    });
    const currentNode = {
      children: []
    };
    const filteredParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
    assert.deepEqual(filteredParams, {});
  });

  it('getHashQueryParamSeparator', () => {
    assert.equal(RoutingHelpers.getHashQueryParamSeparator(), '?');
  });

  describe('getURLWithoutModalData', () => {
    const modalParamName = 'mymodal';
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        '~test=tets&foo=bar&mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      assert.equal(urlWithoutModalData, '%7Etest=tets&foo=bar');
    });
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        'mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      assert.equal(urlWithoutModalData, '');
    });
  });

  describe('getModalViewParamName', () => {
    beforeEach(() => {
      sinon.stub(luigi, 'getConfigValue');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('without config value', () => {
      assert.equal(RoutingHelpers.getModalViewParamName(luigi), 'modal');
    });
    it('without config value', () => {
      luigi.getConfigValue.returns('custom');
      assert.equal(RoutingHelpers.getModalViewParamName(luigi), 'custom');
    });
  });

  describe('getModalPathFromPath & getModalParamsFromPath', () => {
    let mockLocation: any = { href: 'http://localhost', search: '' };
    let modalViewParamName = 'modal';
    let getModalViewParamNameStub: any;
    let getLocationStub: any;
    beforeEach(() => {
      getModalViewParamNameStub = sinon.stub(RoutingHelpers, 'getModalViewParamName').returns(modalViewParamName);
      getLocationStub = sinon.stub(RoutingHelpers, 'getLocation').returns(mockLocation);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('without modal param', () => {
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), null);
    });
    it('with modal', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
    });
    it('with modal params', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2&modalParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
      assert.deepEqual(RoutingHelpers.getModalParamsFromPath(luigi), { title: 'Real Child' });
    });
    it('with custom modal param name', () => {
      getModalViewParamNameStub.returns('custom');
      mockLocation.search = '?custom=%2Fhome%2Fchild-2&customParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      assert.equal(RoutingHelpers.getModalPathFromPath(luigi), '/home/child-2');
      assert.deepEqual(RoutingHelpers.getModalParamsFromPath(luigi), { title: 'Real Child' });
    });
  });

  describe('parseParams', () => {
    let mockParams;

    it('return pairs of params', () => {
      mockParams = 'test=true&foo=bar';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {
        test: 'true',
        foo: 'bar'
      });
    });

    it('should not fail on empty params', () => {
      mockParams = '';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {});
    });

    it('return pairs of params with a space and a plus', () => {
      mockParams = 'test=true+abc&foo=bar%2Babc';
      assert.deepEqual(RoutingHelpers.parseParams(mockParams), {
        test: 'true abc',
        foo: 'bar+abc'
      });
    });
  });

  describe('getLocationSearchQueryParams', () => {
    let getLocationStub: SinonStub | undefined;
    afterEach(() => {
      if (getLocationStub) {
        getLocationStub.restore();
        getLocationStub = undefined;
      }
    });

    function stubLocationSearch(searchValue: string): void {
      if (getLocationStub) getLocationStub.restore();
      getLocationStub = sinon.stub(RoutingHelpers, 'getLocation').returns({ search: searchValue } as any);
    }

    it('returns empty object when no search part', () => {
      stubLocationSearch('');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), {});
    });

    it('returns empty object when only "?" present', () => {
      stubLocationSearch('?');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), {});
    });

    it('parses single parameter', () => {
      stubLocationSearch('?foo=bar');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { foo: 'bar' });
    });

    it('parses multiple parameters', () => {
      stubLocationSearch('?foo=bar&baz=qux');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { foo: 'bar', baz: 'qux' });
    });

    it('decodes encoded characters', () => {
      stubLocationSearch('?a=1%202&b=sp%2Bce');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { a: '1 2', b: 'sp+ce' });
    });

    it('converts plus sign to space', () => {
      stubLocationSearch('?q=hello+world+test');
      assert.deepEqual(RoutingHelpers.getLocationSearchQueryParams(), { q: 'hello world test' });
    });
  });

  // describe('computePathAndUrlWithoutModalData', () => {
  //   const modalParam = 'modal';

  //   it('hash routing: only modal param removed leaves plain path', () => {
  //     const url = new URL('https://example.com/#/home?modal=%2Fsettings%2Fdetail');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       true,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '#/home');
  //     assert.equal(urlWithoutModalData, '');
  //   });

  //   it('hash routing: modal + other params keeps others', () => {
  //     const url = new URL('https://example.com/#/home?foo=bar&modal=%2Fx%2Fy');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       true,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '#/home?foo=bar');
  //     assert.equal(urlWithoutModalData, 'foo=bar');
  //   });

  //   it('hash routing: order of remaining params preserved', () => {
  //     const url = new URL('https://example.com/#/home?b=2&modal=%2Fz&a=1');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       true,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '#/home?b=2&a=1');
  //     assert.equal(urlWithoutModalData, 'b=2&a=1');
  //   });

  //   it('hash routing: modalParams also removed', () => {
  //     const url = new URL('https://example.com/#/home?modal=%2Fz&modalParams=%7B%22title%22%3A%22Test%22%7D&keep=1');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       true,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '#/home?keep=1');
  //     assert.equal(urlWithoutModalData, 'keep=1');
  //   });

  //   it('hash routing: only modalParams (no modal) removed', () => {
  //     const url = new URL('https://example.com/#/home?modalParams=%7B%7D');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       true,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '#/home');
  //     assert.equal(urlWithoutModalData, '');
  //   });

  //   it('path routing: only modal removed', () => {
  //     const url = new URL('https://example.com/app/page?modal=%2Fchild');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       false,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '/app/page');
  //     assert.equal(urlWithoutModalData, '');
  //   });

  //   it('path routing: modal + others keeps others', () => {
  //     const url = new URL('https://example.com/app/page?foo=bar&modal=%2Fchild&bar=baz');
  //     const { pathWithoutModalData, urlWithoutModalData } = RoutingHelpers.computePathAndUrlWithoutModalData(
  //       url,
  //       false,
  //       modalParam
  //     );
  //     assert.equal(pathWithoutModalData, '/app/page?foo=bar&bar=baz');
  //     assert.equal(urlWithoutModalData, 'foo=bar&bar=baz');
  //   });

  //   it('path routing: modal + modalParams + other', () => {
  //     const url = new URL('https://example.com/app/page?modal=%2Fchild&modalParams=%7B%22t%22%3A1%7D&x=y');
  //     const res = RoutingHelpers.computePathAndUrlWithoutModalData(url, false, modalParam);
  //     assert.equal(res.pathWithoutModalData, '/app/page?x=y');
  //     assert.equal(res.urlWithoutModalData, 'x=y');
  //   });

  //   it('path routing: only modalParams removed', () => {
  //     const url = new URL('https://example.com/app/page?modalParams=%7B%7D');
  //     const res = RoutingHelpers.computePathAndUrlWithoutModalData(url, false, modalParam);
  //     assert.equal(res.pathWithoutModalData, '/app/page');
  //     assert.equal(res.urlWithoutModalData, '');
  //   });

  //   it('custom modal param name', () => {
  //     const url = new URL('https://example.com/app/page?dialog=%2Finfo&dialogParams=%7B%7D&keep=1');
  //     const res = RoutingHelpers.computePathAndUrlWithoutModalData(url, false, 'dialog');
  //     assert.equal(res.pathWithoutModalData, '/app/page?keep=1');
  //     assert.equal(res.urlWithoutModalData, 'keep=1');
  //   });

  //   it('no query at all returns unchanged path', () => {
  //     const url = new URL('https://example.com/app/page');
  //     const res = RoutingHelpers.computePathAndUrlWithoutModalData(url, false, modalParam);
  //     assert.equal(res.pathWithoutModalData, '/app/page');
  //     assert.equal(res.urlWithoutModalData, '');
  //   });

  //   it('hash routing: no query returns unchanged hash path', () => {
  //     const url = new URL('https://example.com/#/start');
  //     const res = RoutingHelpers.computePathAndUrlWithoutModalData(url, true, modalParam);
  //     assert.equal(res.pathWithoutModalData, '#/start');
  //     assert.equal(res.urlWithoutModalData, '');
  //   });
  // });

  // describe('removeModalDataFromHash', () => {
  //   const modalParam = 'modal';

  //   it('remove modal params (empty query)', () => {
  //     const url = new URL('https://example.com/#/home?modal=%2Fchild');
  //     RoutingHelpers.removeModalDataFromHash(url, { modal: '/child' }, modalParam);
  //     assert.equal(url.hash, '#/home');
  //   });

  //   it('remove modal param and keep rest', () => {
  //     const url = new URL('https://example.com/#/home?modal=%2Fchild&keep=1');
  //     RoutingHelpers.removeModalDataFromHash(url, { modal: '/child', keep: '1' } as any, modalParam);
  //     assert.equal(url.hash, '#/home?keep=1');
  //   });

  //   it('remove modal param and keep rest 2', () => {
  //     const url = new URL('https://example.com/#/home?keep=1&modal=%2Fchild');
  //     RoutingHelpers.removeModalDataFromHash(url, { keep: '1', modal: '/child' } as any, modalParam);
  //     assert.equal(url.hash, '#/home?keep=1');
  //   });

  //   it('remove first modal than modalParms', () => {
  //     const modalParams = JSON.stringify({ t: 1 });
  //     const encodedParams = encodeURIComponent(modalParams);
  //     const url = new URL(`https://example.com/#/home?modal=%2Fchild&modalParams=${encodedParams}&x=1`);
  //     RoutingHelpers.removeModalDataFromHash(
  //       url,
  //       { modal: '/child', modalParams: modalParams, x: '1' } as any,
  //       modalParam
  //     );
  //     assert.equal(url.hash, '#/home?x=1');
  //   });
  // });

  // describe('removeModalDataFromSearch', () => {
  //   const modalParam = 'modal';

  //   function build(urlStr: string): URL {
  //     return new URL(urlStr);
  //   }

  //   it('remove modal param', () => {
  //     const url = build('https://example.com/app/page?modal=%2Fchild');
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '');
  //   });

  //   it('remove modal and keep rest', () => {
  //     const url = build('https://example.com/app/page?modal=%2Fchild&keep=1');
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '?keep=1');
  //   });

  //   it('remove modal and keep rest 2', () => {
  //     const url = build('https://example.com/app/page?a=1&modal=%2Fchild&b=2');
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '?a=1&b=2');
  //   });

  //   it('remove modal and modalParams', () => {
  //     const params = encodeURIComponent(JSON.stringify({ t: 1 }));
  //     const url = build(`https://example.com/app/page?modal=%2Fchild&modalParams=${params}&x=1`);
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '?x=1');
  //   });

  //   it('remove modalParams if no modal', () => {
  //     const params = encodeURIComponent(JSON.stringify({ t: 1 }));
  //     const url = build(`https://example.com/app/page?modalParams=${params}&x=1`);
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '?x=1');
  //   });

  //   it('dont change url when no modal param', () => {
  //     const url = build('https://example.com/app/page?a=1&b=2');
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '?a=1&b=2');
  //   });

  //   it('empty when no modal params', () => {
  //     const params = encodeURIComponent(JSON.stringify({}));
  //     const url = build(`https://example.com/app/page?modalParams=${params}`);
  //     RoutingHelpers.removeModalDataFromSearch(url, modalParam);
  //     assert.equal(url.search, '');
  //   });
  // });
});
