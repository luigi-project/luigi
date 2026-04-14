import { LuigiAuth, LuigiConfig, LuigiFeatureToggles, LuigiI18N } from '../../../src/core-api';
import { Navigation } from '../../../src/navigation/services/navigation';
import { Routing } from '../../../src/services';
import { AuthHelpers, NavigationHelpers, RoutingHelpers } from '../../../src/utilities/helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Navigation-helpers', () => {
  describe('isNodeAccessPermitted', () => {
    let permissionCheckerFn;

    beforeEach(() => {
      permissionCheckerFn = sinon.spy();
      sinon.stub(LuigiAuth, 'isAuthorizationEnabled');
      sinon.stub(AuthHelpers, 'isLoggedIn');
      sinon.stub(LuigiConfig, 'getConfigValue');
    });

    afterEach(() => {
      permissionCheckerFn = undefined;
      sinon.restore();
    });

    it('without permissionCheckerFn', () => {
      LuigiConfig.getConfigValue.returns(null);
      assert.isTrue(NavigationHelpers.isNodeAccessPermitted());
    });

    it('logged in, normal anonymousAccess', () => {
      const checkNode = {
        anonymousAccess: true
      };

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(true);

      assert.isTrue(NavigationHelpers.isNodeAccessPermitted(checkNode));
    });

    it('logged out, normal anonymousAccess', () => {
      const checkNode = {
        anonymousAccess: true
      };

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(false);

      assert.isTrue(NavigationHelpers.isNodeAccessPermitted(checkNode));
    });

    it('logged in, exclusive anonymousAccess', () => {
      const checkNode = {
        anonymousAccess: 'exclusive'
      };

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(true);
      LuigiConfig.getConfigValue.returns(permissionCheckerFn);

      assert.isFalse(NavigationHelpers.isNodeAccessPermitted(checkNode));
    });

    it('logged out, exclusive anonymousAccess, without permissionCheckerFn', () => {
      const checkNode = {
        anonymousAccess: 'exclusive'
      };

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(false);
      LuigiConfig.getConfigValue.returns(undefined);

      assert.isTrue(NavigationHelpers.isNodeAccessPermitted(checkNode));
    });

    it('logged out, no anonymousAccess', () => {
      const checkNode = {
        anonymousAccess: false
      };

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(false);

      assert.isFalse(NavigationHelpers.isNodeAccessPermitted(checkNode));
    });

    it('with permissionCheckerFn', () => {
      const checkNode = { viewUrl: 'current' };
      const parentNode = { viewUrl: 'parent' };
      const context = { data: '' };
      const permissionCheckerFn = sinon.stub().returns(true);

      LuigiAuth.isAuthorizationEnabled.returns(true);
      AuthHelpers.isLoggedIn.returns(true);
      LuigiConfig.getConfigValue.returns(permissionCheckerFn);

      assert.isTrue(NavigationHelpers.isNodeAccessPermitted(checkNode, parentNode, context));
      assert(
        permissionCheckerFn.calledWith(checkNode, parentNode, context),
        'permissionCheckerFn called with proper arguments'
      );
    });
  });

  describe('isOpenUIiconName', () => {
    it('should return true for valid icon names', async () => {
      assert.equal(NavigationHelpers.isOpenUIiconName('settings'), true);
      assert.equal(NavigationHelpers.isOpenUIiconName('add-activity-2'), true);
      assert.equal(NavigationHelpers.isOpenUIiconName('back-to-top'), true);
    });

    it('should return false for invalid icon names', async () => {
      assert.equal(NavigationHelpers.isOpenUIiconName('./relative.path'), false);
      assert.equal(NavigationHelpers.isOpenUIiconName('http://niceicons.com/that-one-icon.png'), false);
      assert.equal(NavigationHelpers.isOpenUIiconName('https://google.com'), false);
    });
  });

  describe('getProductSwitcherColumnsNumber', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return number from config file if columns are defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        columns: 'auto',
        items: () => {
          return [{}, {}, {}];
        }
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 3);
    });

    it('should return number from config file even if columns are not defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        columns: 'auto',
        items: () => {
          return [{}, {}, {}, {}, {}, {}, {}]; //7
        }
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 4);
    });

    it('should return number from config file even if columns are not defined and items proberty is an array', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        columns: 'auto',
        items: [{}, {}, {}, {}, {}, {}, {}]
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 4);
    });

    it('should return undefined if no items in config defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        columns: 'auto'
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, undefined);
    });

    it('should return undefined if empty array items in config defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        columns: 'auto',
        item: []
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, undefined);
    });

    it('should return number from config file if columns are defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        items: () => {
          return [];
        },
        columns: 3
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 3);
    });

    it('should return number from config file if columns are defined and items proberty is an array', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        items: [],
        columns: 3
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 3);
    });

    it('should return number from config file if columns are defined', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        items: () => {
          return [];
        },
        columns: '110'
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 4);
    });

    it('should return number from config file if columns are defined and items proberty is an array', () => {
      LuigiConfig.getConfigValue.returns({
        icon: 'grid',
        label: 'Products',
        items: [],
        columns: '110'
      });
      const columns = NavigationHelpers.getProductSwitcherColumnsNumber();
      assert.equal(columns, 4);
    });
  });

  describe('getNodePath', () => {
    it('should return path built without parent segment', () => {
      const node = {
        pathSegment: 'pathSegment'
      };

      assert.equal(NavigationHelpers.getNodePath(node), '/pathSegment', 'path should match');
    });

    it('should return path built from both parent and child segment', () => {
      const node = {
        parent: {
          pathSegment: 'parent'
        },
        pathSegment: 'pathSegment'
      };

      assert.equal(NavigationHelpers.getNodePath(node), '/parent/pathSegment', 'path should match');
    });
  });

  describe('handleUnresponsiveClient', () => {
    let node;
    beforeEach(() => {
      node = {
        category: 'External Views',
        viewId: 'viewX',
        label: 'This is X',
        viewUrl: 'https://this.is.x/index.html'
      };
      Routing.navigateTo = sinon.spy();
    });
    afterEach(() => {
      sinon.restore();
    });

    it('default redirection', () => {
      // given
      node.errorPageHandler = {
        timeout: 1000
      };
      const defaultPath = '/';

      // when
      NavigationHelpers.handleUnresponsiveClient(node.errorPageHandler);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, defaultPath);
    });

    it('redirection to the specified path', async () => {
      // given
      node.errorPageHandler = {
        timeout: 1000,
        redirectPath: '/somewhere'
      };
      const expectedPath = node.errorPageHandler.redirectPath;

      // when
      NavigationHelpers.handleUnresponsiveClient(node.errorPageHandler);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedPath);
    });

    it('test when errorFn takes effect', async () => {
      // given
      node.errorPageHandler = {
        timeout: 1000,
        redirectPath: '/somewhere',
        errorFn: sinon.spy()
      };

      // when
      NavigationHelpers.handleUnresponsiveClient(node.errorPageHandler);

      // then
      sinon.assert.calledOnce(node.errorPageHandler.errorFn);
    });
  });

  describe('burger tooltip', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('Burger tooltip with defined collapsed and expanded label', () => {
      LuigiConfig.getConfigValue.returns({
        navExpanded: 'Collapse navigation test',
        navCollapsed: 'Expand navigation test'
      });
      const [collapseLabel, expandLabel] = NavigationHelpers.getBurgerTooltipConfig();
      assert.equal(collapseLabel, 'Expand navigation test');
      assert.equal(expandLabel, 'Collapse navigation test');
    });

    it('Burger tooltip without defining a label, just use boolean', () => {
      LuigiConfig.getConfigValue.returns(true);
      const [collapseLabel, expandLabel] = NavigationHelpers.getBurgerTooltipConfig();
      assert.equal(collapseLabel, 'Expand navigation');
      assert.equal(expandLabel, 'Collapse navigation');
    });
  });

  describe('shouldPreventNavigationForPath', () => {
    afterEach(() => {
      sinon.restore();
      sinon.reset();
    });

    it('returns true when navigation should be prevented for path', async () => {
      sinon.stub(Navigation, 'getNavigationPath').returns('testPreventNavigation');
      sinon.stub(RoutingHelpers, 'getLastNodeObject').returns({
        pathSegment: 'testPreventNavigation',
        label: 'Prevent navigation conditionally',
        onNodeActivation: () => {
          return false;
        }
      });
      const actual = await NavigationHelpers.shouldPreventNavigationForPath('testPreventNavigation');
      assert.equal(actual, true);
    });

    it('returns false when navigation should not be prevented for path', async () => {
      sinon.stub(Navigation, 'getNavigationPath').returns('testNotPreventNavigation');
      sinon.stub(RoutingHelpers, 'getLastNodeObject').returns({
        pathSegment: 'testNotPreventNavigation',
        label: 'Do not prevent navigation conditionally',
        onNodeActivation: () => {
          return true;
        }
      });
      const actual = await NavigationHelpers.shouldPreventNavigationForPath('testNotPreventNavigation');
      assert.equal(actual, false);
    });
  });

  describe('node title data', () => {
    let object;

    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue');
      sinon.stub(NavigationHelpers, '_fetch');
      object = {
        some: {
          nested: {
            value: 'value'
          },
          other: {
            key: 'otherkey',
            value: 'othervalue'
          }
        }
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('getPropertyChainValue', () => {
      assert.equal(NavigationHelpers.getPropertyChainValue(object, 'some.nested.value'), 'value');
      assert.equal(NavigationHelpers.getPropertyChainValue(object, 'some.nested.value2', 'fallback'), 'fallback');
      assert.equal(NavigationHelpers.getPropertyChainValue(undefined, 'some.nested.value2', 'fallback'), 'fallback');
      assert.equal(NavigationHelpers.getPropertyChainValue(object, undefined, 'fallback'), 'fallback');
      assert.equal(NavigationHelpers.getPropertyChainValue(undefined, undefined, 'fallback'), 'fallback');
      assert.equal(NavigationHelpers.getPropertyChainValue(object, 'some'), object.some);
      assert.equal(NavigationHelpers.getPropertyChainValue(object, '', 'fallback'), 'fallback');
    });

    it('substituteVars', () => {
      const resolver = {
        a: {
          b: {
            value: 'xyz_${some.nested.value}_andbeyond'
          },
          c: {
            '${some.other.key}': 'keyrep_${some.other.value}'
          }
        }
      };
      const subs = NavigationHelpers.substituteVars(resolver, object);
      assert.equal(subs.a.b.value, 'xyz_value_andbeyond');
      assert.equal(subs.a.c.otherkey, 'keyrep_othervalue');
    });

    describe('fetchNodeTitleData', () => {
      const samplenode = {
        context: {
          token: '123456789',
          projectId: 'pr1'
        },
        titleResolver: {
          request: {
            method: 'POST',
            url: 'http://localhost/test',
            headers: {
              authorization: 'Bearer ${token}',
              'content-type': 'application/json'
            },
            body: {
              operationName: 'project',
              query:
                'query project($projectId: ID!) {\n  project(projectId: $projectId) {\n    projectId\n    displayName\n    owner\n    description\n    created\n    __typename\n  }\n}\n',
              variables: {
                projectId: '${projectId}'
              }
            }
          },
          titlePropertyChain: 'data.project.displayName',
          iconPropertyChain: 'data.img',
          prerenderFallback: true,
          titleDecorator: 'decorate %s end',
          fallbackTitle: 'Project',
          fallbackIcon: 'curriculum'
        }
      };

      it('should reject if no titleResolver set', (done) => {
        NavigationHelpers.fetchNodeTitleData({ titleResolver: undefined }, {})
          .then(() => {
            assert.fail('Should not be here');
          })
          .catch(() => {
            // should fail
            done();
          });
      });

      it('should get data from cache', (done) => {
        const node = {
          titleResolver: {
            url: 'http://localhost'
          }
        };

        const value = {
          some: 'value'
        };

        node.titleResolver._cache = {
          key: JSON.stringify(node.titleResolver),
          value: value
        };

        NavigationHelpers.fetchNodeTitleData(node, node.context).then((data) => {
          assert.equal(data, value);
          done();
        });
      });

      it('should use correct request data and properly process response data', (done) => {
        const node = JSON.parse(JSON.stringify(samplenode));

        let fetchUrl, fetchOptions;
        NavigationHelpers._fetch.callsFake((url, options) => {
          fetchUrl = url;
          fetchOptions = options;
          return new Promise((resolve, reject) => {
            resolve(
              new Response(JSON.stringify({}), {
                status: 200,
                headers: { 'Content-type': 'application/json' }
              })
            );
          });
        });

        const assertRequestData = () => {
          assert.equal(fetchUrl, 'http://localhost/test');
          assert.equal(fetchOptions.headers.authorization, 'Bearer 123456789');
          assert.equal(JSON.parse(fetchOptions.body).variables.projectId, 'pr1');
        };

        NavigationHelpers.fetchNodeTitleData(node, node.context)
          .then(() => {
            assertRequestData();
            done();
          })
          .catch((e) => {
            assertRequestData();
            done();
          });
      });

      it('should process server response correctly', () => {
        const node = JSON.parse(JSON.stringify(samplenode));
        const mockedResponse = {
          data: {
            img: 'imgurl',
            project: {
              displayName: 'display'
            }
          }
        };

        const titleData = NavigationHelpers.processTitleData(mockedResponse, node.titleResolver);
        assert.equal(titleData.icon, 'imgurl');
        assert.equal(titleData.label, 'decorate display end');
      });

      it('should return fallback', () => {
        const node = JSON.parse(JSON.stringify(samplenode));
        const mockedResponse = {};

        const titleData = NavigationHelpers.processTitleData(mockedResponse, node.titleResolver);
        assert.equal(titleData.icon, 'curriculum');
        assert.equal(titleData.label, 'Project');
      });
    });

    describe('groupNodesBy', () => {
      let nodes;

      beforeEach(() => {
        nodes = [
          {
            category: '1',
            pathSegment: 'luigi',
            label: 'luigi',
            viewUrl: '/microfrontend.html'
          },
          {
            pathSegment: 'amfe',
            label: 'a mfe',
            viewUrl: '/microfrontend.html',
            category: { label: 'test' }
          },
          {
            pathSegment: 'amfe',
            label: 'a mfe',
            viewUrl: '/microfrontend.html',
            category: { label: 'luigi' }
          },
          {
            category: 'luigi',
            pathSegment: 'luigi',
            label: 'luigi',
            viewUrl: '/microfrontend.html'
          }
        ];
      });

      it('group nodes by category id', () => {
        nodes[1].category.id = '1';
        nodes[1].category.collapsible = true;
        const result = NavigationHelpers.groupNodesBy(nodes, 'category', true);
        assert.deepEqual(Object.keys(result), ['luigi', 'test']);
        assert.deepEqual(result.luigi['metaInfo'], { label: 'luigi', order: 1, categoryUid: 'luigi' });
        assert.deepEqual(result.test['metaInfo'], {
          label: 'test',
          order: 0,
          id: '1',
          collapsible: true,
          categoryUid: '1'
        });
      });

      it('group nodes by category label', () => {
        nodes[1].category.collapsible = true;
        const result = NavigationHelpers.groupNodesBy(nodes, 'category', true);
        assert.deepEqual(Object.keys(result), ['1', 'test', 'luigi']);
        assert.deepEqual(result.test['metaInfo'], { categoryUid: 'test', label: 'test', collapsible: true, order: 1 });
      });

      it('first category object counts', () => {
        const node = {
          pathSegment: 'someNode',
          label: 'someNode',
          category: {
            label: 'luigi',
            collapsible: true,
            icon: 'someIcon'
          },
          viewUrl: '/microfrontend.html'
        };
        nodes.push(node);
        const result = NavigationHelpers.groupNodesBy(nodes, 'category', true);
        assert.deepEqual(result.luigi.metaInfo, { label: 'luigi', order: 2, categoryUid: 'luigi' });
      });

      it('first category object counts - part 2', () => {
        const node = {
          pathSegment: 'someNode',
          label: 'someNode',
          category: {
            id: '1',
            label: 'One',
            collapsible: true,
            icon: 'someIcon'
          },
          viewUrl: '/microfrontend.html'
        };
        nodes.push(node);
        const result = NavigationHelpers.groupNodesBy(nodes, 'category', true);
        assert.deepEqual(result.One.metaInfo, {
          label: 'One',
          order: 0,
          id: '1',
          collapsible: true,
          icon: 'someIcon',
          categoryUid: '1'
        });
        assert.equal(result.One[0].label, 'luigi');
        assert.equal(result.One[1].label, 'someNode');
      });
    });
  });

  describe('generate tooltip text', () => {
    let node;

    beforeEach(() => {
      node = {
        label: 'LuigiNode'
      };
      sinon.stub(LuigiConfig, 'getConfigValue');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('tooltip text on node', () => {
      node.tooltipText = 'MarioNode';
      assert.equal(NavigationHelpers.generateTooltipText(node, 'LuigiNode'), 'MarioNode');
    });

    it('tooltip turned off', () => {
      node.tooltipText = false;
      assert.equal(NavigationHelpers.generateTooltipText(node, 'LuigiNode'), '');
    });

    it('tooltip not defined', () => {
      assert.equal(NavigationHelpers.generateTooltipText(node, 'LuigiNode'), 'LuigiNode');
    });

    it('tooltip turned off used defaults', () => {
      LuigiConfig.getConfigValue.returns(false);
      assert.equal(NavigationHelpers.generateTooltipText(node, 'LuigiNode'), '');
    });
  });

  describe('check visible for feature toggles', () => {
    let nodeToCheckPermission;

    beforeEach(() => {
      nodeToCheckPermission = {
        visibleForFeatureToggles: ['testFt']
      };
      sinon.stub(LuigiFeatureToggles, 'getActiveFeatureToggleList');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('Node is visible with Ft "testFT"', async () => {
      LuigiFeatureToggles.getActiveFeatureToggleList.returns(['testFt']);
      assert.equal(NavigationHelpers.checkVisibleForFeatureToggles(nodeToCheckPermission), true);
    });

    it('Node is NOT visible with Ft "testFT2"', async () => {
      nodeToCheckPermission.visibleForFeatureToggles = ['!testFt2'];
      LuigiFeatureToggles.getActiveFeatureToggleList.returns(['testFt', 'testFt2']);
      assert.equal(NavigationHelpers.checkVisibleForFeatureToggles(nodeToCheckPermission), false);
    });

    it('Node is NOT visible with Ft "testFT"', async () => {
      LuigiFeatureToggles.getActiveFeatureToggleList.returns(['test']);
      assert.equal(NavigationHelpers.checkVisibleForFeatureToggles(nodeToCheckPermission), false);
    });
  });

  describe('generate top nav nodes', () => {
    let pathData;

    beforeEach(() => {
      pathData = [
        {
          children: [
            {
              pathSegment: 'overview',
              label: 'overview',
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
            },
            {
              pathSegment: 'projects',
              label: 'Projects',
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
              children: [
                {
                  pathSegment: 'settings',
                  label: 'Settings',
                  viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                }
              ]
            },
            {
              pathSegment: 'user_management',
              label: 'User Management',
              category: { label: 'test' },
              viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html',
              children: [
                {
                  pathSegment: 'developers',
                  label: 'Developers',
                  viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
                }
              ]
            }
          ]
        },
        {
          pathSegment: 'overview',
          label: 'overview',
          viewUrl: 'https://fiddle.luigi-project.io/examples/microfrontends/multipurpose.html'
        }
      ];
    });

    it('check visible nodes and children of top nav', async () => {
      let tnd = await NavigationHelpers.generateTopNavNodes(pathData);
      assert.equal(tnd.visibleNodeCount, 3);
      assert.equal(tnd.children[0].label, 'overview');
      assert.equal(tnd.children[1].label, 'Projects');
      assert.equal(tnd.children[2].label, 'test');
      assert.equal(tnd.children[2].isCat, true);
      assert.equal(tnd.children[2].visibleChildren[0].pathSegment, 'user_management');
    });
  });

  describe('prepare for test id if no testId is configured', () => {
    it('prepare test id', () => {
      assert.equal(NavigationHelpers.prepareForTests('Te st'), 'test');
      assert.equal(NavigationHelpers.prepareForTests('TEST'), 'test');
      assert.equal(NavigationHelpers.prepareForTests('te&st'), 'te%26st');
      assert.equal(NavigationHelpers.prepareForTests(''), '');
      assert.equal(NavigationHelpers.prepareForTests('Das', 'ist', 'ein', 'Test'), 'das_ist_ein_test');
    });
  });

  describe('load and store expanded categories', () => {
    let localStorageSpy;

    beforeEach(() => {
      const storageMock = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
      localStorageSpy = jest.spyOn(global, 'localStorage', 'get');
      localStorageSpy.mockImplementation(() => {
        return storageMock;
      });
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
      localStorageSpy.mockRestore();
    });

    it('load expanded category', () => {
      localStorage.getItem.returns('["home:cat"]');
      assert.deepEqual(NavigationHelpers.loadExpandedCategories(), ['home:cat']);
    });

    it('load expanded categories', () => {
      localStorage.getItem.returns('["home:cat1", "home:cat2"]');
      assert.deepEqual(NavigationHelpers.loadExpandedCategories(), ['home:cat1', 'home:cat2']);
    });

    it('store expanded state with empty expanded cat', () => {
      const expandedList = NavigationHelpers.storeExpandedState('home:cat', true);
      sinon.assert.calledWithExactly(
        global.localStorage.setItem,
        'luigi.preferences.navigation.expandedCategories',
        JSON.stringify(['home:cat'])
      );
      assert.deepEqual(expandedList, ['home:cat']);
    });

    it('store expanded state with stored cat', () => {
      sinon.stub(NavigationHelpers, 'loadExpandedCategories').returns(['home:cat', 'home:cat2']);
      assert.deepEqual(NavigationHelpers.storeExpandedState('home:cat2', true), ['home:cat', 'home:cat2']);
      sinon.assert.calledWithExactly(
        global.localStorage.setItem,
        'luigi.preferences.navigation.expandedCategories',
        JSON.stringify(['home:cat', 'home:cat2'])
      );
    });

    it('store expanded state with stored cat', () => {
      sinon.stub(NavigationHelpers, 'loadExpandedCategories').returns(['home:cat', 'home:cat2']);
      assert.deepEqual(NavigationHelpers.storeExpandedState('home:cat2', false), ['home:cat']);
      sinon.assert.calledWithExactly(
        global.localStorage.setItem,
        'luigi.preferences.navigation.expandedCategories',
        JSON.stringify(['home:cat'])
      );
    });
  });

  describe('renderIconClassName', () => {
    it('should render sap-icon to standard icon suite', () => {
      assert.equal(NavigationHelpers.renderIconClassName('home'), 'sap-icon--home');
    });

    it('should render sap-icon to TNT suite', () => {
      assert.equal(NavigationHelpers.renderIconClassName('TNT--home'), 'sap-icon-TNT--home');
    });

    it('should render sap-icon to businessSuiteInAppSymbols suite', () => {
      assert.equal(
        NavigationHelpers.renderIconClassName('businessSuiteInAppSymbols--home'),
        'sap-icon-businessSuiteInAppSymbols--home'
      );
    });

    it('render icon class name without name', () => {
      assert.equal(NavigationHelpers.renderIconClassName(''), '');
    });
  });

  describe('handleNavAnchorClickedWithoutMetaKey', () => {
    let event;

    beforeEach(() => {
      event = new Event('click');
      event.preventDefault = sinon.spy();
      event.stopPropagation = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
    });

    it('call the function with keyboard meta control pressed should return false', () => {
      event.ctrlKey = true;
      assert.equal(NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event), false);
      sinon.assert.notCalled(event.preventDefault);
      sinon.assert.calledOnce(event.stopPropagation);
    });

    it('call the function without keyboard meta control pressed should return true', () => {
      assert.equal(NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event), true);
      sinon.assert.calledOnce(event.preventDefault);
      sinon.assert.notCalled(event.stopPropagation);
    });
  });

  describe('getNodeLabel', () => {
    let node = {
      pathSegment: 'mynode',
      label: 'myNode {viewGroupData.foo}',
      viewUrl: 'test.html',
      viewGroup: 'vg1'
    };

    beforeEach(() => {
      sinon.stub(LuigiI18N, 'getTranslation').returns('myNode {viewGroupData.foo}');
      sinon.stub(NavigationHelpers, 'getViewGroupSettings').returns({ _liveCustomData: { foo: 'Luigi rocks!' } });
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
    });

    it('get correct node label', () => {
      assert.notEqual(NavigationHelpers.getNodeLabel(node), 'myNode {viewGroupData.foo}');
      assert.equal(NavigationHelpers.getNodeLabel(node), 'myNode Luigi rocks!');
    });

    it('getNodeLabel w/o vg', () => {
      delete node.viewGroup;
      assert.notEqual(NavigationHelpers.getNodeLabel(node), 'myNode Luigi rocks!');
      assert.equal(NavigationHelpers.getNodeLabel(node), 'myNode {viewGroupData.foo}');
    });
  });

  describe('getViewGroupSettings', () => {
    let viewGroupSettings;

    beforeEach(() => {
      viewGroupSettings = {
        ham: {
          preloadUrl: 'ham.html'
        },
        cheese: {
          preloadUrl: 'cheese.html'
        },
        ananas: {
          preloadUrl: 'ananas.html'
        }
      };
      sinon.stub(NavigationHelpers, 'getAllViewGroupSettings').callsFake(() => {
        return viewGroupSettings;
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('return viewgroup from viewgroup settings', () => {
      assert.deepEqual(NavigationHelpers.getViewGroupSettings('ananas'), {
        preloadUrl: 'ananas.html'
      });
    });

    it('no view group found in viewgroup settings', () => {
      assert.deepEqual(NavigationHelpers.getViewGroupSettings(''), {});
      assert.deepEqual(NavigationHelpers.getViewGroupSettings('somethingElse'), {});
    });
  });

  describe('findViewGroup', () => {
    const noViewGroupInNode = {
      link: 'child-node',
      parent: {
        pathSegment: 'parent-node'
      }
    };

    const viewGroupInNode = {
      link: 'child-node',
      viewGroup: 'tets 1',
      parent: {
        pathSegment: 'parent-node'
      }
    };

    const viewGroupInNodeParent = {
      link: 'child-node',
      viewUrl: './relative',
      parent: {
        pathSegment: 'parent-node',
        viewGroup: 'tets 1-1',
        viewUrl: './relative/foo/bar'
      }
    };

    const viewGroupInParentOfNodeParent = {
      link: 'child-node',
      viewUrl: 'http://bla.blub/but/something/else',
      parent: {
        pathSegment: 'parent-node',
        parent: {
          pathSegment: 'parent-parent-node',
          viewGroup: 'tets 1-1-1',
          viewUrl: 'http://bla.blub/foo/bar'
        }
      }
    };

    const viewGroupInParentOfNodeParentDifferentUrl = {
      link: 'child-node',
      viewUrl: 'http://bla2.blub/foo/bar',
      parent: {
        pathSegment: 'parent-node',
        parent: {
          pathSegment: 'parent-parent-node',
          viewGroup: 'tets 1-1-1',
          viewUrl: 'http://bla.blub/foo/bar'
        }
      }
    };

    it('return viewGroup from node', () => {
      assert.deepEqual(NavigationHelpers.findViewGroup(viewGroupInNode), 'tets 1');
    });

    it('return viewGroup from node.parent', () => {
      assert.deepEqual(NavigationHelpers.findViewGroup(viewGroupInNodeParent), 'tets 1-1');
    });

    it('return viewGroup from parent at node.parent', () => {
      assert.deepEqual(NavigationHelpers.findViewGroup(viewGroupInParentOfNodeParent), 'tets 1-1-1');
    });

    it('do not return viewGroup from parent at node.parent if domains do not match', () => {
      assert.equal(NavigationHelpers.findViewGroup(viewGroupInParentOfNodeParentDifferentUrl), undefined);
    });

    it('return undefined if viewGroup is not inside node', () => {
      assert.equal(NavigationHelpers.findViewGroup(noViewGroupInNode), undefined);
    });
  });

  describe('getSideNavAccordionMode', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigBooleanValue').returns(true);
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
    });

    it('sideNavAccordionMode defined on selectedNode', () => {
      let selectedNode = {
        pathSegement: 'mf1',
        sideNavAccordionMode: true
      };
      let sideNavAccordionMode = NavigationHelpers.getSideNavAccordionMode(selectedNode);
      sinon.assert.notCalled(LuigiConfig.getConfigBooleanValue);
      assert.equal(sideNavAccordionMode, true);
    });

    it('sideNavAccordionMode defined on parent', () => {
      let selectedNode = {
        pathSegement: 'mf1',
        parent: {
          sideNavAccordionMode: true
        }
      };
      let sideNavAccordionMode = NavigationHelpers.getSideNavAccordionMode(selectedNode);
      sinon.assert.notCalled(LuigiConfig.getConfigBooleanValue);
      assert.equal(sideNavAccordionMode, true);
    });

    it('sideNavAccordionMode defined by default', () => {
      let selectedNode = {
        pathSegement: 'mf1'
      };
      let sideNavAccordionMode = NavigationHelpers.getSideNavAccordionMode(selectedNode);
      sinon.assert.calledOnceWithExactly(LuigiConfig.getConfigBooleanValue, 'navigation.defaults.sideNavAccordionMode');
      assert.equal(sideNavAccordionMode, true);
    });
  });

  describe('getProductSwitcherConfig', () => {
    beforeEach(() => {
      sinon.stub(LuigiConfig, 'getConfigValue');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return product switcher config', () => {
      const mockedConfig = {
        icon: 'grid',
        label: 'Products',
        columns: 'auto',
        items: () => {
          return [{}, {}, {}];
        }
      };

      LuigiConfig.getConfigValue.returns(mockedConfig);

      const result = NavigationHelpers.getProductSwitcherConfig();

      assert.deepEqual(result, mockedConfig);
    });
  });

  describe('applyContext', () => {
    it('should return provided context when no additional data is present', () => {
      const mockedContext = { data: 'store' };
      const result = NavigationHelpers.applyContext(mockedContext, null, null);

      assert.deepEqual(result, mockedContext);
    });

    it('should return provided context when additional data is present', () => {
      const mockedContext = { data: 'store' };
      const mockedAddition = { foo: 'bar' };
      const result = NavigationHelpers.applyContext(mockedContext, mockedAddition, null);

      assert.deepEqual(result, { ...mockedContext, ...mockedAddition });
    });
  });

  describe('stripNode', () => {
    it('should return stripped node', () => {
      const mockedNode = { children: [], data: 'store', navHeader: {}, parent: {} };
      const result = NavigationHelpers.stripNode(mockedNode);

      assert.deepEqual(result, { data: 'store' });
    });
  });

  describe('getParentNode', () => {
    it('should return node parent when it is present', () => {
      const mockedNode = { children: [], data: 'store', navHeader: {}, parent: {} };
      const mockedPathData = [
        {
          navigationPath: [
            {
              pathSegment: 'groups',
              children: [
                {
                  pathSegment: 'stakeholders',
                  viewUrl: '/sampleapp.html#/projects/1/users/groups/stakeholders'
                },
                {
                  pathSegment: 'customers',
                  viewUrl: '/sampleapp.html#/projects/1/users/groups/customers'
                }
              ]
            }
          ],
          context: {}
        }
      ];
      const result = NavigationHelpers.getParentNode(mockedNode, mockedPathData);

      assert.deepEqual(result, {});
    });

    it('should return path data item when node parent is not present', () => {
      const mockedNode = { children: [], data: 'store', navHeader: {}, parent: null };
      const mockedPathData = [
        {
          navigationPath: [
            {
              pathSegment: 'groups',
              children: [
                {
                  pathSegment: 'stakeholders',
                  viewUrl: '/sampleapp.html#/projects/1/users/groups/stakeholders'
                },
                {
                  pathSegment: 'customers',
                  viewUrl: '/sampleapp.html#/projects/1/users/groups/customers'
                }
              ]
            }
          ],
          context: {}
        },
        mockedNode
      ];
      const result = NavigationHelpers.getParentNode(mockedNode, mockedPathData);

      assert.deepEqual(result, mockedPathData[0]);
    });
  });

  describe('getTestId', () => {
    it('should return node testId when it is present', () => {
      const mockedNode = { children: [], label: null, pathSegment: null, testId: 'ab_cd' };
      const result = NavigationHelpers.getTestId(mockedNode);

      assert.equal(result, 'ab_cd');
    });

    it('should return generated testId when it is not present in node', () => {
      const mockedNode = { children: [], label: 'cd', pathSegment: 'ab', testId: null };
      const result = NavigationHelpers.getTestId(mockedNode);

      assert.equal(result, 'ab_cd');
    });
  });

  describe('storeCollapsedSuperCategoriesState', () => {
    const COLLAPSED_SUPER_CATEGORIES_KEY = NavigationHelpers.COLLAPSED_SUPER_CATEGORIES_KEY;
    let getItemSpy, setItemSpy;

    beforeEach(() => {
      getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
      setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    describe('when key exists in the localStorage', () => {
      beforeEach(() => {
        getItemSpy.mockReturnValueOnce(JSON.stringify(['category1', 'category2']));
      });

      it('when value is false: should not update the list', () => {
        NavigationHelpers.storeCollapsedSuperCategoriesState('category2', false);
        expect(getItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY);
        expect(setItemSpy).toHaveBeenCalledWith(
          COLLAPSED_SUPER_CATEGORIES_KEY,
          JSON.stringify(['category1', 'category2'])
        );
      });

      it('when value is true: should: should remove key from the list ', () => {
        NavigationHelpers.storeCollapsedSuperCategoriesState('category2', true);
        expect(getItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY);
        expect(setItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY, JSON.stringify(['category1']));
      });
    });

    describe('when key does not exists in the localStorage', () => {
      beforeEach(() => {
        getItemSpy.mockReturnValueOnce(JSON.stringify([]));
      });

      it('when value is false: should add key to the list', () => {
        NavigationHelpers.storeCollapsedSuperCategoriesState('category2', false);
        expect(getItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY);
        expect(setItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY, JSON.stringify(['category2']));
      });

      it('when value is true: should not update the list', () => {
        NavigationHelpers.storeCollapsedSuperCategoriesState('category2', true);
        expect(getItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY);
        expect(setItemSpy).toHaveBeenCalledWith(COLLAPSED_SUPER_CATEGORIES_KEY, JSON.stringify([]));
      });
    });
  });

  describe('isCollapsedSuperCategory', () => {
    const COLLAPSED_KEY = 'luigi.preferences.navigation.collapsedSuperCategories';

    afterEach(() => {
      localStorage.removeItem(COLLAPSED_KEY);
    });

    it('when category key is present in the localStorage, should return true ', () => {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify(['category1', 'category2']));
      const result = NavigationHelpers.isCollapsedSuperCategory('category2');
      expect(result).toBe(true);
    });

    it('when category key is not in the localStorage, should return false ', () => {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify(['category1']));
      const result = NavigationHelpers.isCollapsedSuperCategory('category2');
      expect(result).toBe(false);
    });
  });
});
