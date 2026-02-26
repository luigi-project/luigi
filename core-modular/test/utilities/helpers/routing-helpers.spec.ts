import { FeatureToggles } from '../../../src/core-api/feature-toggles';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';

describe('Routing-helpers', () => {
  let featureToggles: FeatureToggles;
  let luigi: any = {};

  beforeEach(() => {
    featureToggles = new FeatureToggles();
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
    jest.restoreAllMocks();
  });

  it('addParamsOnHashRouting should add parameters to hash routing', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash);
    expect(updatedHash).toContain('param1=value1');
    expect(updatedHash).toContain('param2=value2');
  });

  it('addParamsOnHashRouting should add parameters to hash routing with prefix', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const hash = '#/some/path?existingParam=existingValue&prefix_test=tets';
    const updatedHash = RoutingHelpers.addParamsOnHashRouting(params, hash, 'prefix_');
    expect(updatedHash).toContain('prefix_param1=value1');
    expect(updatedHash).toContain('prefix_param2=value2');
    expect(updatedHash).toContain('prefix_test=tets');
  });

  it('modifySearchParams should modify search parameters', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    expect(searchParams.get('param1')).toEqual('value1');
    expect(searchParams.get('param2')).toEqual('value2');
    expect(searchParams.get('existingParam')).toEqual('existingValue');
  });
  it('modifySearchParams should delete search parameters', () => {
    const params = { param1: 'value1', param2: 'value2', existingParam: undefined };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams);
    expect(searchParams.get('param1')).toEqual('value1');
    expect(searchParams.get('param2')).toEqual('value2');
    expect(searchParams.get('existingParam')).toEqual(null);
  });

  it('modifySearchParams should modify search parameters with prefex', () => {
    const params = { param1: 'value1', param2: 'value2' };
    const searchParams = new URLSearchParams('existingParam=existingValue');
    RoutingHelpers.modifySearchParams(params, searchParams, 'prefix_');
    expect(searchParams.get('prefix_param1')).toEqual('value1');
    expect(searchParams.get('prefix_param2')).toEqual('value2');
    expect(searchParams.get('prefix_existingParam')).toEqual(null);
  });

  it('filterNodeParams should filter and sanitize node parameters', () => {
    const params = {
      '~param1': 'value1',
      '~param2': 'value2',
      otherParam: 'value3'
    };

    const filteredParams = RoutingHelpers.filterNodeParams(params, luigi as any);
    expect(filteredParams).toEqual({ param1: 'value1', param2: 'value2' });
  });

  it('getContentViewParamPrefix should return the configured content view param prefix', () => {
    luigi.getConfig = () => ({ routing: { contentViewParamPrefix: '~' } });
    const prefix = RoutingHelpers.getContentViewParamPrefix(luigi);
    expect(prefix).toEqual('~');
  });

  it('sanitizeParamsMap should sanitize parameter keys and values', () => {
    const paramsMap = {
      param1: 'value1',
      param2: '<script>alert("xss")</script>'
    };
    const sanitizedMap = RoutingHelpers.sanitizeParamsMap(paramsMap);
    expect(sanitizedMap['param1']).toEqual('value1');
    expect(sanitizedMap['param2']).toEqual('&lt;script&gt;alert(&quot;xss&quot;)&lt;&sol;script&gt;');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path?param1=value1&param2=value2';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    expect(currentPath.path).toEqual('some/path');
    expect(currentPath.query).toEqual('param1=value1&param2=value2');
  });

  it('getCurrentPath should return the current path and query', () => {
    const pathRaw = '#/some/path';
    location.hash = pathRaw; // Simulate the hash in the URL
    const currentPath = RoutingHelpers.getCurrentPath(true);
    expect(currentPath.path).toEqual('some/path');
    expect(currentPath.query).toEqual(undefined);
  });

  it('prepareSearchParamsForClient should filter search params based on client permissions', () => {
    jest
      .spyOn(luigi, 'routing')
      .mockClear()
      .mockReturnValue({
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
    expect(filteredParams).toEqual({ param1: 'value1' });
  });

  it('prepareSearchParamsForClient should return an empty object if no client permissions are defined', () => {
    jest
      .spyOn(luigi, 'routing')
      .mockClear()
      .mockReturnValue({
        getSearchParams: () => ({ param1: 'value1', param2: 'value2' })
      });
    const currentNode = {
      children: []
    };
    const filteredParams = RoutingHelpers.prepareSearchParamsForClient(currentNode, luigi);
    expect(filteredParams).toEqual({});
  });

  describe('check valid wc url', function () {
    it('check permission for relative and absolute urls from same domain', () => {
      expect(RoutingHelpers.checkWCUrl('/folder/sth.js', luigi)).toEqual(true);
      expect(RoutingHelpers.checkWCUrl('folder/sth.js', luigi)).toEqual(true);
      expect(RoutingHelpers.checkWCUrl('./folder/sth.js', luigi)).toEqual(true);
      expect(RoutingHelpers.checkWCUrl(window.location.href + '/folder/sth.js', luigi)).toEqual(true);
    });

    it('check permission and denial for urls based on config', () => {
      jest
        .spyOn(luigi, 'getConfigValue')
        .mockClear()
        .mockReturnValue(['https://fiddle.luigi-project.io/.?', 'https://docs.luigi-project.io/.?']);

      expect(RoutingHelpers.checkWCUrl('https://fiddle.luigi-project.io/folder/sth.js', luigi)).toEqual(true);
      expect(RoutingHelpers.checkWCUrl('https://docs.luigi-project.io/folder/sth.js', luigi)).toEqual(true);
      expect(RoutingHelpers.checkWCUrl('http://fiddle.luigi-project.io/folder/sth.js', luigi)).toEqual(false);
      expect(RoutingHelpers.checkWCUrl('https://slack.luigi-project.io/folder/sth.js', luigi)).toEqual(false);
    });
  });

  describe('set feature toggle from url', () => {
    let mockPath = '/projects/pr1/settings?ft=test';
    let featureTogglesSpy: any;

    beforeEach(() => {
      featureTogglesSpy = jest.spyOn(featureToggles, 'setFeatureToggle');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('setFeatureToggle will be called', () => {
      RoutingHelpers.setFeatureToggles('ft', mockPath, featureToggles);
      expect(featureTogglesSpy).toHaveBeenCalledWith('test', true);
    });

    it('setFeatureToggle will be called with two featureToggles', () => {
      mockPath = '/projects/pr1/settings?ft=test,test2';
      RoutingHelpers.setFeatureToggles('ft', mockPath, featureToggles);
      expect(featureTogglesSpy).toHaveBeenCalledWith('test', true);
      expect(featureTogglesSpy).toHaveBeenCalledWith('test2', true);
    });

    it("setFeatureToggle won't be called with wrong queryParam name", () => {
      RoutingHelpers.setFeatureToggles('fft', mockPath, featureToggles);
      expect(featureTogglesSpy).not.toHaveBeenCalled();
    });
  });

  it('getHashQueryParamSeparator', () => {
    expect(RoutingHelpers.getHashQueryParamSeparator()).toEqual('?');
  });

  describe('getURLWithoutModalData', () => {
    const modalParamName = 'mymodal';
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        '~test=tets&foo=bar&mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      expect(urlWithoutModalData).toEqual('%7Etest=tets&foo=bar');
    });
    it('getURLWithoutModalData with additional search params', () => {
      let searchParamsString =
        'mymodal=%2Fsettings%2FhistoryMf&mymodalParams=%7B%22size%22%3A%22m%22%2C%22title%22%3A%22furz%22%7D';
      let urlWithoutModalData = RoutingHelpers.getURLWithoutModalData(searchParamsString, modalParamName);
      expect(urlWithoutModalData).toEqual('');
    });
  });

  describe('getModalViewParamName', () => {
    beforeEach(() => {
      jest.spyOn(luigi, 'getConfigValue');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('without config value', () => {
      expect(RoutingHelpers.getModalViewParamName(luigi)).toEqual('modal');
    });
    it('without config value', () => {
      luigi.getConfigValue.mockReturnValue('custom');
      expect(RoutingHelpers.getModalViewParamName(luigi)).toEqual('custom');
    });
  });

  describe('getModalPathFromPath & getModalParamsFromPath', () => {
    let mockLocation: any = { href: 'http://localhost', search: '' };
    let modalViewParamName = 'modal';
    let getModalViewParamNameStub: any;
    let getLocationStub: any;

    beforeEach(() => {
      getModalViewParamNameStub = jest
        .spyOn(RoutingHelpers, 'getModalViewParamName')
        .mockReturnValue(modalViewParamName);
      getLocationStub = jest.spyOn(RoutingHelpers, 'getLocation').mockReturnValue(mockLocation);
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('without modal param', () => {
      expect(RoutingHelpers.getModalPathFromPath(luigi)).toEqual(undefined);
    });

    it('with modal', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2';
      expect(RoutingHelpers.getModalPathFromPath(luigi)).toEqual('/home/child-2');
    });

    it('with modal params', () => {
      mockLocation.search = '?modal=%2Fhome%2Fchild-2&modalParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      expect(RoutingHelpers.getModalPathFromPath(luigi)).toEqual('/home/child-2');
      expect(RoutingHelpers.getModalParamsFromPath(luigi)).toEqual({ title: 'Real Child' });
    });

    it('with custom modal param name', () => {
      getModalViewParamNameStub.mockReturnValue('custom');
      mockLocation.search = '?custom=%2Fhome%2Fchild-2&customParams=%7B%22title%22%3A%22Real%20Child%22%7D';
      expect(RoutingHelpers.getModalPathFromPath(luigi)).toEqual('/home/child-2');
      expect(RoutingHelpers.getModalParamsFromPath(luigi)).toEqual({ title: 'Real Child' });
    });
  });

  describe('parseParams', () => {
    let mockParams;

    it('return pairs of params', () => {
      mockParams = 'test=true&foo=bar';
      expect(RoutingHelpers.parseParams(mockParams)).toEqual({
        test: 'true',
        foo: 'bar'
      });
    });

    it('return pairs of params 2', () => {
      mockParams = 'test=true&tets&test=false&foo&luigi=is+mega%20super';
      expect(RoutingHelpers.parseParams(mockParams)).toEqual({
        foo: '',
        test: 'false',
        tets: '',
        luigi: 'is mega super'
      });
    });

    it('should not fail on empty params', () => {
      mockParams = '';
      expect(RoutingHelpers.parseParams(mockParams)).toEqual({});
    });

    it('return pairs of params with a space and a plus', () => {
      mockParams = 'test=true+abc&foo=bar%2Babc';
      expect(RoutingHelpers.parseParams(mockParams)).toEqual({
        test: 'true abc',
        foo: 'bar+abc'
      });
    });
  });

  describe('getLocationSearchQueryParams', () => {
    let getLocationStub: jest.SpyInstance | undefined;
    afterEach(() => {
      if (getLocationStub) {
        getLocationStub.mockRestore();
        getLocationStub = undefined;
      }
    });

    function stubLocationSearch(searchValue: string): void {
      if (getLocationStub) getLocationStub.mockRestore();
      getLocationStub = jest.spyOn(RoutingHelpers, 'getLocation').mockReturnValue({ search: searchValue } as any);
    }

    it('returns empty object when no search part', () => {
      stubLocationSearch('');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({});
    });

    it('returns empty object when only "?" present', () => {
      stubLocationSearch('?');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({});
    });

    it('parses single parameter', () => {
      stubLocationSearch('?foo=bar');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({ foo: 'bar' });
    });

    it('parses multiple parameters', () => {
      stubLocationSearch('?foo=bar&baz=qux');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('decodes encoded characters', () => {
      stubLocationSearch('?a=1%202&b=sp%2Bce');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({ a: '1 2', b: 'sp+ce' });
    });

    it('converts plus sign to space', () => {
      stubLocationSearch('?q=hello+world+test');
      expect(RoutingHelpers.getLocationSearchQueryParams()).toEqual({ q: 'hello world test' });
    });
  });

  describe('buildRoute', () => {
    it('should return path with params if node has no parent (root node)', () => {
      const rootNode = {
        pathSegment: 'root'
      };

      const result = RoutingHelpers.buildRoute(rootNode, '/child', 'id=1');

      expect(result).toBe('/child?id=1');
    });

    it('should build full route recursively from child to root', () => {
      const rootNode = { pathSegment: 'root' };
      const parentNode = { pathSegment: 'parent', parent: rootNode };
      const childNode = { pathSegment: 'child', parent: parentNode };

      const result = RoutingHelpers.buildRoute(childNode, '/child');

      expect(result).toBe('/root/parent/child');
    });

    it('should append params only once at the end', () => {
      const rootNode = { pathSegment: 'root' };
      const parentNode = { pathSegment: 'parent', parent: rootNode };
      const childNode = { pathSegment: 'child', parent: parentNode };

      const result = RoutingHelpers.buildRoute(childNode, '/child', 'foo=bar');

      expect(result).toBe('/root/parent/child?foo=bar');
    });

    it('should handle single parent correctly', () => {
      const rootNode = { pathSegment: 'root' };
      const childNode = { pathSegment: 'child', parent: rootNode };

      const result = RoutingHelpers.buildRoute(childNode, '/child');

      expect(result).toBe('/root/child');
    });

    it('should work with empty params', () => {
      const rootNode = { pathSegment: 'root' };
      const childNode = { pathSegment: 'child', parent: rootNode };

      const result = RoutingHelpers.buildRoute(childNode, '/child', '');

      expect(result).toBe('/root/child');
    });
  });
});
