import { WebComponentService } from '../../src/services/web-components';
import { LuigiConfig, LuigiI18N, LuigiUX } from '../../src/core-api';

import { DefaultCompoundRenderer } from '../../src/utilities/helpers/web-component-helpers';
import { LuigiElement } from '../../../client/src/luigi-element';

const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const assert = chai.assert;

describe('WebComponentService', function () {
  let customElementsGetSpy;
  let customElementsDefineSpy;

  beforeEach(() => {
    customElementsGetSpy = jest.spyOn(globalThis.customElements, 'get');
    customElementsDefineSpy = jest.spyOn(globalThis.customElements, 'define');
  });

  afterEach(() => {
    customElementsGetSpy.mockRestore();
    customElementsDefineSpy.mockRestore();
  });

  describe('generate web component id', function () {
    const someRandomString = 'dsfgljhbakjdfngb,mdcn vkjrzwero78to4     wfoasb    f,asndbf';

    it('check determinism', () => {
      const wcId = WebComponentService.generateWCId(someRandomString);
      const wcId2 = WebComponentService.generateWCId(someRandomString);
      expect(wcId).to.equal(wcId2);
    });

    it('check uniqueness', () => {
      const wcId = WebComponentService.generateWCId(someRandomString);
      const wcId2 = WebComponentService.generateWCId('someOtherRandomString_9843utieuhfgiasdf');
      expect(wcId).to.not.equal(wcId2);
    });
  });

  describe('attach web component', function () {
    const sb = sinon.createSandbox();
    let container;
    let itemPlaceholder;
    const extendedContext = { context: { someValue: true } };

    beforeEach(() => {
      window.Luigi = {
        navigation: () => {
          return new Object({
            mockValue: 'mock',
            getCurrentRoute: () => {
              return 'mockRoute';
            }
          });
        },
        ux: () => LuigiUX,
        i18n: () => LuigiI18N
      };

      container = document.createElement('div');
      itemPlaceholder = document.createElement('div');
    });

    afterEach(() => {
      sb.restore();
      delete window.Luigi;
    });

    it('check dom injection abort if container not attached', () => {
      WebComponentService.attachWC('div', itemPlaceholder, container, extendedContext);

      expect(container.children.length).to.equal(0);
    });

    it('check dom injection', async () => {
      container.appendChild(itemPlaceholder);
      WebComponentService.attachWC('div', itemPlaceholder, container, extendedContext);

      const expectedCmp = container.children[0];
      expect(expectedCmp.context).to.equal(extendedContext.context);
      expect(expectedCmp.LuigiClient.linkManager).to.be.a('function');
      expect(expectedCmp.LuigiClient.linkManager().mockValue).to.equal('mock');
      expect(expectedCmp.LuigiClient.linkManager().getCurrentRoute()).to.be.a('promise');
      const route = await expectedCmp.LuigiClient.linkManager().getCurrentRoute();
      expect(route).to.equal('mockRoute');
      expect(expectedCmp.LuigiClient.uxManager()).to.have.property('showLoadingIndicator');
      expect(expectedCmp.LuigiClient.uxManager()).to.have.property('hideLoadingIndicator');
      expect(expectedCmp.LuigiClient.getCurrentLocale()).to.equal(window.Luigi.i18n().getCurrentLocale());
      expect(expectedCmp.LuigiClient.getCurrentLocale).to.be.a('function');
      expect(expectedCmp.LuigiClient.publishEvent).to.be.a('function');
    });

    it('check post-processing', () => {
      const wc_id = 'my-wc';
      const MyLuigiElement = class extends LuigiElement {
        render(ctx) {
          return '<div></div>';
        }
      };

      const myEl = Object.create(MyLuigiElement.prototype, {});
      sb.stub(myEl, '__postProcess').callsFake(() => {});
      sb.stub(myEl, 'setAttribute').callsFake(() => {});
      sb.stub(document, 'createElement')
        .callThrough()
        .withArgs('my-wc')
        .callsFake(() => {
          return myEl;
        });
      sb.stub(container, 'replaceChild').callsFake(() => {});
      sb.stub(window, 'location').value({ origin: 'http://localhost' });

      container.appendChild(itemPlaceholder);
      WebComponentService.attachWC(wc_id, itemPlaceholder, container, extendedContext, 'http://localhost:8080/');

      assert(myEl.__postProcess.calledOnce, '__postProcess should be called');
      expect(myEl.setAttribute.calledWith('lui_web_component', true)).to.equal(true);
    });
  });

  describe('register web component from url', function () {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    });

    it('check resolve', (done) => {
      let definedId;
      sb.stub(WebComponentService, 'dynamicImport').returns(
        new Promise((resolve, reject) => {
          resolve({ default: {} });
        })
      );
      const customElementsMock = {
        define: (id, clazz) => {
          definedId = id;
        },
        get: (id) => {
          return undefined;
        }
      };
      customElementsGetSpy.mockImplementation(customElementsMock.get);
      customElementsDefineSpy.mockImplementation(customElementsMock.define);

      WebComponentService.registerWCFromUrl('url', 'id').then(() => {
        expect(definedId).to.equal('id');
        done();
      });
    });

    it('check reject', (done) => {
      let definedId;
      sb.stub(WebComponentService, 'dynamicImport').returns(
        new Promise((resolve, reject) => {
          reject({ default: {} });
        })
      );
      const customElementsMock = {
        define: (id, clazz) => {
          definedId = id;
        }
      };
      customElementsGetSpy.mockImplementation(customElementsMock.define);

      WebComponentService.registerWCFromUrl('url', 'id')
        .then(() => {
          assert.fail('should not be here');
          done();
        })
        .catch((err) => {
          expect(definedId).to.be.undefined;
          done();
        });
    });

    it('check reject due to not-allowed url', (done) => {
      WebComponentService.registerWCFromUrl('http://luigi-project.io/mfe.js', 'id')
        .then(() => {
          assert.fail('should not be here');
          done();
        })
        .catch((err) => {
          done();
        });
    });
  });

  describe('render web component', function () {
    const container = document.createElement('div');
    const ctx = { someValue: true };
    const viewUrl = 'someurl';
    const sb = sinon.createSandbox();
    const node = {};

    beforeEach(() => {
      sb.stub(WebComponentService, 'dynamicImport').returns(
        new Promise((resolve) => {
          resolve({ default: {} });
        })
      );
    });

    afterEach(() => {
      sb.restore();
    });

    it('check attachment of already existing wc', (done) => {
      customElementsDefineSpy.mockReturnValue();
      customElementsGetSpy.mockReturnValue(true);

      sb.stub(WebComponentService, 'registerWCFromUrl').callsFake(() => {
        assert.fail('should not be here');
      });

      sb.stub(WebComponentService, 'attachWC').callsFake((id, iCnt, cnt, context) => {
        expect(cnt).to.equal(container);
        expect(JSON.stringify(context)).to.equal(JSON.stringify(ctx));
        done();
      });

      WebComponentService.renderWebComponent(viewUrl, container, ctx, node);
    });

    it('check invocation of custom function', (done) => {
      customElementsDefineSpy.mockReturnValue();
      customElementsGetSpy.mockReturnValue(false);

      sb.stub(WebComponentService, 'registerWCFromUrl').callsFake(() => {
        assert.fail('should not be here');
      });

      sb.stub(WebComponentService, 'attachWC').callsFake((id, iCnt, cnt, context) => {
        expect(cnt).to.equal(container);
        expect(JSON.stringify(context)).to.equal(JSON.stringify(ctx));
        done();
      });

      window.luigiWCFn = (viewUrl, wc_id, wc_container, cb) => {
        cb();
      };

      WebComponentService.renderWebComponent(viewUrl, container, ctx, node);

      delete window.luigiWCFn;
    });

    it('check creation and attachment of new wc', (done) => {
      customElementsDefineSpy.mockReturnValue();
      customElementsGetSpy.mockReturnValue(false);

      sb.stub(WebComponentService, 'registerWCFromUrl').callsFake(() => Promise.resolve());

      sb.stub(WebComponentService, 'attachWC').callsFake((id, iCnt, cnt, context) => {
        expect(cnt).to.equal(container);
        expect(JSON.stringify(context)).to.equal(JSON.stringify(ctx));
        done();
      });

      WebComponentService.renderWebComponent(viewUrl, container, ctx, node);
    });
  });

  describe('check valid wc url', function () {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    });

    it('check permission for relative and absolute urls from same domain', () => {
      const relative1 = WebComponentService.checkWCUrl('/folder/sth.js');
      expect(relative1).to.be.true;
      const relative2 = WebComponentService.checkWCUrl('folder/sth.js');
      expect(relative2).to.be.true;
      const relative3 = WebComponentService.checkWCUrl('./folder/sth.js');
      expect(relative3).to.be.true;

      const absolute = WebComponentService.checkWCUrl(window.location.href + '/folder/sth.js');
      expect(absolute).to.be.true;
    });

    it('check permission and denial for urls based on config', () => {
      sb.stub(LuigiConfig, 'getConfigValue').returns([
        'https://fiddle.luigi-project.io/.?',
        'https://docs.luigi-project.io/.?'
      ]);

      const valid1 = WebComponentService.checkWCUrl('https://fiddle.luigi-project.io/folder/sth.js');
      expect(valid1).to.be.true;
      const valid2 = WebComponentService.checkWCUrl('https://docs.luigi-project.io/folder/sth.js');
      expect(valid2).to.be.true;

      const invalid1 = WebComponentService.checkWCUrl('http://fiddle.luigi-project.io/folder/sth.js');
      expect(invalid1).to.be.false;
      const invalid2 = WebComponentService.checkWCUrl('https://slack.luigi-project.io/folder/sth.js');
      expect(invalid2).to.be.false;
    });
  });

  describe('check includeSelfRegisteredWCFromUrl', function () {
    const sb = sinon.createSandbox();
    const node = {
      webcomponent: {
        selfRegistered: true
      }
    };

    beforeAll(() => {
      window.Luigi = { mario: 'luigi', luigi: window.luigi };
    });

    afterAll(() => {
      window.Luigi = window.Luigi.luigi;
    });

    afterEach(() => {
      sb.restore();
    });

    it('check if script tag is added', () => {
      let element;
      sb.stub(document.body, 'appendChild').callsFake((el) => {
        element = el;
      });

      WebComponentService.includeSelfRegisteredWCFromUrl(node, '/mfe.js', () => {});
      expect(element.getAttribute('src')).to.equal('/mfe.js');
    });

    it('check if script tag is not added for untrusted url', () => {
      sb.spy(document.body, 'appendChild');
      WebComponentService.includeSelfRegisteredWCFromUrl(node, 'https://luigi-project.io/mfe.js', () => {});
      assert(document.body.appendChild.notCalled);
    });
  });

  describe('check createCompoundContainerAsync', function () {
    const sb = sinon.createSandbox();

    afterEach(() => {
      sb.restore();
    });

    it('check compound container created', (done) => {
      const renderer = new DefaultCompoundRenderer();
      sb.spy(renderer);
      WebComponentService.createCompoundContainerAsync(renderer).then(
        () => {
          assert(renderer.createCompoundContainer.calledOnce, 'createCompoundContainer called once');
          done();
        },
        (e) => {
          assert.fail('should not be here');
          done();
        }
      );
    });

    it('check nesting mfe created', (done) => {
      const renderer = new DefaultCompoundRenderer();
      renderer.viewUrl = 'mfe.js';
      sb.stub(WebComponentService, 'registerWCFromUrl').resolves();
      sb.stub(WebComponentService, 'initWC').returns();
      sb.spy(renderer);
      WebComponentService.createCompoundContainerAsync(renderer).then(
        () => {
          assert(renderer.createCompoundContainer.notCalled, 'createCompoundContainer should not be called');
          assert(WebComponentService.registerWCFromUrl.calledOnce, 'registerWCFromUrl called once');
          assert(WebComponentService.initWC.calledOnce, 'initWC called once');
          done();
        },
        (e) => {
          assert.fail('should not be here');
          done();
        }
      );
    });
  });

  describe('check renderWebComponentCompound', () => {
    const sb = sinon.createSandbox();
    const extendedContext = { context: { key: 'value', mario: 'luigi' } };
    const eventEmitter = 'emitterId';
    const eventName = 'emitterId';
    const navNode = {
      compound: {
        eventListeners: [
          {
            source: '*',
            name: eventName,
            action: 'update',
            dataConverter: (data) => {
              return 'new text: ' + data;
            }
          }
        ],
        children: [
          {
            viewUrl: 'mfe1.js',
            context: {
              title: 'My Awesome Grid'
            },
            layoutConfig: {
              row: '1',
              column: '1 / -1'
            },
            eventListeners: [
              {
                source: eventEmitter,
                name: eventName,
                action: 'update',
                dataConverter: (data) => {
                  return 'new text: ' + data;
                }
              }
            ]
          },
          {
            id: eventEmitter,
            viewUrl: 'mfe2.js',
            context: {
              title: 'Some input',
              instant: true
            }
          }
        ]
      }
    };

    beforeAll(() => {
      window.Luigi = { mario: 'luigi', luigi: window.luigi };
    });

    afterAll(() => {
      window.Luigi = window.Luigi.luigi;
    });

    beforeEach(() => {
      globalThis.IntersectionObserver = jest.fn(function IntersectionObserver() {
        this.observe = jest.fn();
      });
    });

    afterEach(() => {
      sb.restore();
      delete globalThis.IntersectionObserver;
    });

    it('render flat compound', (done) => {
      const wc_container = document.createElement('div');

      sb.spy(WebComponentService, 'renderWebComponent');
      sb.stub(WebComponentService, 'registerWCFromUrl').resolves();

      WebComponentService.renderWebComponentCompound(navNode, wc_container, extendedContext)
        .then((compoundCnt) => {
          expect(wc_container.children.length).to.equal(1);

          // eventbus test
          const evBus = compoundCnt.eventBus;
          const listeners = evBus.listeners[eventEmitter + '.' + eventName];
          expect(listeners.length).to.equal(1);
          const target = compoundCnt.querySelector('[nodeId=' + listeners[0].wcElementId + ']');
          sb.spy(target, 'dispatchEvent');
          evBus.onPublishEvent(new CustomEvent(eventName), eventEmitter);
          assert(target.dispatchEvent.calledOnce);
          // IntersectionObserver for lazy loading should not be instantiated
          expect(globalThis.IntersectionObserver.mock.instances).to.have.lengthOf(0);
          // Check if renderWebComponent is called for each child
          assert(WebComponentService.renderWebComponent.calledTwice);

          done();
        })
        .catch((reason) => {
          done(reason);
        });
    });

    it('render nested compound', (done) => {
      const wc_container = document.createElement('div');
      const node = JSON.parse(JSON.stringify(navNode));
      node.viewUrl = 'mfe.js';
      node.webcomponent = true;
      const customElementsMock = {
        get: () => {
          return false;
        }
      };

      customElementsGetSpy.mockImplementation(customElementsMock.get);

      sb.stub(WebComponentService, 'registerWCFromUrl').resolves();

      WebComponentService.renderWebComponentCompound(node, wc_container, extendedContext).then(
        (compoundCnt) => {
          expect(WebComponentService.registerWCFromUrl.callCount).to.equal(3);
          expect(globalThis.IntersectionObserver.mock.instances).to.have.lengthOf(0);
          // eventbus test
          const evBus = compoundCnt.eventBus;
          sb.spy(compoundCnt, 'dispatchEvent');
          evBus.onPublishEvent(new CustomEvent(eventName), eventEmitter);
          assert(compoundCnt.dispatchEvent.calledOnce);

          done();
        },
        () => {
          assert.fail('should not be here');
          done();
        }
      );
    });
  });

  describe('Get user settings for wc', () => {
    const sb = sinon.createSandbox();
    afterEach(() => {
      sb.restore();
    });
    it('get user settings for user settings group', () => {
      const wc = {
        viewUrl: '/test.js',
        label: 'tets',
        userSettingsGroup: 'language'
      };
      const storedUserSettingsData = {
        account: { name: 'luigi', email: 'luigi@tets.com' },
        language: { language: 'de', time: '12h', date: '' }
      };
      sb.stub(LuigiConfig, 'readUserSettings').resolves(storedUserSettingsData);
      WebComponentService.getUserSettingsForWc(wc).then((userSettings) => {
        expect(userSettings).to.deep.equal({ language: 'de', time: '12h', date: '' });
      });
    });
    it('get user settings, no user settings stored', () => {
      const wc = {
        viewUrl: '/test.js',
        label: 'tets',
        userSettingsGroup: 'language'
      };
      sb.stub(LuigiConfig, 'readUserSettings').resolves();
      WebComponentService.getUserSettingsForWc(wc).then((userSettings) => {
        expect(userSettings).equal(null);
      });
    });
  });

  describe('Lazy loading', () => {
    describe('setTemporaryHeightForCompoundItemContainer', () => {
      const initialHeight = '';
      let mockContainerElement;

      beforeEach(() => {
        mockContainerElement = {
          style: {
            height: initialHeight
          }
        };
      });

      it('does not apply anything if noTemporaryContainerHeight is configured', () => {
        WebComponentService.setTemporaryHeightForCompoundItemContainer(
          mockContainerElement,
          { lazyLoadingOptions: { temporaryContainerHeight: '666px', noTemporaryContainerHeight: true } },
          {}
        );

        expect(mockContainerElement.style.height).to.equal(initialHeight);
      });

      it('applies the fallback height if no height is configured', () => {
        WebComponentService.setTemporaryHeightForCompoundItemContainer(mockContainerElement, {}, {});

        expect(mockContainerElement.style.height).to.equal('500px');
      });

      it('applies the compound setting if it is configured', () => {
        WebComponentService.setTemporaryHeightForCompoundItemContainer(
          mockContainerElement,
          { lazyLoadingOptions: { temporaryContainerHeight: '666px' } },
          {}
        );

        expect(mockContainerElement.style.height).to.equal('666px');
      });

      it('applies the compound item setting if it is configured', () => {
        WebComponentService.setTemporaryHeightForCompoundItemContainer(
          mockContainerElement,
          {},
          { layoutConfig: { temporaryContainerHeight: '777px' } }
        );

        expect(mockContainerElement.style.height).to.equal('777px');
      });

      it('applies the compound item setting if it is configured, overriding a compound setting', () => {
        WebComponentService.setTemporaryHeightForCompoundItemContainer(
          mockContainerElement,
          { lazyLoadingOptions: { temporaryContainerHeight: '666px' } },
          { layoutConfig: { temporaryContainerHeight: '777px' } }
        );

        expect(mockContainerElement.style.height).to.equal('777px');
      });
    });

    describe('removeTemporaryHeightFromCompoundItemContainer', () => {
      let mockWcContainerDataGet;
      let mockContainerElement;

      beforeEach(() => {
        mockWcContainerDataGet = jest.spyOn(WebComponentService.wcContainerData, 'get');
        mockContainerElement = {
          style: {
            removeProperty: jest.fn()
          }
        };
      });

      afterEach(() => {
        mockWcContainerDataGet.mockRestore();
      });

      it('removes the height style property', () => {
        mockWcContainerDataGet.mockReturnValue({});

        WebComponentService.removeTemporaryHeightFromCompoundItemContainer(mockContainerElement);

        expect(mockContainerElement.style.removeProperty.mock.calls).to.have.lengthOf(1);
      });

      it('does not remove the height style property if noTemporaryContainerHeight is set', () => {
        mockWcContainerDataGet.mockReturnValue({ noTemporaryContainerHeight: true });

        WebComponentService.removeTemporaryHeightFromCompoundItemContainer(mockContainerElement);

        expect(mockContainerElement.style.removeProperty.mock.calls).to.have.lengthOf(0);
      });
    });

    describe('createIntersectionObserver', () => {
      beforeEach(() => {
        globalThis.IntersectionObserver = jest.fn(function IntersectionObserver(callback, options) {
          this.callback = callback;
          this.options = options;
          this.observe = jest.fn();
        });
      });

      afterEach(() => {
        delete globalThis.IntersectionObserver;
      });

      it('correctly applies intersectionRootMargin', () => {
        const observer = WebComponentService.createIntersectionObserver({
          compound: {
            lazyLoadingOptions: {
              enabled: true,
              intersectionRootMargin: '50px'
            }
          }
        });

        expect(observer.options.rootMargin).to.equal('50px');
      });

      it('correctly applies the fallback if intersectionRootMargin is not set', () => {
        const observer = WebComponentService.createIntersectionObserver({
          compound: {
            lazyLoadingOptions: {
              enabled: true
            }
          }
        });

        expect(observer.options.rootMargin).to.equal('0px');
      });
    });

    describe('attachWC with lazy loading', () => {
      let container;
      let itemPlaceholder;
      let mockedRemoveTemporaryHeightFromCompoundItemContainer;
      let extendedContext;

      beforeEach(() => {
        window.Luigi = {
          navigation: 'mock1',
          ux: 'mock2',
          i18n: () => LuigiI18N
        };
        container = document.createElement('div');
        itemPlaceholder = document.createElement('div');
        extendedContext = { context: { someValue: true } };
        mockedRemoveTemporaryHeightFromCompoundItemContainer = jest.spyOn(
          WebComponentService,
          'removeTemporaryHeightFromCompoundItemContainer'
        );
      });

      afterEach(() => {
        mockedRemoveTemporaryHeightFromCompoundItemContainer.mockRestore();
        delete window.Luigi;
      });

      it('does not call removeTemporaryHeightFromCompoundItemContainer if lazy loading is off', () => {
        container.appendChild(itemPlaceholder);
        WebComponentService.attachWC('div', itemPlaceholder, container, extendedContext);

        expect(mockedRemoveTemporaryHeightFromCompoundItemContainer.mock.calls).to.have.lengthOf(0);
      });

      it('calls removeTemporaryHeightFromCompoundItemContainer if lazy loading is on', () => {
        container.appendChild(itemPlaceholder);
        WebComponentService.attachWC(
          'div',
          itemPlaceholder,
          container,
          extendedContext,
          undefined,
          undefined,
          undefined,
          true
        );

        expect(mockedRemoveTemporaryHeightFromCompoundItemContainer.mock.calls).to.have.lengthOf(1);
      });
    });

    describe('renderWebComponent with lazy loading', () => {
      let mockAttachWc;
      let mockRegisterWcFromUrl;
      let viewUrl;
      let ctx;
      let node;
      let container;

      beforeEach(() => {
        viewUrl = 'someurl';
        ctx = { someValue: true };
        node = {};
        container = document.createElement('div');
        mockAttachWc = jest.spyOn(WebComponentService, 'attachWC');
        mockRegisterWcFromUrl = jest.spyOn(WebComponentService, 'registerWCFromUrl');
      });

      afterEach(() => {
        mockAttachWc.mockRestore();
        mockRegisterWcFromUrl.mockRestore();
      });

      it('passes on isLazyLoading in case wc already exists', (done) => {
        customElementsGetSpy.mockReturnValue(true);

        mockAttachWc.mockImplementation((_1, _2, _3, _4, _5, _6, _7, isLazyLoading) => {
          expect(isLazyLoading).to.equal(true);
          done();
        });

        WebComponentService.renderWebComponent(viewUrl, container, ctx, node, undefined, undefined, true);
      });

      it('passes on isLazyLoading in case of custom function', (done) => {
        customElementsGetSpy.mockReturnValue(false);
        mockAttachWc.mockImplementation((_1, _2, _3, _4, _5, _6, _7, isLazyLoading) => {
          expect(isLazyLoading).to.equal(true);
          delete window.luigiWCFn;
          done();
        });

        window.luigiWCFn = (viewUrl, wc_id, wc_container, cb) => {
          cb();
        };

        WebComponentService.renderWebComponent(viewUrl, container, ctx, node, undefined, undefined, true);
      });

      it('passes on isLazyLoading in case of new wc', (done) => {
        customElementsGetSpy.mockReturnValue(false);
        mockAttachWc.mockImplementation((_1, _2, _3, _4, _5, _6, _7, isLazyLoading) => {
          expect(isLazyLoading).to.equal(true);
          done();
        });
        mockRegisterWcFromUrl.mockImplementation(() => Promise.resolve());

        WebComponentService.renderWebComponent(viewUrl, container, ctx, node, undefined, undefined, true);
      });
    });

    describe('renderWebComponentCompound with lazy loading', () => {
      let mockRenderWebComponent;
      let mockRegisterWcFromUrl;
      let mockSetTemporaryHeight;
      let navNode;
      let extendedContext;
      let wc_container;

      beforeEach(() => {
        globalThis.IntersectionObserver = jest.fn(function IntersectionObserver(callback, options) {
          this.callback = callback;
          this.options = options;
          this.observe = jest.fn();
        });
        customElementsGetSpy.mockReturnValue(false);

        extendedContext = { context: { key: 'value', mario: 'luigi' } };
        wc_container = document.createElement('div');
        navNode = {
          compound: {
            lazyLoadingOptions: {
              enabled: true,
              intersectionRootMargin: '50px'
            },
            eventListeners: [
              {
                source: '*',
                name: 'emitterId',
                action: 'update',
                dataConverter: (data) => {
                  return 'new text: ' + data;
                }
              }
            ],
            children: [
              {
                viewUrl: 'mfe1.js',
                context: {
                  title: 'My Awesome Grid'
                },
                layoutConfig: {
                  row: '1',
                  column: '1 / -1'
                },
                eventListeners: [
                  {
                    source: 'emitterId',
                    name: 'emitterId',
                    action: 'update',
                    dataConverter: (data) => {
                      return 'new text: ' + data;
                    }
                  }
                ]
              },
              {
                id: 'emitterId',
                viewUrl: 'mfe2.js',
                context: {
                  title: 'Some input',
                  instant: true
                }
              }
            ]
          }
        };
        mockRenderWebComponent = jest.spyOn(WebComponentService, 'renderWebComponent');
        mockRegisterWcFromUrl = jest.spyOn(WebComponentService, 'registerWCFromUrl').mockResolvedValue();
        mockSetTemporaryHeight = jest.spyOn(WebComponentService, 'setTemporaryHeightForCompoundItemContainer');
      });

      afterEach(() => {
        mockRenderWebComponent.mockRestore();
        mockRegisterWcFromUrl.mockRestore();
        mockSetTemporaryHeight.mockRestore();
        delete globalThis.IntersectionObserver;
      });

      it('renders a flat compound with lazy loading', (done) => {
        WebComponentService.renderWebComponentCompound(navNode, wc_container, extendedContext)
          .then(() => {
            expect(globalThis.IntersectionObserver.mock.instances).to.have.lengthOf(1);

            const intersectionObserverInstance = globalThis.IntersectionObserver.mock.instances[0];

            expect(intersectionObserverInstance.observe.mock.calls).to.have.lengthOf(2);
            expect(mockSetTemporaryHeight.mock.calls).to.have.lengthOf(2);
            done();
          })
          .catch((reason) => {
            done(reason);
          });
      });

      it('renders a nested compound', (done) => {
        const mockInitWc = jest.spyOn(WebComponentService, 'initWC').mockReturnValue();

        navNode.viewUrl = 'mfe.js';
        navNode.webcomponent = true;

        WebComponentService.renderWebComponentCompound(navNode, wc_container, extendedContext)
          .then(() => {
            expect(globalThis.IntersectionObserver.mock.instances).to.have.lengthOf(1);

            const intersectionObserverInstance = globalThis.IntersectionObserver.mock.instances[0];

            expect(intersectionObserverInstance.observe.mock.calls).to.have.lengthOf(2);
            expect(mockSetTemporaryHeight.mock.calls).to.have.lengthOf(2);

            mockInitWc.mockRestore();
            done();
          })
          .catch((reason) => {
            done(reason);
          });
      });

      it('passes intersectionRootMargin to IntersectionObserver', (done) => {
        WebComponentService.renderWebComponentCompound(navNode, wc_container, extendedContext)
          .then(() => {
            // expect(globalThis.IntersectionObserver.options).to.be.an('object');
            const intersectionObserverInstance = globalThis.IntersectionObserver.mock.instances[0];
            expect(intersectionObserverInstance.options).to.be.an('object');
            expect(intersectionObserverInstance.options.rootMargin).to.equal('50px');
            done();
          })
          .catch((reason) => {
            done(reason);
          });
      });
    });
  });
});
