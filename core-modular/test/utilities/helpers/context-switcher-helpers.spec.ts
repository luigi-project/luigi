import { ContextSwitcherHelpers as CSHelpers } from '../../../src/utilities/helpers/context-switcher-helpers';
import { GenericHelpers } from '../../../src/utilities/helpers/generic-helpers';
import { RoutingHelpers } from '../../../src/utilities/helpers/routing-helpers';

describe('Context-switcher', function () {
  let luigi: any = {};
  let myResolverFn;

  beforeEach(() => {
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      navigation: () => ({
        navigate: () => {},
        navService: { extractDataFromPath: () => ({ pathData: { pathParams: { virtualnode: 'virtualnode' } } }) }
      }),
      routing: () => ({ getSearchParams: () => ({}) }),
      i18n: () => ({ getTranslation: () => undefined }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: (key: string) => {
        if (key === 'routing.contentViewParamPrefix') {
          return luigi.getConfig().routing.contentViewParamPrefix;
        }
        return null;
      },
      getConfigValueAsync: jest.fn(),
      getActiveFeatureToggles: () => [],
      i18n: jest.fn().mockReturnValue({
        getTranslation: (key: string) => key
      }),
      ux: jest.fn().mockReturnValue({
        showAlert: jest.fn()
      })
    };
    myResolverFn = jest.fn().mockImplementation((id: string) => '##' + id + '##');
    CSHelpers._fallbackLabels.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const getMockConfig = () => ({
    defaultLabel: 'Select Environment ...',
    parentNodePath: '/environments/',
    lazyloadOptions: true,
    actions: [
      {
        label: '+ New Environment',
        link: '/create-environment',
        position: 'top'
      }
    ],
    options: []
  });

  describe('getPreparedParentNodePath', () => {
    it('throws undefined parentNodePath', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      CSHelpers.getPreparedParentNodePath({});
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('throws falsy relative parentNodePath', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      CSHelpers.getPreparedParentNodePath({ parentNodePath: 'relative/path' });
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('adds slash to absolute parentNodePath', () => {
      const result = CSHelpers.getPreparedParentNodePath({
        parentNodePath: '/environment'
      });
      expect(result).toEqual('/environment/');
    });

    it('does not add slash to absolute parentNodePath with slash', () => {
      const result = CSHelpers.getPreparedParentNodePath({
        parentNodePath: '/environment/'
      });
      expect(result).toEqual('/environment/');
    });

    it('no parentNodePath', () => {
      const result = CSHelpers.getPreparedParentNodePath({
        parentNodePath: ''
      });
      expect(result).toEqual('');
    });
  });

  describe('getFallbackLabel', () => {
    beforeEach(() => {
      jest.spyOn(GenericHelpers, 'getConfigBooleanValue').mockClear().mockReturnValue(false);
    });

    it('works without fallback resolver', async () => {
      const result = await CSHelpers.getFallbackLabel(undefined, 'some_id', luigi);
      expect(result).toEqual('some_id');
    });

    it('works with fallback resolver', async () => {
      const result = await CSHelpers.getFallbackLabel(myResolverFn, 'some_id', luigi);
      expect(result).toEqual('##some_id##');
      expect(GenericHelpers.getConfigBooleanValue).toHaveBeenCalledWith(
        { routing: { contentViewParamPrefix: '~' } },
        'navigation.contextSwitcher.useFallbackLabelCache'
      );
    });

    it('works with fallback resolver cached', async () => {
      jest.spyOn(GenericHelpers, 'getConfigBooleanValue').mockClear().mockReturnValue(true);

      const result = await CSHelpers.getFallbackLabel(myResolverFn, 'some_id', luigi);
      expect(result).toEqual('##some_id##');

      const result2 = await CSHelpers.getFallbackLabel(myResolverFn, 'some_id', luigi);
      expect(result2).toEqual('##some_id##');

      expect(myResolverFn).toHaveBeenCalledTimes(1);
    });

    it('works with fallback resolver cache disabled', async () => {
      const result = await CSHelpers.getFallbackLabel(myResolverFn, 'some_id', luigi);
      expect(result).toEqual('##some_id##');

      const result2 = await CSHelpers.getFallbackLabel(myResolverFn, 'some_id', luigi);
      expect(result2).toEqual('##some_id##');

      expect(myResolverFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetFallbackLabelCache', () => {
    beforeEach(() => {
      CSHelpers._fallbackLabels.set('id_1', 'a');
      CSHelpers._fallbackLabels.set('id_2', 'b');
    });

    it('works without fallback resolver', async () => {
      expect(CSHelpers._fallbackLabels.size).toEqual(2);

      CSHelpers.resetFallbackLabelCache();

      expect(CSHelpers._fallbackLabels.size).toEqual(0);
    });
  });

  describe('fetchOptions', () => {
    let mockConfig;

    beforeEach(() => {
      mockConfig = getMockConfig();
      luigi.getConfigValue = jest.fn().mockImplementation(() => mockConfig);
    });

    it('lazyLoad off, existing options get returned', async () => {
      mockConfig.lazyloadOptions = false;

      const opts = ['a', 'b', 'c'];
      const result = await CSHelpers.fetchOptions(opts, luigi);
      const configSpy = jest.spyOn(luigi, 'getConfigValue');
      const asyncConfigSpy = jest.spyOn(luigi, 'getConfigValueAsync');

      expect(result).toEqual(opts);
      expect(configSpy).toHaveBeenCalledWith('navigation.contextSwitcher');
      expect(asyncConfigSpy).not.toHaveBeenCalled();
    });

    it('lazyLoad off, non-existing options fetches options', async () => {
      mockConfig.lazyloadOptions = false;

      const opts = ['a', 'b', 'c'];
      const expectedResult = 'works';
      const configSpy = jest.spyOn(luigi, 'getConfigValue');
      const asyncConfigSpy = jest.spyOn(luigi, 'getConfigValueAsync').mockClear().mockReturnValue(opts);
      const generateSwitcherSpy = jest
        .spyOn(CSHelpers, 'generateSwitcherNav')
        .mockClear()
        .mockReturnValue(expectedResult);
      const result = await CSHelpers.fetchOptions(undefined, luigi);

      expect(result).toEqual(expectedResult);
      expect(configSpy).toHaveBeenCalledWith('navigation.contextSwitcher');
      expect(asyncConfigSpy).toHaveBeenCalledWith('navigation.contextSwitcher.options');
      expect(generateSwitcherSpy).toHaveBeenCalledWith(mockConfig, opts);
    });

    it('lazyLoad on, always fetches options', async () => {
      mockConfig.lazyloadOptions = true;

      const opts = ['a', 'b', 'c'];
      const expectedResult = 'works';
      const configSpy = jest.spyOn(luigi, 'getConfigValue');
      const asyncConfigSpy = jest.spyOn(luigi, 'getConfigValueAsync').mockClear().mockReturnValue(opts);
      const generateSwitcherSpy = jest
        .spyOn(CSHelpers, 'generateSwitcherNav')
        .mockClear()
        .mockReturnValue(expectedResult);
      const result = await CSHelpers.fetchOptions(opts, luigi);

      await CSHelpers.fetchOptions(opts, luigi);
      await CSHelpers.fetchOptions(opts, luigi);

      expect(result).toEqual(expectedResult);
      expect(configSpy).toHaveBeenCalledWith('navigation.contextSwitcher');
      expect(asyncConfigSpy).toHaveBeenCalledWith('navigation.contextSwitcher.options');
      expect(generateSwitcherSpy).toHaveBeenCalledWith(mockConfig, opts);
      expect(generateSwitcherSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('generateSwitcherNav', () => {
    it('composes proper values with ParentNodePath', async () => {
      const result = await CSHelpers.generateSwitcherNav({ parentNodePath: '/environment' }, [
        { label: 'Env 1', pathValue: 'env1' }
      ]);

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify([
          {
            label: 'Env 1',
            link: '/environment/env1',
            id: 'env1'
          }
        ])
      );
    });

    it('composes proper values without ParentNodePath', async () => {
      const result = await CSHelpers.generateSwitcherNav({}, [{ label: 'Env 1', pathValue: 'env1' }]);

      expect(JSON.stringify(result)).toEqual(
        JSON.stringify([
          {
            label: 'Env 1',
            link: '/env1',
            id: 'env1'
          }
        ])
      );
    });
  });

  describe('getOptionById', () => {
    const env1 = { label: 'Env 1', id: '1' };
    const env2 = { label: 'Env 2', id: '2' };

    it('returns undefined if node is not inside options', () => {
      const result = CSHelpers.getOptionById([env1, env2], '3');
      expect(result).toBeUndefined();
    });

    it('returns matching node', () => {
      const result = CSHelpers.getOptionById([env1, env2], '2');
      expect(result).toEqual({ label: 'Env 2', id: '2' });
    });
  });

  describe('getLabelFromOptions', () => {
    const env1 = { label: 'Env 1', id: 'env1' };
    const env2 = { label: 'Env 2', id: 'env2' };

    it('returns undefined if node is not inside options', () => {
      const result = CSHelpers.getLabelFromOptions([env1, env2], 'env3');
      expect(result).toBeUndefined();
    });

    it('returns matching node label', () => {
      const result = CSHelpers.getLabelFromOptions([env1, env2], 'env2');
      expect(result).toEqual('Env 2');
    });
  });

  describe('isContextSwitcherDetailsView', () => {
    let currentPath;
    let parentNodePath;

    beforeEach(() => {
      parentNodePath = '/home/projects';
      currentPath = '/home/projects/pr1';
      GenericHelpers.addTrailingSlash = jest.fn().mockImplementation((s) => s + `/`);
    });

    it('returns false if parent node path is falsy', () => {
      parentNodePath = undefined;
      const result = CSHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath);
      expect(result).toBeFalsy();
    });

    it('returns false if parent node path is not included in current path', () => {
      parentNodePath = '/home/nomatch';
      const result = CSHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath);
      expect(result).toBeFalsy();
    });

    it('returns false if last path segment from parent node is not a full match in currentPath', () => {
      currentPath = '/home/projectsandmore/pr1';
      const result = CSHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath);
      expect(result).toBeFalsy();
    });

    it('returns false if current path has no content after parent node path', () => {
      currentPath = '/home/projects';
      const result = CSHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath);
      expect(result).toBeFalsy();
    });

    it('returns true if current path has content after parent node path', () => {
      const result = CSHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath);
      expect(result).toEqual(true);
    });
  });

  describe('getSelectedId', () => {
    let currentPath;
    let parentNodePath;
    const env1 = { label: 'Env 1', id: '1' };
    const env2 = { label: 'Env 2', id: '2' };

    beforeEach(() => {
      parentNodePath = '/home/projects';
      currentPath = '/home/projects/pr1';
    });

    [
      {
        it: 'returns undefined if parent node path is not defined',
        parentNodePath: undefined,
        assert: undefined
      },
      {
        it: 'returns undefined if parent node path is not included in current path',
        parentNodePath: '/home/nomatch',
        assert: undefined
      }
    ].forEach((t) => {
      it(t.it, () => {
        const selectedId = CSHelpers.getSelectedId(currentPath, [env1, env2], t.parentNodePath);
        expect(selectedId).toEqual(t.assert);
      });
    });

    [
      {
        it: 'returns undefined if last path segment from parent node is not a full match in currentPath',
        currentPath: '/home/projectsandmore/pr1',
        assert: undefined
      },
      {
        it: 'returns undefined if current path has no content after parent node path',
        currentPath: '/home/projects',
        assert: undefined
      }
    ].forEach((t) => {
      it(t.it, () => {
        const selectedId = CSHelpers.getSelectedId(t.currentPath, [env1, env2], parentNodePath);
        expect(selectedId).toEqual(t.assert);
      });
    });

    it('returns id if current path has id after parent node path', () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);

      const selectedId = CSHelpers.getSelectedId(currentPath, [env1, env2], parentNodePath);
      expect(selectedId).toEqual('pr1');
    });

    it('returns id even if current path has params after id', () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);
      currentPath = '/home/projects/pr1?foo=bar&test=false';

      const selectedId = CSHelpers.getSelectedId(currentPath, [env1, env2], parentNodePath);
      expect(selectedId).toEqual('pr1');
    });
  });

  describe('getSelectedOption', () => {
    let currentPath;
    let parentNodePath;
    const env1 = { label: 'Env 1', id: 'pr1' };
    const env2 = { label: 'Env 2', id: 'pr2' };

    beforeEach(() => {
      parentNodePath = '/home/projects';
      currentPath = '/home/projects/pr1';
    });

    [
      {
        it: 'returns undefined if parent node path is not defined',
        parentNodePath: undefined,
        assert: undefined
      },
      {
        it: 'returns undefined if parent node path is not included in current path',
        parentNodePath: '/home/nomatch',
        assert: undefined
      }
    ].forEach((t) => {
      it(t.it, async () => {
        const selectedOption = await CSHelpers.getSelectedOption(currentPath, [env1, env2], t.parentNodePath);
        expect(selectedOption).toEqual(t.assert);
      });
    });

    [
      {
        it: 'returns undefined if last path segment from parent node is not a full match in currentPath',
        currentPath: '/home/projectsandmore/pr1',
        assert: undefined
      },
      {
        it: 'returns undefined if current path has no content after parent node path',
        currentPath: '/home/projects',
        assert: undefined
      }
    ].forEach((t) => {
      it(t.it, async () => {
        const selectedOption = await CSHelpers.getSelectedOption(t.currentPath, [env1, env2], parentNodePath);
        expect(selectedOption).toEqual(t.assert);
      });
    });

    it('returns option if current path has id after parent node path', async () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);

      const selectedOption = await CSHelpers.getSelectedOption(currentPath, [env1, env2], parentNodePath);
      expect(selectedOption).toEqual({ label: 'Env 1', id: 'pr1' });
    });

    it('returns option even if current path has params after id', async () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);
      currentPath = '/home/projects/pr1?foo=bar&test=false';

      const selectedOption = await CSHelpers.getSelectedOption(currentPath, [env1, env2], parentNodePath);
      expect(selectedOption).toEqual({ label: 'Env 1', id: 'pr1' });
    });
  });

  describe('getSelectedLabel', () => {
    const parentNodePath = '/environment';

    it('returns undefined when path only partially contains parentNodePath', async () => {
      const result = await CSHelpers.getSelectedLabel('/environmentWhatever', [], parentNodePath, myResolverFn, luigi);
      expect(result).toBeUndefined();
    });

    it('returns undefined if outside current path', async () => {
      const result = await CSHelpers.getSelectedLabel('/something', [], parentNodePath, myResolverFn, luigi);
      expect(result).toBeUndefined();
    });

    it('returns env id', async () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);

      const env1 = { label: 'Env 1', id: 'env1' };
      const env2 = { label: 'Env 2', id: 'env2' };
      const result = await CSHelpers.getSelectedLabel(
        '/environment/env2',
        [env1, env2],
        parentNodePath,
        myResolverFn,
        luigi
      );
      expect(result).toEqual(env2.label);
    });

    it('returns fallback label if inside parentNodePath', async () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);

      const env1 = { label: 'Env 1', id: 'env1' };
      const env2 = { label: 'Env 2', id: 'env2' };
      const result = await CSHelpers.getSelectedLabel(
        '/environment/env3',
        [env1, env2],
        parentNodePath,
        myResolverFn,
        luigi
      );
      expect(result).toEqual('##env3##');
    });

    it('returns node label without path params', async () => {
      CSHelpers.isContextSwitcherDetailsView = jest.fn().mockImplementation(() => true);

      const result = await CSHelpers.getSelectedLabel(
        '/environment/env1?mask=opatol',
        null,
        parentNodePath,
        myResolverFn,
        luigi
      );
      expect(result).toEqual('##env1##');
    });
  });

  describe('getNodePathFromCurrentPath', () => {
    it('returns option path if current path does not fit', () => {
      RoutingHelpers.getCurrentPath = jest.fn().mockImplementation(() => ({ path: '/projects/pr1', query: '' }));

      const result = CSHelpers.getNodePathFromCurrentPath(
        {
          link: '/environments/env3'
        },
        {
          link: '/environments/env1'
        }
      );
      expect(result).toEqual('/environments/env3');
    });

    it('returns correctly adapted path', () => {
      RoutingHelpers.getCurrentPath = jest
        .fn()
        .mockImplementation(() => ({ path: '/environments/env1/details/and/more', query: '' }));

      const result = CSHelpers.getNodePathFromCurrentPath(
        {
          link: '/environments/env3/details'
        },
        {
          link: '/environments/env1/details'
        }
      );
      expect(result).toEqual('/environments/env3/details/and/more');
    });
  });
});
