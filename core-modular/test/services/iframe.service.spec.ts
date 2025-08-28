import { IframeService } from '../../src/services/iframe.service';
import { ViewUrlDecorator } from '../../src/services/viewurl-decorator';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
import { IframeHelpers } from '../../src/utilities/helpers/iframe-helpers';
import { NavigationHelpers } from '../../src/utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../../src/utilities/helpers/routing-helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Iframe', () => {
  let clock: any;
  let node: any;
  let component: any;
  let luigi: any = {};
  let iframeService: IframeService;

  beforeEach(() => {
    luigi = {
      config: {},
      engine: {},
      getConfig: () => ({ routing: { contentViewParamPrefix: '~' } }),
      getEngine: () => ({}),
      setConfig: () => {},
      navigation: () => ({ navigate: () => {} }),
      routing: () => ({ getSearchParams: () => ({}) }),
      ux: () => ({ hideLoadingIndicator: () => {}, showLoadingIndicator: () => {} }),
      uxManager: () => ({}),
      linkManager: () => ({}),
      getConfigValue: (key: string) => {
        if (key === 'routing.contentViewParamPrefix') {
          return luigi.getConfig().routing.contentViewParamPrefix;
        }
        return [];
      },
      getActiveFeatureToggles: () => []
    };
    iframeService = new IframeService(luigi);
    global['sessionStorage'] = {
      getItem: sinon.stub(),
      setItem: sinon.stub()
    };
    global['localStorage'] = {
      getItem: sinon.stub(),
      setItem: sinon.stub()
    };
    clock = sinon.useFakeTimers();
    let lastObj = {
      isNavigationSyncEnabled: true
    };
    component = {
      isNavigationSyncEnabled: true,
      prepareInternalData: () => {}
    };
    sinon.stub(iframeService, 'setOkResponseHandler');
    sinon.stub(NavigationHelpers, 'handleUnresponsiveClient');
    sinon.stub(GenericHelpers);
    GenericHelpers.getRandomId.returns('abc');
    sinon.stub(RoutingHelpers, 'substituteViewUrl');
    GenericHelpers.isElementVisible.callsFake((element) => element.visible);
    sinon.stub(ViewUrlDecorator);
    ViewUrlDecorator.applyDecorators.callsFake((url) => url);

    node = {
      children: [
        {
          style: {},
          visible: true,
          id: 1,
          vg: 'tets1',
          tagName: 'IFRAME'
        },
        {
          style: {},
          visible: true,
          pv: 'pv',
          id: 2,
          tagName: 'IFRAME'
        },
        {
          style: {},
          visible: true,
          id: 3,
          tagName: 'IFRAME'
        },
        {
          style: {},
          visible: false,
          id: 4,
          tagName: 'IFRAME'
        },
        {
          style: {},
          visible: true,
          id: 5,
          tagName: 'IFRAME'
        }
      ],
      removeChild: (child) => {
        node.children.forEach((c, i) => {
          if (c === child) {
            node.children.splice(i, 1);
          }
        });
      },
      firstChild: () => {
        node.children[0];
      },
      insertBefore: (iframe, child) => {
        node.children.unshift(iframe);
      }
    };
  });

  afterEach(() => {
    if (document.createElement.restore) {
      document.createElement.restore();
    }
    sinon.restore();
  });

  describe('setActiveIframeToPrevious', () => {
    beforeEach(() => {
      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => node.children);
    });
    afterEach(() => {
      sinon.restore();
    });

    it('goBack with preserved view situation', () => {
      iframeService.setActiveIframeToPrevious(node);
      assert.equal(node.children.length, 4);
      assert.equal(node.children[0].style.display, 'block');
    });

    it('setActiveIframeToPrevious w/o preservedViews', () => {
      delete node.children[1].pv;
      iframeService.setActiveIframeToPrevious(node);
      assert.equal(node.children.length, 5);
    });
  });

  it('removeInactiveIframes', () => {
    node.removeChild = sinon.spy();
    iframeService.removeInactiveIframes(node);
    sinon.assert.calledOnce(node.removeChild);
    sinon.assert.calledWithExactly(node.removeChild, {
      id: 4,
      style: {},
      visible: false,
      tagName: 'IFRAME'
    });
  });

  describe('create new iframe with different viewgroup and dont delete the previous one (cache)', () => {
    it('navigate', async () => {
      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => [
        {
          src: 'http://url.com/app.html!#/prevUrl',
          style: { display: 'block' },
          vg: 'tets1'
        }
      ]);
      const config = {
        iframe: {
          src: 'http://luigi.url.de',
          vg: 'tets2'
        }
      };
      component = Object.assign(component, {
        viewUrl: 'http://luigi.url.de/1',
        viewGroup: 'tets2',
        previousNodeValues: {
          viewUrl: 'http://luigi.url.desdf/1'
        },
        currentNode: {}
      });

      await iframeService.navigateIframe(config, component, node);
      assert.equal(node.children.length, 2);
    });
  });

  describe('create new iframe and add event listener', () => {
    it('navigate', async () => {
      const spy = sinon.spy(IframeHelpers, 'sendMessageToIframe');
      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => [
        {
          src: 'http://url.com/app.html!#/prevUrl',
          style: { display: 'block' },
          vg: 'tets1',
          luigi: {}
        }
      ]);
      const config = {
        builderCompatibilityMode: true
      };
      component = Object.assign(component, {
        viewUrl: 'http://luigi.url.de/1',
        viewGroup: 'tets2',
        previousNodeValues: {
          viewUrl: 'http://luigi.url.desdf/1'
        },
        currentNode: {}
      });

      assert.notExists(config.iframe);

      await iframeService.navigateIframe(config, component, node);
      config.iframe.dispatchEvent(new Event('load'));

      assert.exists(config.iframe);
      assert(spy.called, 'sendMessageToIframe(config.iframe, message) call');
    });
  });

  describe('check if luigi respond, if not, callback again to replace the iframe', () => {
    it('navigate', async () => {
      sinon.stub(iframeService, 'initHandshakeFailed').returns(false);
      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => [
        {
          src: 'http://url.com/app.html!#/prevUrl',
          style: { display: 'block' },
          vg: 'tets1',
          luigi: {}
        }
      ]);
      const config = {
        iframe: {
          src: 'http://luigi.url.de',
          vg: 'tets2'
        }
      };
      component = Object.assign(component, {
        viewUrl: 'http://luigi.url.de/1',
        viewGroup: 'tets1',
        previousNodeValues: {
          viewUrl: 'http://luigi.url.desdf/1'
        },
        currentNode: {}
      });
      assert.equal(config.iframe.src, 'http://luigi.url.de');
      await iframeService.navigateIframe(config, component, node);

      assert(iframeService.setOkResponseHandler.called, 'setOkResponseHandler call');
      assert.equal(config.iframe.src, 'http://url.com/app.html!#/prevUrl');
    });
  });

  // If with setTimeout, async clock does not work.
  xdescribe('setOkResponseHandler', () => {
    beforeEach(() => {
      iframeService.setOkResponseHandler.restore();
      sinon.restore();
    });

    it('ok', () => {
      sinon.stub(iframeService, 'navigateIframe');
      const config = {
        navigateOk: true,
        iframe: {
          src: 'http://luigi.url.de'
        }
      };
      component = Object.assign(component, {
        currentNode: {}
      });

      assert.isTrue(config.navigateOk);

      iframeService.setOkResponseHandler(config, component, node);
      clock.tick(3000);

      assert.isUndefined(config.navigateOk);
      assert.deepEqual(config, {
        navigateOk: undefined,
        iframe: {
          src: 'http://luigi.url.de'
        }
      });
      assert(iframeService.navigateiframeService.notCalled, 'iframeService.navigateIframe not called');
    });

    it('not ok', () => {
      sinon.stub(iframeService, 'navigateIframe');
      sinon.stub(console, 'info');
      const config = {
        navigateOk: undefined,
        iframe: {
          src: 'http://luigi.url.de'
        }
      };
      component = Object.assign(component, {
        currentNode: {}
      });

      iframeService.setOkResponseHandler(config, component, node);
      clock.tick(3000);

      assert.isUndefined(config.navigateOk);
      assert.deepEqual(config, {
        navigateOk: undefined,
        iframe: undefined,
        isFallbackFrame: true
      });
      assert(console.info.called, 'console.info called');
      assert(iframeService.navigateiframeService.called, 'iframeService.navigateIframe called');
    });
  });

  xdescribe('checkIframe', () => {
    let viewUrl;
    let config;
    let node;

    beforeEach(() => {
      component = Object.assign(component, {
        showLoadingIndicator: true
      });
      viewUrl = '/something';
      config = {};
      node = {};
      // NavigationHelpers.handleUnresponsiveClient = sinon.spy();
    });

    afterEach(() => {
      sinon.restore();
    });

    it('if viewUrl is defined ', () => {
      // given
      const errorHandlerNode = {
        timeout: 1000,
        viewUrl: '/somewhere',
        redirectPath: '/',
        errorFn: () => {
          console.log('Works!');
        }
      };

      // when
      iframeService.checkIframe(errorHandlerNode, component, viewUrl, config, node);
      clock.tick(2000);

      // then
      assert.deepEqual(component.viewUrl, '/somewhere');
      assert(iframeService.setOkResponseHandler.called, 'setOkResponseHandler() call');
    });

    it('if viewUrl is not defined', async () => {
      // given
      const errorHandlerNode = {
        timeout: 1000,
        redirectPath: '/'
      };

      // when
      iframeService.checkIframe(errorHandlerNode, component, viewUrl, config, node);
      clock.tick(2000);

      // then
      assert(NavigationHelpers.handleUnresponsiveClient.called, 'handleUnresponsiveClient() call');
    });
  });

  describe('use cached iframe with same viewgroup and change viewUrl', () => {
    it('navigate', async () => {
      sinon.stub(iframeService, 'initHandshakeFailed').returns(false);
      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => [
        {
          src: 'http://luigi.url.de',
          vg: 'tets1',
          luigi: {
            nextViewUrl: 'http://luigi.url.de/2'
          },
          style: { display: 'block' }
        }
      ]);
      const config = {
        iframe: {
          src: 'http://luigi.url.de',
          vg: 'tets1',
          luigi: {
            nextViewUrl: 'http://luigi.url.de/2'
          }
        },
        navigateOk: true
      };
      component = Object.assign(component, {
        viewUrl: 'http://luigi.url.de/1',
        viewGroup: 'tets1',
        previousNodeValues: {
          viewUrl: 'http://luigi.url.de/previous'
        },
        currentNode: {}
      });
      RoutingHelpers.substituteViewUrl.returns('http://luigi.url.de/1m');

      assert.equal(config.iframe.luigi.nextViewUrl, 'http://luigi.url.de/2');
      await iframeService.navigateIframe(config, component, node);
      assert.equal(config.iframe.luigi.nextViewUrl, 'http://luigi.url.de/1m');
    });
  });

  describe('using withoutSync whould not trigger iframe fallback', () => {
    it('navigate', async () => {
      sinon.stub(iframeService, 'initHandshakeFailed').returns(false);
      const spy = sinon.spy(console, 'info');
      spy.resetHistory();

      sinon.stub(IframeHelpers, 'getMainIframes').callsFake(() => [
        {
          src: 'http://url.com/app.html!#/prevUrl',
          style: { display: 'block' },
          vg: 'tets1',
          luigi: {}
        }
      ]);
      const config = {
        iframe: {
          src: 'http://luigi.url.de',
          vg: 'tets2'
        }
      };
      component = Object.assign(component, {
        viewUrl: 'http://luigi.url.de/1',
        viewGroup: 'tets1',
        previousNodeValues: {
          viewUrl: 'http://luigi.url.desdf/1'
        },
        currentNode: {},
        isNavigationSyncEnabled: false
      });
      assert.equal(config.iframe.src, 'http://luigi.url.de');
      await iframeService.navigateIframe(config, component, node);
      clock.tick(3000);
      assert(spy.notCalled, 'console.info() call should not apply');
      // assert.equal(config.iframe.src, 'http://luigi.url.de');
      // assert.isTrue(component.isNavigationSyncEnabled);
    });
  });

  describe('init handshake failed', () => {
    let someConfig = {};

    beforeEach(() => {
      someConfig = {
        iframe: {}
      };
    });

    it('init handshake failed no luigi object on iframe', () => {
      assert.equal(iframeService.initHandshakeFailed(someConfig), true);
    });

    it('init handshake failed initOk undefined', () => {
      someConfig.iframe.luigi = {};
      assert.equal(iframeService.initHandshakeFailed(someConfig), true);
    });

    it('init handshake noClientCheck true', () => {
      someConfig.iframe.luigi = {};
      someConfig.iframe.vg = 'view-group-name';
      sinon.stub(NavigationHelpers, 'getViewGroupSettings').callsFake(() => ({ noClientCheck: true }));
      assert.equal(iframeService.initHandshakeFailed(someConfig), false);
    });

    it('init handshake success', () => {
      someConfig.iframe.luigi = {
        initOk: true,
        clientVersion: '1.4.0'
      };
      assert.equal(iframeService.initHandshakeFailed(someConfig), false);
    });
  });
});
