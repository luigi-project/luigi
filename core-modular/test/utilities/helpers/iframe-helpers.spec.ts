import { ViewUrlDecorator } from '../../../src/services/viewurl-decorator';
import { GenericHelpers } from '../../../src/utilities/helpers/generic-helpers';
import { IframeHelpers } from './../../../src/utilities/helpers/iframe-helpers';

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Iframe-helpers', () => {
  let component: any;
  const customSandboxRules = ['allow-scripts', 'rules1', 'rules2'];
  const allowRules = ['microphone', 'geolocation'];
  const allowRulesWorkAround = ['microphone;', 'geolocation;'];

  beforeEach(() => {
    component = {
      isNavigationSyncEnabled: true,
      prepareInternalData: () => {}
    };

    sinon.stub(GenericHelpers);
    sinon.stub(ViewUrlDecorator);
    GenericHelpers.getRandomId.returns('abc');
    GenericHelpers.isFunction.callThrough();
    ViewUrlDecorator.hasDecorators.returns(false);
    ViewUrlDecorator.applyDecorators.callsFake((url) => url);
  });

  afterEach(() => {
    if (document.createElement.restore) {
      document.createElement.restore();
    }
    sinon.restore();
  });

  describe('createIframe', () => {
    it('createIframe', () => {
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.com/',
        null,
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => null}
      );

      assert.equal(iframe.src, 'http://luigi.url.com/');
      sinon.assert.notCalled(ViewUrlDecorator.applyDecorators);
    });

    it('createIframe with view group', () => {
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.de/',
        'ananas',
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => null}
      );

      assert.equal(iframe.src, 'http://luigi.url.de/');
      assert.equal(iframe.vg, 'ananas');
    });

    it('createIframe with customrules', () => {
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.com/',
        null,
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => customSandboxRules}
      );

      assert.equal(
        iframe.sandbox,
        'allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts rules1 rules2'
      );
    });

    it('createIframe with allowrules', () => {
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.com/',
        null,
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => allowRules}
      );

      assert.equal(iframe.allow, 'microphone; geolocation;');
    });

    it('createIframe with workarounds for allowrules', () => {
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.com/',
        null,
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => allowRulesWorkAround}
      );

      assert.equal(iframe.allow, 'microphone; geolocation;');
    });

    it('createIframe with interceptor', () => {
      const icf = () => {};
      const interceptor = sinon.spy(icf);
      const node = {
        pathSegment: 'tets'
      };
      const iframe = IframeHelpers.createIframe(
        'http://luigi.url.com/',
        'vg1',
        node,
        'main',
        null,
        {getConfigValue: (prop: string) => {
          if (prop === 'settings.iframeCreationInterceptor') {
            return interceptor;
          } else {
            return [];
          }
        }}
      );

      assert(interceptor.calledWith(iframe, 'vg1', node, 'main'));
    });

    it('createIframe with viewUrlDecorator', () => {
      const mockUrl = 'http://luigi.url.com/';
      ViewUrlDecorator.hasDecorators.returns(true);
      const iframe = IframeHelpers.createIframe(
        mockUrl,
        null,
        null,
        'main',
        null,
        {getConfigValue: (prop: string) => null}
      );

      assert.equal(iframe.src, mockUrl);

      sinon.assert.calledOnce(ViewUrlDecorator.hasDecorators);
      sinon.assert.calledWithExactly(ViewUrlDecorator.applyDecorators, mockUrl, undefined);
    });

    it('createIframe with viewUrlDecorator and decode url', () => {
      const mockUrl = 'http://luigi.url.com/';
      ViewUrlDecorator.hasDecorators.returns(true);
      const iframe = IframeHelpers.createIframe(
        mockUrl,
        undefined,
        { decodeViewUrl: true },
        'main',
        null,
        {getConfigValue: (prop: string) => null}
      );

      assert.equal(iframe.src, mockUrl);

      sinon.assert.calledOnce(ViewUrlDecorator.hasDecorators);
      sinon.assert.calledWithExactly(ViewUrlDecorator.applyDecorators, mockUrl, true);
    });
  });

  it('removeIframe', () => {
    const testNode = {
      children: ['one', 'two', 'three', 'four'],
      removeChild: sinon.spy()
    };
    IframeHelpers.removeIframe('two', testNode);
    assert.equal(testNode.removeChild.callCount, 1, 'removeChild call count');
    assert(testNode.removeChild.calledWith('two'), 'correct node child was deleted');
  });

  describe('ie fix for domain check', () => {
    const sb = sinon.createSandbox();
    const href = 'https://luigi.url.com/sdf/sdf';

    afterEach(() => {
      sb.restore();
    });

    it('urlMatchesTheDomain', () => {
      const domain = 'https://luigi.url.com/fd';
      assert.isTrue(IframeHelpers.urlMatchesTheDomain(href, domain));
    });

    it('!urlMatchesTheDomain', () => {
      const domain = 'http://luigi.url.com/fd';
      assert.isFalse(IframeHelpers.urlMatchesTheDomain(href, domain));
    });
  });

  describe('isSameUrl', () => {
    it('should return false when iframe is not set', () => {
      const config = { iframe: null };

      component = Object.assign(component, {
        viewUrl: 'http://otherurl.de/app.html!#/someUrl',
        viewGroup: 'test',
        previousNodeValues: { viewUrl: null, viewGroup: null }
      });

      const result = IframeHelpers.isSameUrl(config, component);

      assert.equal(result, false);
    });

    it('should return false when iframe is set and previousUrl is different than nextUrl', () => {
      const config = {
        iframe: {
          src: 'http://url.com/index.html!#/prevUrl'
        }
      };

      component = Object.assign(component, {
        viewUrl: 'http://otherurl.de/app.html!#/someUrl',
        viewGroup: 'test',
        previousNodeValues: { viewUrl: config.iframe.src, viewGroup: null }
      });

      const result = IframeHelpers.isSameUrl(config, component);

      assert.equal(result, false);
    });

    it('should return false when iframe is set and previousUrl equals nextUrl, but viewGroup is defined', () => {
      const config = {
        iframe: {
          src: 'http://otherurl.de/app.html!#/someUrl'
        }
      };

      component = Object.assign(component, {
        viewUrl: 'http://otherurl.de/app.html!#/someUrl',
        viewGroup: 'test',
        previousNodeValues: { viewUrl: config.iframe.src, viewGroup: null }
      });

      const result = IframeHelpers.isSameUrl(config, component);

      assert.equal(result, false);
    });

    it('should return true when iframe is set and previousUrl equals nextUrl and viewGroup is not defined', () => {
      const config = {
        iframe: {
          src: 'http://otherurl.de/app.html!#/someUrl'
        }
      };

      component = Object.assign(component, {
        viewUrl: 'http://otherurl.de/app.html!#/someUrl',
        viewGroup: null,
        previousNodeValues: { viewUrl: config.iframe.src, viewGroup: null }
      });

      const result = IframeHelpers.isSameUrl(config, component);

      assert.equal(result, true);
    });
  });

  describe('canReuseIframe', () => {
    const config = {
      iframe: {
        src: 'http://url.com/app.html!#/prevUrl'
      }
    };

    it('getLocation', () => {
      const url = 'http://.luigi.url.com';
      const iframeOrigin = IframeHelpers.getLocation(url);
      assert.equal(iframeOrigin, url);
    });

    it('getVisibleIframes', () => {
      sinon.stub(IframeHelpers, 'getMicrofrontendsInDom').callsFake(() => [
        {
          id: 1223,
          active: true,
          container: 'mock-html-element',
          type: 'main'
        }
      ]);
      const visibleIframes = IframeHelpers.getVisibleIframes();
      assert.deepEqual(visibleIframes, ['mock-html-element']);
    });

    it('isSameViewGroup', () => {
      config.iframe.src = 'http://otherurl.de/app.html!#/someUrl';
      config.viewGroup = 'tets';
      component = Object.assign(component, {
        viewUrl: 'http://otherurl.de/app.html!#/someUrl',
        viewGroup: 'tets',
        previousNodeValues: { viewUrl: config.iframe.src, viewGroup: 'tets' }
      });
      const tets = IframeHelpers.isSameViewGroup(config, component);
      assert.equal(tets, true);
    });

    it('should return true if views have the same domain and different hash', () => {
      config.iframe.src = 'http://url.com/app.html!#/prevUrl';
      component = Object.assign(component, {
        viewUrl: 'http://url.com/app.html!#/someUrl',
        previousNodeValues: { viewUrl: config.iframe.src }
      });
      assert.isTrue(IframeHelpers.canReuseIframe(config, component));
    });

    it('should return false if views have different domains', () => {
      const prevUrl = 'http://otherurl.de/app.html';
      const nextUrl = 'http://nexturl.de/app.html';
      component = Object.assign(component, {
        viewUrl: 'nextUrl',
        previousNodeValues: { viewUrl: 'prevUrl' }
      });
      GenericHelpers.getUrlWithoutHash.resetHistory();
      GenericHelpers.getUrlWithoutHash.withArgs('prevUrl').returns(prevUrl);
      GenericHelpers.getUrlWithoutHash.withArgs('nextUrl').returns(nextUrl);

      assert.isFalse(IframeHelpers.canReuseIframe(config, component));
    });

    const noHashConfig = {
      iframe: {
        src: 'http://url.com/oneSite'
      }
    };

    it('should return true if views have the same domain and viewGroup', () => {
      component = Object.assign(component, {
        viewUrl: 'http://url.com/SomeUrl',
        viewGroup: 'firstSPA',
        previousNodeValues: {
          viewUrl: noHashConfig.iframe.src,
          viewGroup: 'firstSPA'
        }
      });
      assert.isTrue(IframeHelpers.canReuseIframe(config, component));
    });

    it('should return false if views have the same domian and different viewGroups', () => {
      const nextUrl = 'http://nexturl.de/app.html';
      GenericHelpers.getUrlWithoutHash.resetHistory();
      GenericHelpers.getUrlWithoutHash.returns(nextUrl);

      component = Object.assign(component, {
        viewUrl: 'http://url.com/someUrl',
        viewGroup: 'firstSPA',
        previousNodeValues: {
          viewUrl: noHashConfig.iframe.src,
          viewGroup: 'secondSPA'
        }
      });

      assert.isFalse(IframeHelpers.canReuseIframe(config, component));
    });

    it('should return false if views have different domains and the same viewGroup', () => {
      const prevUrl = 'http://otherurl.de/app.html';
      const nextUrl = 'http://nexturl.de/app.html';

      GenericHelpers.getUrlWithoutHash.resetHistory();
      GenericHelpers.getUrlWithoutHash.withArgs('prevUrl').returns(prevUrl);
      GenericHelpers.getUrlWithoutHash.withArgs('nextUrl').returns(nextUrl);
      component = Object.assign(component, {
        viewUrl: 'nextUrl',
        viewGroup: 'firstSPA',
        previousNodeValues: {
          viewUrl: 'prevUrl',
          viewGroup: 'firstSPA'
        }
      });
      assert.isFalse(IframeHelpers.canReuseIframe(config, component));
    });
  });

  it('getIframeContainer', () => {
    sinon
      .stub(document, 'querySelectorAll')
      .onFirstCall()
      .returns([])
      .onSecondCall()
      .returns(['firstIframe', 'secondIframe']);

    // first
    assert.equal(IframeHelpers.getIframeContainer(), undefined, 'no iframe found');
    // second
    assert.equal(IframeHelpers.getIframeContainer(), 'firstIframe', 'returns first iframe');
  });

  describe('getMicrofrontendsInDom', () => {
    it('gets list of visible mfs', () => {
      const mockContainer = (id) => ({
        luigi: { id }
      });
      sinon
        .stub(document, 'querySelectorAll')
        .withArgs('.iframeContainer iframe') // 'main'
        .returns([mockContainer('main_1'), mockContainer('main_2')])
        .withArgs('.iframeSplitViewCnt iframe') // 'split-view'
        .returns([mockContainer('split_1')])
        .withArgs('.iframeModalCtn._modal iframe') // 'modal'
        .returns([mockContainer('modal')])
        .withArgs('.iframeModalCtn._drawer iframe') // 'drawer'
        .returns([mockContainer('drawer')])
        .withArgs('.iframeUserSettingsCtn iframe') // 'usersettings'
        .returns([mockContainer('usersettings')]);

      GenericHelpers.isElementVisible.callsFake((container) => {
        // second container is not active
        return container.luigi.id !== 'main_2';
      });
      const iframes = IframeHelpers.getMicrofrontendsInDom();
      assert.equal(iframes.length, 6, 'total iframes');
      assert.equal(iframes.filter((i) => i.active).length, 5, 'active iframes');

      const expectedKeys = ['active', 'container', 'id', 'type'];
      assert.deepEqual(Object.keys(iframes[0]), expectedKeys, 'contains all required keys');

      const mainIframes = IframeHelpers.getMainIframes('main');
      assert.equal(mainIframes.length, 2);
      const modalIframes = IframeHelpers.getModalIframes('modal');
      assert.equal(modalIframes.length, 1);
    });
  });

  describe('disable/enable keyboard accessibility on background elements', () => {
    /**
     * Ths function produces this html containing 6 DOM elements inside a body tag
     * <html>
     * <head>
     *    <title>Mocked DOM</title>
     * </head>
     * <body>
     *   <div>
     *     <span class="outsideModal">I am some text</span>
     *     <span tabindex="0" class="oldTabIndexOutsideModal">I am a text span with existing tabindex value</span>
     *     <div class="modalElement">
     *        <button>Click me</button>
     *        <button class="oldTabIndexInModal" tabindex="1">Click that</button>
     *     </div>
     *   </div>
     * </body>
     * </html>
     *
     * @returns mocked data
     */
    const getMockedDocument = () => {
      const doc = document.implementation.createHTMLDocument('Mocked DOM');

      const divParent = doc.createElement('div');
      divParent.className = 'divParent';
      doc.body.appendChild(divParent);

      const spanChild = doc.createElement('span');
      spanChild.textContent = 'I am some text';
      spanChild.className = 'spanChild';
      divParent.appendChild(spanChild);

      const spanChild2 = doc.createElement('span');
      spanChild2.textContent = 'I am a text span with existing tabindex value';
      spanChild2.setAttribute('tabindex', '0');
      spanChild2.className = 'oldTabIndexOutsideModal';

      divParent.appendChild(spanChild2);
      divParent.appendChild(spanChild2);

      const divChild = doc.createElement('div');
      divChild.className = 'modalElement';

      const childButton1 = doc.createElement('button');
      childButton1.textContent = 'Click me';
      childButton1.className = 'childButton1';

      const childButton2 = doc.createElement('button');
      childButton2.textContent = 'Click that';
      childButton2.className = 'oldTabIndexInModal';
      childButton2.setAttribute('tabindex', '1');

      divChild.appendChild(childButton1);
      divChild.appendChild(childButton2);
      divParent.appendChild(divChild);
      return doc;
    };

    describe('disableA11YKeyboardExceptClassName', () => {
      let docQuerySelectorAllSpy;
      const docMock = getMockedDocument();

      beforeEach(() => {
        docQuerySelectorAllSpy = jest.spyOn(document, 'querySelectorAll');
        docQuerySelectorAllSpy.mockImplementation((selector) => {
          return docMock.querySelectorAll(selector);
        });
      });

      afterEach(() => {
        docQuerySelectorAllSpy.mockRestore();
      });

      it('saves old tabindex value properly', () => {
        IframeHelpers.disableA11YKeyboardExceptClassName('.modalElement');
        assert.equal(docMock.getElementsByClassName('oldTabIndexOutsideModal')[0].getAttribute('oldtab'), '0');
        assert.isNull(docMock.getElementsByClassName('oldTabIndexInModal')[0].getAttribute('oldtab'));
      });

      it('set tabindex properly on all but specified classname element', () => {
        IframeHelpers.disableA11YKeyboardExceptClassName('.modalElement');
        assert.equal(docMock.getElementsByClassName('divParent')[0].getAttribute('tabindex'), '-1');
        assert.equal(docMock.getElementsByClassName('spanChild')[0].getAttribute('tabindex'), '-1');
        assert.equal(docMock.getElementsByClassName('oldTabIndexOutsideModal')[0].getAttribute('tabindex'), '-1');
        assert.isNull(docMock.getElementsByClassName('modalElement')[0].getAttribute('tabindex'));
        assert.isNull(docMock.getElementsByClassName('childButton1')[0].getAttribute('tabindex'));
        assert.equal(docMock.getElementsByClassName('oldTabIndexInModal')[0].getAttribute('tabindex'), '1');
      });
    });

    describe('enableA11YKeyboardBackdrop', () => {
      let docQuerySelectorAllSpy;
      const docMock = getMockedDocument();

      beforeEach(() => {
        docQuerySelectorAllSpy = jest.spyOn(document, 'querySelectorAll');
        docQuerySelectorAllSpy.mockImplementation((selector) => {
          return docMock.querySelectorAll(selector);
        });
        IframeHelpers.disableA11YKeyboardExceptClassName('.modalElement');
      });

      afterEach(() => {
        docQuerySelectorAllSpy.mockRestore();
      });

      it('check oldtab property properly removed', () => {
        IframeHelpers.enableA11YKeyboardBackdropExceptClassName('.modalElement');
        assert.isNull(docMock.getElementsByClassName('divParent')[0].getAttribute('oldtab'));
        assert.isNull(docMock.getElementsByClassName('spanChild')[0].getAttribute('oldtab'));
        assert.isNull(docMock.getElementsByClassName('oldTabIndexOutsideModal')[0].getAttribute('oldtab'));
        assert.isNull(docMock.getElementsByClassName('modalElement')[0].getAttribute('oldtab'));
        assert.isNull(docMock.getElementsByClassName('childButton1')[0].getAttribute('oldtab'));
        assert.isNull(docMock.getElementsByClassName('oldTabIndexInModal')[0].getAttribute('oldtab'));
      });

      it('check oldtabindex value properly restored', () => {
        IframeHelpers.enableA11YKeyboardBackdropExceptClassName('.modalElement');
        assert.isNull(docMock.getElementsByClassName('divParent')[0].getAttribute('tabindex'));
        assert.isNull(docMock.getElementsByClassName('spanChild')[0].getAttribute('tabindex'));
        assert.equal(docMock.getElementsByClassName('oldTabIndexOutsideModal')[0].getAttribute('tabindex'), '0');
        assert.isNull(docMock.getElementsByClassName('modalElement')[0].getAttribute('tabindex'));
        assert.isNull(docMock.getElementsByClassName('childButton1')[0].getAttribute('tabindex'));
        assert.equal(docMock.getElementsByClassName('oldTabIndexInModal')[0].getAttribute('tabindex'), '1');
      });
    });
  });

  describe('enable/disable a11y of inactive iframe', () => {
    const globalBodyRef = global.document.body;
    const mockedHtml = `
      <div class="divclass">
        <span class="spanclass">I am some text</span>
        <span tabindex="0" class="anotherspanclass">I am a text span with existing tabindex value</span>
        <div class="iframectnclass" tabindex="0">
          <iframe class="iframeclass"></iframe>
        </div>
        <div class="anotherctnclass">
          <a class="aclass" tabindex="0"></a>
          <i class="iclass" tabindex="0"><i>
          <button class="buttonclass" tabindex="-1"></button>
        </div>
      </div>
    `;

    const checkElementsInDisabledState = () => {
      assert.equal(document.querySelector('.spanclass').getAttribute('oldtab'), 'null');
      assert.equal(document.querySelector('.spanclass').getAttribute('tabindex'), '-1');
      assert.equal(document.querySelector('.anotherspanclass').getAttribute('tabindex'), -1);
      assert.equal(document.querySelector('.anotherspanclass').getAttribute('oldtab'), 0);
      assert.equal(document.querySelector('.iframectnclass').getAttribute('tabindex'), -1);
      assert.equal(document.querySelector('.iframectnclass').getAttribute('oldtab'), 0);
      assert.equal(document.querySelector('.iframeclass').getAttribute('oldtab'), 'null');
      assert.isNull(document.querySelector('.iframeclass').getAttribute('tabindex'));
      assert.equal(document.querySelector('.buttonclass').getAttribute('oldtab'), -1);
      assert.equal(document.querySelector('.buttonclass').getAttribute('tabindex'), -1);
    };

    const checkElementsInEnabledState = () => {
      assert.isNull(document.querySelector('.spanclass').getAttribute('oldtab'));
      assert.isNull(document.querySelector('.spanclass').getAttribute('tabindex'));
      assert.equal(document.querySelector('.anotherspanclass').getAttribute('tabindex'), 0);
      assert.isNull(document.querySelector('.anotherspanclass').getAttribute('oldtab'));
      assert.equal(document.querySelector('.iframectnclass').getAttribute('tabindex'), 0);
      assert.isNull(document.querySelector('.iframectnclass').getAttribute('oldtab'));
      assert.isNull(document.querySelector('.iframeclass').getAttribute('oldtab'));
      assert.isNull(document.querySelector('.iframeclass').getAttribute('tabindex'));
      assert.equal(document.querySelector('.buttonclass').getAttribute('tabindex'), -1);
      assert.isNull(document.querySelector('.buttonclass').getAttribute('oldtab'));
    };

    beforeEach(() => {
      document.body.innerHTML = mockedHtml;
    });

    afterEach(() => {
      document.body.innerHTML = globalBodyRef;
    });

    it('saves old tabindex value properly', () => {
      const iframe = document.querySelector('.iframeclass');

      IframeHelpers.disableA11yOfInactiveIframe(iframe);
      checkElementsInDisabledState();

      // test if oldtab and tabindex won't be overriden with new tabindex value -1 in a 2nd round
      IframeHelpers.disableA11yOfInactiveIframe(iframe);
      checkElementsInDisabledState();
    });

    it('enable a11y', () => {
      const iframe = document.querySelector('.iframeclass');

      IframeHelpers.disableA11yOfInactiveIframe(iframe);
      checkElementsInDisabledState();

      IframeHelpers.enableA11yOfInactiveIframe();
      checkElementsInEnabledState();

      // check if tabindex won't be overriden with new value
      IframeHelpers.enableA11yOfInactiveIframe();
      checkElementsInEnabledState();
    });
  });
});
