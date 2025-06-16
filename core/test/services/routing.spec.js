import { Routing } from '../../src/services/routing';
import { GenericHelpers, RoutingHelpers } from '../../src/utilities/helpers';
import { LuigiConfig, LuigiI18N, LuigiNavigation } from '../../src/core-api';
import { Navigation } from '../../src/navigation/services/navigation';
import { NodeDataManagementStorage } from '../../src/services/node-data-management';
import { Iframe, ViewUrlDecorator } from '../../src/services';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Routing', function() {
  jest.retryTimes(2);

  let component;
  beforeEach(() => {
    const lastObj = {};
    component = {
      set: obj => {
        Object.assign(lastObj, obj);
      },
      get: () => lastObj,
      shouldShowUnsavedChangesModal: () => false
    };

    sinon.stub(LuigiConfig, 'getConfigValue');
    sinon.stub(GenericHelpers, 'getRandomId').returns('123');
    Navigation._rootNodeProviderUsed = undefined;
    Navigation.rootNode = undefined;

    sinon.stub(ViewUrlDecorator);
    ViewUrlDecorator.applyDecorators.callsFake(url => url);
  });
  afterEach(() => {
    if (document.createElement.restore) {
      document.createElement.restore();
    }
    sinon.restore();
    NodeDataManagementStorage.deleteCache();
    // sinon.reset();
  });

  describe('getNodePath()', () => {
    let node;
    let params;
    beforeEach(() => {
      node = {
        pathSegment: 'projects',
        label: 'AAA',
        viewUrl: '/aaa.html'
      };
      params = '~test=true&foo=bar';
    });

    it('should not fail if node is not defined', () => {
      node = undefined;
      const result = Routing.getNodePath(node, params);
      assert.equal(result, '');
    });

    it('should not fail if params are not defined', () => {
      params = undefined;
      const result = Routing.getNodePath(node, params);
      assert.equal(result, '/projects');
    });

    it('returns node path', () => {
      const result = Routing.getNodePath(node, params);
      assert.equal(result, '/projects?~test=true&foo=bar');
    });
  });

  describe('navigateTo', () => {
    let locationSpy;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      window.history.replaceState = sinon.spy();
      window.history.pushState = sinon.spy();
      window.dispatchEvent = sinon.spy();
      sinon.stub(Navigation, 'extractDataFromPath').returns({});
      sinon.stub(Navigation, 'shouldPreventNavigation').returns(false);
      sinon.stub(Routing, 'getWindowPath');
      sinon.stub(GenericHelpers, 'trimLeadingSlash').returnsArg(0);
      sinon.stub(GenericHelpers, 'isIE').returns(false);
    });
    afterEach(() => {
      locationSpy.mockRestore();
    });

    it('with path routing, does a browser history replace', async () => {
      // given
      const path = '/projects/teams';
      locationSpy.mockImplementation(() => {
        return {
          href: `http://some.url.de${path}`,
          pathname: path
        };
      });

      // when
      await Routing.navigateTo(path, { keepBrowserHistory: false });

      // then
      sinon.assert.calledWithExactly(window.history.replaceState, { path }, '', '/projects/teams');
      sinon.assert.notCalled(window.history.pushState);
    });

    it('should dispatch an event', async () => {
      // given
      LuigiConfig.getConfigValue.returns(false);

      // when
      await Routing.navigateTo('/projects');

      const eventDetail = { detail: { preventContextUpdate: false, withoutSync: false } };
      // then
      sinon.assert.calledWithExactly(window.dispatchEvent, new CustomEvent('popstate', eventDetail));
    });
  });

  describe('getIntentObject()', () => {
    beforeEach(() => {
      LuigiConfig.getConfigValue.restore();
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('navigation.intentMapping')
        .returns([
          {
            semanticObject: 'Sales',
            action: 'settings',
            pathSegment: '/projects/pr2/settings'
          }
        ]);
    });

    it('returns intentObject from provided intent link with params', () => {
      const actual = RoutingHelpers.getIntentObject('#?intent=Sales-settings?param1=luigi&param2=mario');
      const expected = {
        semanticObject: 'Sales',
        action: 'settings',
        params: { param1: 'luigi', param2: 'mario' }
      };
      assert.deepEqual(actual, expected);
    });

    it('returns intentObject from provided intent link without params', () => {
      const actual = RoutingHelpers.getIntentObject('#?intent=Sales-settings');
      const expected = {
        semanticObject: 'Sales',
        action: 'settings',
        params: {}
      };
      assert.deepEqual(actual, expected);
    });
  });

  describe('getIntentPath()', () => {
    beforeEach(() => {
      LuigiConfig.getConfigValue.restore();
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('navigation.intentMapping')
        .returns([
          {
            semanticObject: 'Sales',
            action: 'settings',
            pathSegment: '/projects/pr2/settings'
          },
          {
            semanticObject: 'External',
            action: 'view',
            externalLink: { url: 'https://www.sap.com', openInNewTab: true }
          },
          {
            semanticObject: 'External',
            action: 'view2',
            externalLink: { url: 'https://www.sap.com', openInNewTab: false }
          }
        ]);
    });

    it('checks intent path parsing with illegal characters', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=Sa#les-sett!@ings?param1=luigi&param2=mario');
      assert.isNotOk(actual);
    });

    it('checks intent path parsing with illegal hyphen character', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=Sa-les-sett-ings?param1=luigi&param2=mario');
      assert.isNotOk(actual);
    });

    it('returns path from provided intent link without params', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=Sales-settings');
      const expected = '/projects/pr2/settings';
      assert.equal(actual, expected);
    });

    it('returns path from provided intent link with params', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=Sales-settings?param1=hello&param2=world');
      const expected = '/projects/pr2/settings?~param1=hello&~param2=world';
      assert.equal(actual, expected);
    });

    it('returns path from intent link with params and case insensitive start pattern ', () => {
      const actual = RoutingHelpers.getIntentPath('#?iNteNT=Sales-settings?param1=hello&param2=world');
      const expected = '/projects/pr2/settings?~param1=hello&~param2=world';
      assert.equal(actual, expected);
    });

    it('returns expected object for external intent links with openInNewTab true', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=External-view');
      const expected = {
        url: 'https://www.sap.com',
        openInNewTab: true,
        external: true
      };
      assert.deepEqual(actual, expected);
    });

    it('returns expected object for external intent links with openInNewTab false', () => {
      const actual = RoutingHelpers.getIntentPath('#?intent=External-view2');
      const expected = {
        url: 'https://www.sap.com',
        openInNewTab: false,
        external: true
      };
      assert.deepEqual(actual, expected);
    });
  });

  describe('resolveDynamicIntentPath()', () => {
    it('returns resolved dynamic path with single dynamic parameter', () => {
      const path = '/projects/:id/details';
      const parameters = { id: 123 };
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/123/details';
      assert.equal(actual, expected);
    });

    it('returns resolved dynamic path with multiple dynamic parameter', () => {
      const path = '/projects/:id/details/:componentId/view/:viewId/show';
      const parameters = { id: 123, componentId: 444, viewId: '223' };
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/123/details/444/view/223/show';
      assert.equal(actual, expected);
    });

    it('returns resolved dynamic path with similiar named parameters', () => {
      const path = '/projects/:component/details/:componentId/view/:componentCount/show';
      const parameters = { component: 123 };
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      // check edge case when parameter names stat with same substring
      const expected = '/projects/123/details/:componentId/view/:componentCount/show';
      assert.equal(actual, expected);
    });

    it('input path not changed when there are no parameters defined', () => {
      const path = '/projects/:component/details/:componentId/view/:componentCount/show';
      const parameters = undefined;
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/:component/details/:componentId/view/:componentCount/show';
      assert.equal(actual, expected);
    });

    it('input path not changed when no paramters match dynamic specification', () => {
      const path = '/projects/:component/details/:componentId/view/:componentCount/show';
      const parameters = { other: 123, param: 343, not: '231', related: 'to dynamic ones' };
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/:component/details/:componentId/view/:componentCount/show';
      assert.equal(actual, expected);
    });

    it('returns resolved parameters when there is extra parameters given', () => {
      const path = '/projects/:other/details/:param/view/:not';
      const parameters = { other: 123, param: 343, not: '231', related: 'to dynamic ones', sample: 'test' };
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/123/details/343/view/231';
      assert.equal(actual, expected);
    });

    it('input path not changed when array has an empty object', () => {
      const path = '/projects/:other/details/:param/view/:not';
      const parameters = {};
      const actual = RoutingHelpers.resolveDynamicIntentPath(path, parameters);
      const expected = '/projects/:other/details/:param/view/:not';
      assert.equal(actual, expected);
    });
  });

  describe('getHashPath()', () => {
    beforeEach(() => {
      LuigiConfig.getConfigValue.restore();
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('navigation.intentMapping')
        .returns([
          {
            semanticObject: 'Sales',
            action: 'settings',
            pathSegment: '/projects/pr2/settings'
          }
        ]);
    });
    it('returns hash path from default param', () => {
      sinon.stub(window, 'location').value({ hash: '#/projects/pr3' });
      const actual = Routing.getHashPath();
      const expected = 'projects/pr3';
      assert.equal(actual, expected);
    });

    it('returns hash path from provided input param', () => {
      const actual = Routing.getHashPath('my-url#/projects/pr3');
      const expected = 'projects/pr3';
      assert.equal(actual, expected);
    });

    it('returns path from provided intent link with params', () => {
      const actual = Routing.getHashPath('#?intent=Sales-settings?param1=luigi&param2=mario');
      const expected = '/projects/pr2/settings?~param1=luigi&~param2=mario';
      assert.equal(actual, expected);
    });

    it('returns path from provided intent link without params', () => {
      const actual = Routing.getHashPath('#?intent=Sales-settings');
      const expected = '/projects/pr2/settings';
      assert.equal(actual, expected);
    });

    it('returns path from provided intent link with case insensitive starting pattern', () => {
      const actual = Routing.getHashPath('#?iNteNT=Sales-settings');
      const expected = '/projects/pr2/settings';
      assert.equal(actual, expected);
    });
  });

  describe('buildFromRelativePath', () => {
    const nodeWithParent = {
      link: 'child-node',
      parent: {
        pathSegment: 'parent-node'
      }
    };

    const nodeWithLink = {
      link: '../..'
    };

    it('should return proper route', () => {
      // given
      const expectedRoute = '/parent-node/child-node';
      LuigiConfig.getConfigValue.returns(true);

      // when
      sinon.stub(window, 'location').value({ hash: '/parent-node' });
      const route = Routing.buildFromRelativePath(nodeWithParent);

      // then
      assert.equal(route, expectedRoute);
    });

    it('should return proper normalized route from link ', () => {
      // given
      const expectedRoute = '/parent-node/';
      LuigiConfig.getConfigValue.returns(true);

      // when
      sinon.stub(window, 'location').value({ hash: '/parent-node/a/b' });
      const route = Routing.buildFromRelativePath(nodeWithLink);

      // then
      assert.equal(route, expectedRoute);
    });

    it("should return proper route even if it's relative to a different node in the tree than the current one", () => {
      // given
      const expectedRoute = '/parent-node/child-node';
      LuigiConfig.getConfigValue.returns(true);

      // when
      sinon.stub(window, 'location').value({ hash: '/parent-node/different-node' });
      const route = Routing.buildFromRelativePath(nodeWithParent);

      // then
      assert.equal(route, expectedRoute);
    });
  });

  describe('navigateWebComponent', () => {
    let c = {};
    const wc_id = 'wc-id';
    let node = {};
    let wc = {};
    let componentCtx = {};

    afterEach(() => {
      sinon.restore();
    });
    beforeEach(() => {
      node = {
        pathSegement: 'luigiwc',
        label: 'Luigi WC',
        viewUrl: '/luigiwc.js',
        context: { luigi: 'rocks' }
      };
      wc = { _luigi_node: node, context: {} };
      c = {
        get: () => {
          return { context: componentCtx };
        }
      };
    });

    it('navigateWebComponent only context update', () => {
      const documentstub = sinon.stub(document, 'querySelector');
      sinon.stub(Routing, 'removeLastChildFromWCContainer');
      documentstub.withArgs(wc_id).returns(wc);
      documentstub
        .callThrough()
        .withArgs('.wcContainer')
        .callsFake(() => {
          return {
            _luigi_node: node
          };
        });
      sinon.stub(Routing, 'getGeneratedWCId').callsFake(() => {
        return 'wc-id';
      });

      //context update
      componentCtx = { luigi: 'rocks 2x' };
      Routing.navigateWebComponent(c, node);
      assert.deepEqual(wc.context, { luigi: 'rocks 2x' });
      sinon.assert.notCalled(Routing.removeLastChildFromWCContainer);
    });

    it('navigateWebComponent rerender', () => {
      const documentstub = sinon.stub(document, 'querySelector');
      sinon.stub(Routing, 'removeLastChildFromWCContainer');
      documentstub
        .callThrough()
        .withArgs('.wcContainer')
        .callsFake(() => {
          return {
            _luigi_node: node
          };
        });
      sinon.stub(Routing, 'getGeneratedWCId').callsFake(() => {
        return 'wc-id';
      });

      let node2 = {
        pathSegement: 'luigiwc',
        label: 'Luigi WC',
        viewUrl: '/luigiwc.js',
        context: { luigi: 'rocks' }
      };
      Routing.navigateWebComponent(component, node2);
      sinon.assert.called(Routing.removeLastChildFromWCContainer);
    });
  });

  describe('handleRouteChange', () => {
    let currentLuigiConfig = {};
    let config;

    beforeEach(() => {
      global['sessionStorage'] = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
      sinon.stub(Iframe, 'setOkResponseHandler');
      const sampleLuigiConfig = {
        navigation: {
          nodes: () => [
            {
              pathSegment: 'projects',
              label: 'AAA',
              viewUrl: '/aaa.html',
              children: [
                {
                  pathSegment: 'a1',
                  context: {
                    varA1: 'maskopatol'
                  },
                  style: {
                    display: null
                  },
                  viewUrl: '/{context.varA1}/a1.html#p={nodeParams.param1}'
                },
                {
                  pathSegment: 'a2',
                  style: {
                    display: null
                  },
                  viewUrl: '{context.varA2}/a2.html#p={nodeParams.param2}'
                },
                {
                  pathSegment: 'teams',
                  defaultChildNode: 't2',
                  children: [
                    {
                      pathSegment: 't1',
                      style: {
                        display: null
                      },
                      viewUrl: '/t1.html'
                    },
                    {
                      pathSegment: 't2',
                      style: {
                        display: null
                      },
                      viewUrl: '/t2.html'
                    }
                  ],
                  style: {}
                },
                {
                  pathSegment: 'categories',
                  children: [
                    {
                      pathSegment: ':category',
                      viewUrl: '/cats/:category#details',
                      children: [
                        {
                          pathSegment: ':sub',
                          viewUrl: '/cats/:category/:sub',
                          style: {}
                        }
                      ]
                    }
                  ],
                  style: {}
                }
              ],
              removeChild: sinon.spy(),
              context: {
                varA: 'tets'
              },
              loadingIndicator: {},
              hideSideNav: true,
              prepend: sinon.spy(),
              insertBefore: sinon.spy()
            },
            {
              pathSegment: 'compound',
              label: 'BBB',
              viewUrl: ''
            },
            {
              pathSegment: 'compound2',
              label: 'BBB',
              viewUrl: ''
            },
            {
              pathSegment: 'compound3',
              label: 'BBB',
              viewUrl: '',
              compound: true
            },
            {
              pathSegment: 'compound-webcomponent',
              label: 'BBB',
              viewUrl: 'compound',
              intendToHaveEmptyViewUrl: true,
              webcomponent: true
            },
            {
              pathSegment: 'tabNav',
              label: 'Tab Nav',
              tabNav: { hideTabNavAutomatically: true },
              children: [
                {
                  pathSegment: 'child',
                  label: 'Child',
                  viewUrl: 'child.html'
                }
              ]
            }
          ]
        },
        settings: {
          hideNavigation: false
        }
      };
      window.Luigi = { config: currentLuigiConfig };
      currentLuigiConfig = Object.assign({}, sampleLuigiConfig);
      LuigiConfig.config = currentLuigiConfig;
      config = {
        iframe: null,
        builderCompatibilityMode: false,
        navigateOk: null
      };
      sinon.stub(Routing, 'navigateTo');
      sinon.stub(GenericHelpers, 'isElementVisible').callsFake(element => element);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should set component data with hash path', async () => {
      // given
      const path = '#/projects';
      const expectedViewUrl = '/aaa.html';

      // when
      sinon.stub(document, 'createElement').callsFake(() => ({ src: null }));
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().hideNav, LuigiConfig.config.settings.hideNavigation);
      assert.equal(component.get().showLoadingIndicator, true);
    });

    it('should set component data with hash path using disabled loadingIndicator', async () => {
      // given
      const path = '#/projects';
      const expectedViewUrl = '/aaa.html';

      // adjust some properties for this test
      const allNodes = currentLuigiConfig.navigation.nodes();
      allNodes[0].loadingIndicator = {
        enabled: false
      };
      currentLuigiConfig.navigation.nodes = () => allNodes;

      // when
      sinon.stub(document, 'createElement').callsFake(() => ({ src: null }));
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().showLoadingIndicator, false);
    });

    it('should set component data without hash path', async () => {
      // given
      const path = '#/projects';
      const expectedViewUrl = '/aaa.html';

      let savedObj = {};
      const componentSaved = {
        set: obj => {
          savedObj = GenericHelpers.deepMerge(savedObj, obj);
          componentSaved.get = () => {
            return savedObj;
          };
        },
        shouldShowUnsavedChangesModal: () => false
      };

      const preservedViews = [
        {
          path: 'sample.html#!/one',
          nextPath: 'sample.html#!/two',
          context: {}
        }
      ];
      componentSaved.set({ preservedViews });

      // when
      const docMock = sinon.mock(document);
      docMock
        .expects('createElement')
        .returns({ src: null })
        .once();

      await Routing.handleRouteChange(path, componentSaved, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(componentSaved.get().viewUrl, expectedViewUrl);
      assert.equal(componentSaved.get().hideNav, LuigiConfig.config.settings.hideNavigation);

      assert.equal(componentSaved.get().preservedViews.length, 1);
      docMock.restore();
      docMock.verify();
    });

    it('should set component data with hash path and node params', async () => {
      // given
      const path = '#/projects/a1?~param1=tets';
      const expectedViewUrl = '/{context.varA1}/a1.html#p={nodeParams.param1}';
      const expectedProcessedViewUrl = '/maskopatol/a1.html#p=tets';

      // when
      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(iframeMock.src, expectedProcessedViewUrl);
      assert.equal(component.get().hideNav, LuigiConfig.config.settings.hideNavigation);
    });

    it('should set component data with hash path and clear unused context/node params', async () => {
      // given
      const path = '#/projects/a2?~param1=tets';
      const expectedViewUrl = '{context.varA2}/a2.html#p={nodeParams.param2}';
      const expectedProcessedViewUrl = '/a2.html#p=';

      // when
      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(iframeMock.src, expectedProcessedViewUrl);
      assert.equal(component.get().hideNav, LuigiConfig.config.settings.hideNavigation);
    });

    it('should set component data with path param', async () => {
      // given
      const path = '#/projects/categories/cat1';
      const expectedViewUrl = '/cats/cat1#details';

      // when
      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(iframeMock.src, expectedViewUrl);
      assert.equal(component.get().hideNav, window.Luigi.config.settings.hideNavigation);
    });

    it('should set component data with multiple path params', async () => {
      // given
      const path = '#/projects/categories/cat1/sub23';
      const expectedViewUrl = '/cats/cat1/sub23';

      // when
      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(iframeMock.src, expectedViewUrl);
      assert.equal(component.get().hideNav, window.Luigi.config.settings.hideNavigation);
    });

    it('should get DefaultChildNode if viewUrl is not defined', async () => {
      // given
      const path = '#/projects/teams';
      const expectedPath = '/projects/teams/t2';
      component.shouldShowUnsavedChangesModal = () => false;
      const node = {};

      // when
      LuigiConfig.config.navigation.hideNav = false;
      await Routing.handleRouteChange(path, component, node, config);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedPath, { keepBrowserHistory: false });
    });

    it("should set component's 'hideSideNav' property ", async () => {
      // given
      const path = '#/projects';
      // when
      const node = { insertBefore: sinon.spy(), children: [] };
      sinon.stub(document, 'querySelectorAll').callsFake(() => node);

      // then
      assert.equal(component.get().hideSideNav, undefined);

      await Routing.handleRouteChange(path, component, node, config);

      assert.equal(component.get().hideSideNav, true);
    });

    it('should call console.warn when node has no children and there is no intention for empty viewUrl', async () => {
      // given
      const path = 'compound';
      const node = { compound: { renderer: () => {} } };

      // when
      console.warn = sinon.spy();
      component.showAlert = sinon.spy();
      component.shouldShowUnsavedChangesModal = sinon.spy();

      await Routing.handleRouteChange(path, component, node, config).catch(error => {
        console.log(error);
      });

      // then
      sinon.assert.calledOnce(console.warn);
    });

    it('should navigate to rootPath if node can be reached directly', async () => {
      // given
      const path = 'compound2';
      const node = { compound: { renderer: () => {} } };

      // when
      component.viewUrl = path;
      component.showAlert = sinon.spy();
      component.shouldShowUnsavedChangesModal = sinon.spy();

      await Routing.handleRouteChange(path, component, node, config).catch(error => {
        console.log(error);
      });

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, 'projects');
    });

    it('should handle nodeObject that is compound', async () => {
      // given
      const path = 'compound3';
      const node = { compound: { renderer: () => {} } };

      // when
      component.viewUrl = path;
      component.showAlert = sinon.spy();
      component.shouldShowUnsavedChangesModal = sinon.spy();

      const element = document.createElement('div');
      sinon.stub(document, 'getElementsByClassName').returns([element]);
      sinon.stub(GenericHelpers, 'requestExperimentalFeature').returns(true);
      Iframe.switchActiveIframe = sinon.spy();
      Routing.navigateWebComponentCompound = sinon.spy();

      await Routing.handleRouteChange(path, component, node, config).catch(error => {
        console.log(error);
      });

      // then
      assert.equal(element.classList.contains('lui-webComponent'), true);
      sinon.assert.calledOnce(Iframe.switchActiveIframe);
      sinon.assert.calledOnce(Routing.navigateWebComponentCompound);
    });

    it('should handle nodeObject that is webcomponent', async () => {
      // given
      const path = 'compound-webcomponent';
      const node = { compound: { renderer: () => {} } };

      // when
      component.viewUrl = path;
      component.showAlert = sinon.spy();
      component.shouldShowUnsavedChangesModal = sinon.spy();

      const element = document.createElement('div');
      sinon.stub(document, 'getElementsByClassName').returns([element]);
      sinon.stub(GenericHelpers, 'requestExperimentalFeature').returns(true);
      Iframe.switchActiveIframe = sinon.spy();
      Routing.navigateWebComponent = sinon.spy();

      await Routing.handleRouteChange(path, component, node, config).catch(error => {
        console.log(error);
      });

      // then
      assert.equal(element.classList.contains('lui-webComponent'), true);
      sinon.assert.calledOnce(Iframe.switchActiveIframe);
      sinon.assert.calledOnce(Routing.navigateWebComponent);
    });

    it('should call navigateToExternalLink if intent external link defined', async () => {
      // given
      const path = {
        external: true,
        url: 'https://www.test.com',
        openInNewTab: true
      };
      const expectedParam = {
        url: 'https://www.test.com',
        sameWindow: false
      };

      sinon.stub(Routing, 'navigateToExternalLink');

      // when
      await Routing.handleRouteChange(path);

      // then
      sinon.assert.calledWithExactly(Routing.navigateToExternalLink, expectedParam);
    });

    it('hide tabnav automatically', async () => {
      // given
      const path = '#/tabNav/child';
      const expectedViewUrl = 'child.html';

      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().tabNav, false);
    });

    it('hide tabnav automatically with more than one child', async () => {
      // given
      const path = '#/tabNav/child';
      const expectedViewUrl = 'child.html';

      const allNodes = currentLuigiConfig.navigation.nodes();
      allNodes[5].children.push({
        pathSegment: 'child2',
        label: 'child 2',
        viewUrl: 'child2.html'
      });
      currentLuigiConfig.navigation.nodes = () => allNodes;

      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().tabNav, true);
    });

    it('hide tabnav not automatically', async () => {
      // given
      const path = '#/tabNav/child';
      const expectedViewUrl = 'child.html';
      const allNodes = currentLuigiConfig.navigation.nodes();
      allNodes[5].tabNav = {
        hideTabNavAutomatically: false
      };
      currentLuigiConfig.navigation.nodes = () => allNodes;

      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().tabNav, true);
    });

    it('hide tabnav automatically wrong configured', async () => {
      // given
      const path = '#/tabNav/child';
      const expectedViewUrl = 'child.html';
      const allNodes = currentLuigiConfig.navigation.nodes();
      allNodes[5].tabNav = {};
      currentLuigiConfig.navigation.nodes = () => allNodes;

      const iframeMock = { src: null };
      sinon.stub(document, 'createElement').callsFake(() => iframeMock);
      await Routing.handleRouteChange(path, component, currentLuigiConfig.navigation.nodes()[0], config);

      // then
      assert.equal(component.get().viewUrl, expectedViewUrl);
      assert.equal(component.get().tabNav, false);
    });
  });

  describe('handleRouteClick', () => {
    const nodeWithParent = {
      pathSegment: 'project-one',
      parent: {
        pathSegment: 'projects'
      }
    };
    const nodeWithoutParent = {
      pathSegment: 'projects'
    };

    beforeEach(() => {
      sinon.stub(Navigation, 'extractDataFromPath').returns({});
      sinon.stub(Navigation, 'shouldPreventNavigation').returns(false);
      sinon.stub(Routing, 'navigateTo');
    });

    it('node with parent, navigation to proper route', () => {
      // given
      const expectedRoute = '/projects/project-one';
      LuigiConfig.getConfigValue.returns(true);

      // when
      Routing.handleRouteClick(nodeWithParent, component);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedRoute);
    });

    it('node without parent, navigation to proper route', () => {
      // given
      const expectedRoute = '/projects';
      LuigiConfig.getConfigValue.returns(true);

      // when
      Routing.handleRouteClick(nodeWithoutParent, component);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedRoute);
    });

    it('should consume link with absolute path', () => {
      // given
      const expectedRoute = '/projects';
      const inputNode = {
        link: '/projects'
      };

      // when
      Routing.handleRouteClick(inputNode, component);

      // then
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedRoute);
    });

    it('should consume link with relative path', () => {
      // given
      const expectedRoute = 'path-built-from-relative';
      const inputNode = {
        link: 'projects'
      };
      sinon.stub(Routing, 'buildFromRelativePath').returns(expectedRoute);

      // when
      Routing.handleRouteClick(inputNode, component);

      // then
      sinon.assert.calledOnce(Routing.buildFromRelativePath);
      sinon.assert.calledWithExactly(Routing.navigateTo, expectedRoute);
    });
  });

  describe('getModifiedPathname()', () => {
    beforeEach(() => {
      LuigiConfig.getConfigValue.restore();
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('navigation.intentMapping')
        .returns([
          {
            semanticObject: 'Sales',
            action: 'settings',
            pathSegment: '/projects/pr2/settings'
          }
        ]);
    });

    it('without state, falls back to location', () => {
      const mockPathName = 'projects';
      sinon.stub(window.history, 'state').returns(null);
      sinon.stub(window, 'location').value({
        pathname: '/' + mockPathName
      });
      assert.equal(Routing.getModifiedPathname(), mockPathName);
    });

    it('without state and with query params', () => {
      const mockPathName = 'projects?~test=param';
      sinon.stub(window.history, 'state').returns(null);
      sinon.stub(window, 'location').value({
        pathname: '/projects',
        search: '?~test=param'
      });
      assert.equal(Routing.getModifiedPathname(), mockPathName);
    });

    it('with state path', () => {
      sinon.stub(window.history, 'state').value({
        path: '/this/is/some/'
      });
      assert.equal(Routing.getModifiedPathname(), 'this/is/some/');
    });

    it('from intent based link with params', () => {
      sinon.stub(window, 'location').value({ hash: '#?intent=Sales-settings?param1=luigi&param2=mario' });
      assert.equal(Routing.getModifiedPathname(), '/projects/pr2/settings?~param1=luigi&~param2=mario');
    });

    it('from intent based link without params', () => {
      sinon.stub(window, 'location').value({ hash: '#?intent=Sales-settings' });
      assert.equal(Routing.getModifiedPathname(), '/projects/pr2/settings');
    });

    it('from intent based link with case insensitive pattern', () => {
      sinon.stub(window, 'location').value({ hash: '#?inTeNT=Sales-settings' });
      assert.equal(Routing.getModifiedPathname(), '/projects/pr2/settings');
    });

    it('from faulty intent based link', () => {
      sinon.stub(window, 'location').value({ hash: '#?intent=Sales-sett-ings' });
      assert.equal(Routing.getModifiedPathname(), '/');
    });

    it('from intent based link with illegal characters', () => {
      sinon.stub(window, 'location').value({ hash: '#?intent=Sales-sett$ings' });
      assert.equal(Routing.getModifiedPathname(), '/');
    });
  });

  describe('navigateToLink()', () => {
    beforeEach(() => {
      sinon.stub(Routing, 'navigateToExternalLink');
      sinon.stub(Routing, 'navigateTo');
    });

    it('calls proper function if item is an external link with url', () => {
      const url = 'https://github.com/luigi-project/luigi';
      Routing.navigateToLink({ externalLink: { url } });
      sinon.assert.calledOnce(Routing.navigateToExternalLink);
      sinon.assert.calledWithExactly(Routing.navigateToExternalLink, { url });
      sinon.assert.notCalled(Routing.navigateTo);
    });

    it('calls proper function if item is NOT an external link with url', () => {
      const link = 'https://my-app/projects';
      Routing.navigateToLink({ link });
      sinon.assert.notCalled(Routing.navigateToExternalLink);
      sinon.assert.calledOnce(Routing.navigateTo);
      sinon.assert.calledWithExactly(Routing.navigateTo, link);
    });
  });

  describe('navigateToExternalLink()', () => {
    beforeEach(() => {
      global['sessionStorage'] = {
        getItem: sinon.stub(),
        setItem: sinon.stub()
      };
    });
    it('open external link in same tab - full params', () => {
      const externalLink = { url: 'http://localhost', sameWindow: true };
      const node = { context: { someValue: 'bar' }, externalLink };
      const pathParams = { otherParam: 'foo' };
      const url = 'test';
      sinon.stub(window, 'focus');
      sinon.stub(window, 'open').returns(window);
      Routing.navigateToExternalLink(url, node, pathParams);
      sinon.assert.calledOnce(window.open);
      sinon.assert.calledWithExactly(window.open, 'http://localhost', '_self');
      sinon.assert.calledOnce(window.focus);
    });

    it('open external link in same tab  - one param only object', () => {
      const externalLink = { url: 'http://localhost', sameWindow: true };
      sinon.stub(window, 'focus');
      sinon.stub(window, 'open').returns(window);
      Routing.navigateToExternalLink(externalLink);
      sinon.assert.calledOnce(window.open);
      sinon.assert.calledWithExactly(window.open, 'http://localhost', '_self');
      sinon.assert.calledOnce(window.focus);
    });

    it('open external link in same tab  - one param only object', () => {
      const externalLink = { url: 'http://localhost', sameWindow: false };
      sinon.stub(window, 'focus');
      sinon.stub(window, 'open').returns(window);
      Routing.navigateToExternalLink(externalLink);
      sinon.assert.calledOnce(window.open);
      sinon.assert.calledWithExactly(window.open, 'http://localhost', '_blank');
      sinon.assert.calledOnce(window.focus);
    });
  });

  describe('showPageNotFoundError()', () => {
    const component = {
      showAlert: () => {}
    };
    const pathToRedirect = '/go/here';
    const pathToRedirect2 = '/go/there';
    const notFoundPath = '/this/does/not/exist';
    beforeEach(() => {
      sinon.stub(Routing, 'navigateTo');
      sinon.stub(RoutingHelpers, 'showRouteNotFoundAlert');
      sinon.stub(LuigiI18N, 'getTranslation');
      sinon.stub(component, 'showAlert');
      sinon.stub(Routing, 'handleRouteChange');
    });

    it('navigate to redirect path', async () => {
      LuigiConfig.getConfigValue.returns(null);

      await Routing.showPageNotFoundError(component, pathToRedirect, notFoundPath);

      sinon.assert.calledWithExactly(Routing.navigateTo, pathToRedirect);
    });

    it('navigate to path specified by custom handler', () => {
      const custom = {
        handler: () => {
          return {
            redirectTo: pathToRedirect2
          };
        }
      };
      LuigiConfig.getConfigValue.returns(custom.handler);

      Routing.showPageNotFoundError(component, pathToRedirect, notFoundPath);

      sinon.assert.calledWithExactly(Routing.navigateTo, pathToRedirect2);
    });
    it('do nothing if ignoreLuigiErrorHandling is implmented by the custom handler', () => {
      const custom = {
        handler: () => {
          return {
            ignoreLuigiErrorHandling: true
          };
        }
      };
      LuigiConfig.getConfigValue.returns(custom.handler);
      Routing.showPageNotFoundError(component, pathToRedirect, notFoundPath);
      sinon.assert.notCalled(Routing.handleRouteChange);
      sinon.assert.notCalled(Routing.navigateTo);
      sinon.assert.notCalled(RoutingHelpers.showRouteNotFoundAlert);
    });
  });
  describe('dynamicNode', () => {
    const nodeData = {
      pathParam: {
        dynNode1: 'dyn1'
      }
    };
    const node = {
      pathSegment: ':dynNode1'
    };
    it('check if it is dynamic Node', () => {
      const isDynamic = RoutingHelpers.isDynamicNode(node);
      assert.isTrue(isDynamic);
    });
    it('check if it is dynamic Node', () => {
      const pathParamValue = RoutingHelpers.getDynamicNodeValue(node, nodeData.pathParam);
      assert.equal(pathParamValue, 'dyn1');
    });
  });

  describe('handleBookmarkableModalPath', () => {
    // given
    const modalPath = encodeURIComponent('/project-modal');
    const modalParams = { hello: 'world' };

    beforeEach(() => {
      sinon.stub(RoutingHelpers, 'getModalPathFromPath').returns(modalPath);
      sinon.stub(RoutingHelpers, 'getModalParamsFromPath').returns(modalParams);
      sinon.stub(Navigation, 'extractDataFromPath').returns({ nodeObject: {} });
      sinon.stub(LuigiNavigation, 'openAsModal');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('with modalParams (from url or withParams())', async () => {
      // when
      try {
        await Routing.handleBookmarkableModalPath();
      } catch (error) {
        // console.log('err', error);
      }

      // then
      sinon.assert.calledWith(Navigation.extractDataFromPath, modalPath);
      sinon.assert.calledOnce(LuigiNavigation.openAsModal);
      sinon.assert.calledWithExactly(LuigiNavigation.openAsModal, modalPath, modalParams);
    });
    it('with node setting openNodeInModal', async () => {
      const mockNodeModalSettings = {
        openNodeInModal: { title: 'My Modal' }
      };
      Navigation.extractDataFromPath.returns({
        nodeObject: mockNodeModalSettings
      });

      // when
      try {
        await Routing.handleBookmarkableModalPath();
      } catch (error) {
        // console.log('err', error);
      }

      // then
      sinon.assert.calledWith(Navigation.extractDataFromPath, modalPath);
      sinon.assert.calledOnce(LuigiNavigation.openAsModal);
      sinon.assert.calledWithExactly(LuigiNavigation.openAsModal, modalPath, modalParams);
    });
  });
  describe('append and remove modal data from URL using path routing', () => {
    const sb = sinon.createSandbox();
    let modalPath = encodeURIComponent('/project-modal');
    const modalParams = { hello: 'world' };
    const params = {
      '~luigi': 'mario'
    };
    const modalParamName = 'mySpecialModal';
    let locationSpy;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      history.replaceState = sinon.spy();
      history.pushState = sinon.spy();
      sinon.stub(RoutingHelpers, 'getModalPathFromPath').returns(modalPath);
      sinon.stub(RoutingHelpers, 'getHashQueryParamSeparator').returns('?');
      sinon.stub(RoutingHelpers, 'getModalParamsFromPath').returns(modalParams);
      sinon.stub(RoutingHelpers, 'getModalViewParamName').returns(modalParamName);

      sinon.stub(Navigation, 'extractDataFromPath').returns({ nodeObject: {} });

      sinon.stub(LuigiNavigation, 'openAsModal');
    });

    afterEach(() => {
      sinon.restore();
      locationSpy.mockRestore();
    });

    it('append modal data to url with path routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        };
      });
      window.state = {};
      const mockURL = new URL(global.location.href);
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(false);
      let historyState = {
        modalHistoryLength: 1,
        historygap: 1,
        pathBeforeHistory: '/settings'
      };

      sinon.stub(RoutingHelpers, 'handleHistoryState').returns(historyState);
      try {
        Routing.appendModalDataToUrl(modalPath, modalParams);
      } catch (error) {
        console.log('error', error);
      }
      // then
      sinon.assert.calledWith(
        history.pushState,
        historyState,
        '',
        'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
      );
    });

    it('remove modal data from url with path routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href:
            'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D',
          search: '?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
        };
      });
      window.state = {};
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(false);
      try {
        Routing.removeModalDataFromUrl();
      } catch (error) {
        console.log('error', error);
      }
      sinon.assert.calledWithExactly(window.history.pushState, {}, '', 'http://some.url.de/settings?~luigi=mario');
    });

    it('should update path of the modal when changing template in the modal, save history', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        };
      });
      window.state = {};
      const addHistoryEntry = true;
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(false);
      try {
        modalPath = encodeURIComponent('/modalPath');
        Routing.updateModalDataInUrl(modalPath, modalParams, addHistoryEntry);
      } catch (error) {
        console.log('error', error);
      }
      // then
      sinon.assert.calledWith(
        history.pushState,
        window.state,
        '',
        'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252FmodalPath&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
      );
    });

    it('should update path of the modal when changing template in the modal, do not save history', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        };
      });
      window.state = {};
      const addHistoryEntry = false;
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(false);
      try {
        modalPath = encodeURIComponent('/project-modal');
        Routing.updateModalDataInUrl(modalPath, modalParams, addHistoryEntry);
      } catch (error) {
        console.log('error', error);
      }
      // then
      sinon.assert.calledWith(
        history.replaceState,
        window.state,
        '',
        'http://some.url.de/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
      );
    });
  });

  describe('append and remove modal data from URL using hash routing', () => {
    const modalPath = encodeURIComponent('/project-modal');
    const modalParams = { hello: 'world' };
    const params = {
      '~luigi': 'mario'
    };
    const modalParamName = 'mySpecialModal';
    let locationSpy;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
      history.replaceState = sinon.spy();
      history.pushState = sinon.spy();
      sinon.stub(RoutingHelpers, 'getModalPathFromPath').returns(modalPath);
      sinon.stub(RoutingHelpers, 'getHashQueryParamSeparator').returns('?');
      sinon.stub(RoutingHelpers, 'getModalParamsFromPath').returns(modalParams);
      sinon.stub(RoutingHelpers, 'getModalViewParamName').returns(modalParamName);

      sinon.stub(Navigation, 'extractDataFromPath').returns({ nodeObject: {} });

      sinon.stub(LuigiNavigation, 'openAsModal');
    });

    afterEach(() => {
      sinon.restore();
      locationSpy.mockRestore();
    });

    it('append modal data to url with hash routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/#/settings',
          hash: '#/settings'
        };
      });
      const mockURL = new URL(global.location.href);
      window.state = {};
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(true);
      let historyState = {
        modalHistoryLength: 1,
        historygap: 1,
        pathBeforeHistory: '/settings'
      };
      sinon.stub(RoutingHelpers, 'handleHistoryState').returns(historyState);
      try {
        Routing.appendModalDataToUrl(modalPath, modalParams);
      } catch (error) {
        console.log('error', error);
      }
      // then
      sinon.assert.calledWith(
        history.pushState,
        historyState,
        '',
        'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
      );
    });

    it('remove modal data from url with hash routing', () => {
      sinon.stub(RoutingHelpers, 'getQueryParams').returns(params);
      locationSpy.mockImplementation(() => {
        return {
          href:
            'http://some.url.de/#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D',
          hash:
            '#/settings?~luigi=mario&mySpecialModal=%252Fproject-modal&mySpecialModalParams=%7B%22hello%22%3A%22world%22%7D'
        };
      });
      window.state = {};
      sinon
        .stub(LuigiConfig, 'getConfigBooleanValue')
        .withArgs('routing.useHashRouting')
        .returns(true);
      try {
        Routing.removeModalDataFromUrl();
      } catch (error) {
        console.log('error', error);
      }
      sinon.assert.calledWithExactly(window.history.pushState, {}, '', 'http://some.url.de/#/settings?~luigi=mario');
    });
  });

  describe('normalizePath', () => {
    it('should normalize path', () => {
      const path = Routing.normalizePath('/bla/blub/x/y/../../a');
      assert.equal(path, '/bla/blub/a');
    });

    it('should not add leading slash', () => {
      const path = Routing.normalizePath('bla/blub/x/y/../../a');
      assert.equal(path, 'bla/blub/a');
    });

    it('should leave query params and hash untouched', () => {
      const path = Routing.normalizePath('bla/blub/../x/?~a=b&~c=d#/something?~e=f&~g=h');
      assert.equal(path, 'bla/x/?~a=b&~c=d#/something?~e=f&~g=h');
    });
  });
  describe('concatenate path', () => {
    it('concatenate path', () => {
      assert.equal(Routing.concatenatePath('/home/overview', 'settings'), 'home/overview/settings');
      assert.equal(Routing.concatenatePath('/#/home/overview', 'settings'), 'home/overview/settings');
      assert.equal(Routing.concatenatePath('', 'settings'), 'settings');
      assert.equal(Routing.concatenatePath('/home/overview', ''), 'home/overview');
      assert.equal(Routing.concatenatePath('/home/overview', '/test'), 'home/overview/test');
      assert.equal(Routing.concatenatePath('/home/overview/', 'test'), 'home/overview/test');
      assert.equal(Routing.concatenatePath('/home/overview/', '/test'), 'home/overview/test');
      assert.equal(Routing.concatenatePath('/home/overview/', 'test/'), 'home/overview/test/');
    });
  });

  describe('shouldSkipRoutingForUrlPatterns()', () => {
    let locationSpy;

    beforeEach(() => {
      locationSpy = jest.spyOn(window, 'location', 'get');
    });

    afterEach(() => {
      sinon.restore();
      sinon.reset();
      locationSpy.mockRestore();
    });
    it('should return true if path matches default patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?access_token=bar'
        };
      });
      const actual = Routing.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });
    it('should return true if path matches default patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?id_token=foo'
        };
      });
      const actual = Routing.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });
    it('should return true if path matches config patterns', () => {
      sinon.restore();
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('routing.skipRoutingForUrlPatterns')
        .returns(['foo_bar']);
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de?foo_bar'
        };
      });
      const actual = Routing.shouldSkipRoutingForUrlPatterns();
      const expect = true;

      assert.equal(actual, expect);
    });
    it('should return false if path does not matche patterns', () => {
      locationSpy.mockImplementation(() => {
        return {
          href: 'http://some.url.de/settings'
        };
      });
      const actual = Routing.shouldSkipRoutingForUrlPatterns();
      const expect = false;

      assert.equal(actual, expect);
    });
  });

  describe('shouldShowModalPathInUrl()', () => {
    beforeEach(() => {
      LuigiConfig.getConfigValue.restore();
      sinon.stub(Routing, 'handleBookmarkableModalPath');
    });
    afterEach(() => {
      sinon.restore();
    });
    it('handleBookmarkableModalPath should be triggered when showModalPathInUrl is true', () => {
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('routing.showModalPathInUrl')
        .returns(true);
      Routing.shouldShowModalPathInUrl();
      sinon.assert.calledOnce(Routing.handleBookmarkableModalPath);
    });
    it('handleBookmarkableModalPath should not be triggered when showModalPathInUrl is false', () => {
      sinon
        .stub(LuigiConfig, 'getConfigValue')
        .withArgs('routing.showModalPathInUrl')
        .returns(false);
      Routing.shouldShowModalPathInUrl();
      sinon.assert.notCalled(Routing.handleBookmarkableModalPath);
    });
  });

  describe('handleUnsavedChangesModal', () => {
    let path, iframeElement, config, oldUrl, newUrl;

    beforeEach(() => {
      iframeElement = 'iframe';
      config = 'config';
      oldUrl = new URL('https://www.oldurl.com');
      newUrl = new URL('https://www.newUrl.com');
      window.state = {};
      window.history.replaceState = sinon.spy();

      component.get = () => {
        return {
          unsavedChanges: {
            persistUrl: oldUrl
          }
        };
      };
      component.getUnsavedChangesModalPromise = () => {};
      sinon.stub(component, 'getUnsavedChangesModalPromise').resolves();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('inner function resolved', async () => {
      const path = 'valid';
      sinon.stub(Routing, 'resolveUnsavedChanges');

      await Routing.handleUnsavedChangesModal(path, component, iframeElement, config);

      sinon.assert.calledWithExactly(window.history.pushState, window.state, '', oldUrl);
      sinon.assert.calledOnce(component.getUnsavedChangesModalPromise);
      sinon.assert.calledOnce(Routing.resolveUnsavedChanges);
    });

    describe('resolveUnsavedChanges', () => {
      beforeEach(() => {
        sinon.stub(Routing, 'handleRouteChange');
      });

      afterEach(() => {
        sinon.restore();
      });

      it('test with valid path', async () => {
        path = 'valid';
        Routing.resolveUnsavedChanges(path, component, iframeElement, config);
        sinon.assert.calledOnce(window.history.replaceState);
        sinon.assert.calledOnce(Routing.handleRouteChange);
      });

      it('test with invalid path', async () => {
        path = '';
        Routing.resolveUnsavedChanges(path, component, iframeElement, config, newUrl);
        sinon.assert.notCalled(window.history.replaceState);
        sinon.assert.notCalled(Routing.handleRouteChange);
      });
    });
  });
});
