import { linkManager } from '../../src/core-api/_internalLinkManager';
import { GenericHelpers } from '../../src/utilities/helpers';

const sinon = require('sinon');
let lm;

describe('linkManager', function () {
  beforeEach(() => {
    lm = new linkManager();
  });

  afterEach(() => {
    sinon.reset();
    sinon.restore();
  });

  describe('navigate', () => {
    beforeEach(() => {
      sinon.stub(lm, 'sendPostMessageToLuigiCore');
      console.warn = sinon.spy();
    });

    it('should not open a drawer if path is absolute', () => {
      lm.openAsDrawer('/').catch((e) => {});

      sinon.assert.notCalled(lm.sendPostMessageToLuigiCore);
      sinon.assert.calledOnce(console.warn);
    });
    it('should not open a modal if path is absolute', () => {
      lm.openAsModal('/').catch((e) => {});

      sinon.assert.notCalled(lm.sendPostMessageToLuigiCore);
      sinon.assert.calledOnce(console.warn);
    });

    it('should navigate if path starts with a "/" but is not an absolute path', () => {
      lm.navigate('/pr1');

      sinon.assert.calledOnce(lm.sendPostMessageToLuigiCore);
    });

    it('should not navigate if errorSkipNavigation is true', () => {
      lm.options.errorSkipNavigation = true;
      lm.navigate('http://google.co').catch((e) => {});

      sinon.assert.notCalled(lm.sendPostMessageToLuigiCore);
      sinon.assert.match(lm.options.errorSkipNavigation, false);
    });

    it('should call sendPostMessageToLuigiCore', () => {
      const options = {
        preserveView: false,
        nodeParams: {},
        errorSkipNavigation: false,
        fromContext: null,
        fromClosestContext: false,
        relative: false,
        link: ''
      };
      const modalSettings = { modalSetting: 'modalValue' };
      const splitViewSettings = { splitViewSetting: 'splitViewValue' };
      const drawerSettings = { drawerSetting: 'drawerValue' };
      const path = '/path';
      const relativePath = path[0] !== '/';
      const navigationOpenMsg = {
        msg: 'luigi.navigation.open',
        params: Object.assign(options, {
          link: path,
          relative: relativePath,
          modal: modalSettings,
          splitView: splitViewSettings,
          drawer: drawerSettings
        })
      };

      lm.navigate(path, true, modalSettings, splitViewSettings, drawerSettings);
      lm.sendPostMessageToLuigiCore.calledOnceWithExactly(navigationOpenMsg);
    });

    it('should call sendPostMessageToLuigiCore with Promise', () => {
      const options = {
        preserveView: false,
        nodeParams: {},
        errorSkipNavigation: false,
        fromContext: null,
        fromClosestContext: false,
        relative: false,
        link: ''
      };
      const remotePromise = GenericHelpers.createRemotePromise();
      const modalSettings = { modalSetting: 'modalValue' };
      const splitViewSettings = { splitViewSetting: 'splitViewValue' };
      const drawerSettings = { drawerSetting: 'drawerValue' };
      const path = '/path';
      const relativePath = path[0] !== '/';
      const navigationOpenMsg = {
        msg: 'luigi.navigation.open',
        params: Object.assign(options, {
          link: path,
          relative: relativePath,
          modal: modalSettings,
          splitView: splitViewSettings,
          drawer: drawerSettings
        }),
        remotePromiseId: remotePromise.id
      };

      lm.navigate(path, true, modalSettings, splitViewSettings, drawerSettings);
      lm.sendPostMessageToLuigiCore.calledOnceWithExactly(navigationOpenMsg);
    });
  });

  describe('navigateToIntent', () => {
    beforeEach(() => {
      sinon.stub(lm, 'sendPostMessageToLuigiCore');
      console.warn = sinon.spy();
    });

    it.each([
      { slug: null, params: null },
      { slug: 'Sales-settings', params: null },
      { slug: null, params: { project: 'pr2', user: 'john' } },
      { slug: 'Sales-settings', params: { project: 'pr2', user: 'john' } }
    ])('should call sendPostMessageToLuigiCore', (data) => {
      const options = {
        preserveView: false,
        nodeParams: {},
        errorSkipNavigation: false,
        fromContext: null,
        fromClosestContext: false,
        relative: false,
        link: ''
      };
      const modalSettings = { modalSetting: 'modalValue' };
      const splitViewSettings = { splitViewSetting: 'splitViewValue' };
      const drawerSettings = { drawerSetting: 'drawerValue' };
      const relativePath = !!(data.slug && data.slug[0] !== '/');
      let payloadLink = `#?intent=${data.slug}`;

      if (data.params && Object.keys(data.params)?.length) {
        const paramList = Object.entries(data.params);

        if (paramList.length > 0) {
          payloadLink += '?';

          for (const [key, value] of paramList) {
            payloadLink += key + '=' + value + '&';
          }

          payloadLink = payloadLink.slice(0, -1);
        }
      }

      const navigationOpenMsg = {
        msg: 'luigi.navigation.open',
        params: Object.assign(options, {
          link: payloadLink,
          relative: relativePath,
          modal: modalSettings,
          splitView: splitViewSettings,
          drawer: drawerSettings
        })
      };

      lm.navigateToIntent(data.slug, data.params);
      lm.sendPostMessageToLuigiCore.calledOnceWithExactly(navigationOpenMsg);
    });
  });

  describe('openAsModal', () => {
    beforeEach(() => {
      sinon.stub(lm, 'navigate');
    });

    it('calls navigate', () => {
      lm.openAsModal('path');

      sinon.assert.calledOnce(lm.navigate);
    });

    it('calls openAsModal with callback', () => {
      const prom = new Promise((resolve) => {
        resolve();
      });
      prom.id = 1;

      sinon.stub(GenericHelpers, 'isFunction').returns(true);
      sinon.stub(GenericHelpers, 'createRemotePromise').returns(prom);

      lm.openAsModal('path', { size: 1 }, () => {});

      sinon.assert.calledOnce(GenericHelpers.isFunction);
      sinon.assert.calledOnce(GenericHelpers.createRemotePromise);
      sinon.assert.calledOnceWithExactly(lm.navigate, 'path', true, { size: 1, onClosePromiseId: 1 });
    });

    it('calls openAsModal with wrong callback', () => {
      sinon.stub(GenericHelpers, 'isFunction').returns(false);

      lm.openAsModal('path', { size: 1 }, 'not a function');

      sinon.assert.calledOnce(GenericHelpers.isFunction);
      sinon.assert.calledOnceWithExactly(lm.navigate, 'path', true, { size: 1 });
    });
  });

  describe('openAsDrawer', () => {
    beforeEach(() => {
      sinon.stub(lm, 'navigate');
    });

    it('calls navigate', () => {
      lm.openAsDrawer('path');

      sinon.assert.calledOnce(lm.navigate);
    });
  });

  describe('fromContext', () => {
    beforeEach(() => {
      sinon.stub(lm, 'fromContext');
    });

    it('should set fromContext option to passed parameter navigationContext', () => {
      const navigationContext = '';

      lm.fromContext(navigationContext);

      sinon.assert.calledOnce(lm.fromContext);
    });
  });

  describe('fromClosestContext', () => {
    it('should set fromContext to null and fromClosestContext to true', () => {
      lm.fromClosestContext();

      sinon.assert.match(lm.options.fromContext, null);
      sinon.assert.match(lm.options.fromClosestContext, true);
    });
  });

  describe('fromVirtualTreeRoot', () => {
    it('should set fromContext to null', () => {
      lm.fromVirtualTreeRoot();

      sinon.assert.match(lm.options.fromContext, null);
    });

    it('should set fromClosestContext to false', () => {
      lm.fromVirtualTreeRoot();

      sinon.assert.match(lm.options.fromClosestContext, false);
    });

    it('should set fromVirtualTreeRoot to true', () => {
      lm.fromVirtualTreeRoot();

      sinon.assert.match(lm.options.fromVirtualTreeRoot, true);
    });
  });

  describe('withParams', () => {
    it('should assign passed value to this.options.nodeParams', () => {
      lm.withParams({ param: 'value' });

      sinon.assert.match(lm.options.nodeParams, { param: 'value' });
    });
  });

  describe('withOptions', () => {
    it('should set preventHistoryEntry option', () => {
      const result = lm.withOptions({ preventHistoryEntry: true });

      sinon.assert.match(result, lm);
      sinon.assert.match(lm.options.preventHistoryEntry, true);
    });

    it('should set preventContextUpdate option', () => {
      const result = lm.withOptions({ preventContextUpdate: true });

      sinon.assert.match(result, lm);
      sinon.assert.match(lm.options.preventContextUpdate, true);
    });

    it('should set both options together', () => {
      lm.withOptions({ preventHistoryEntry: true, preventContextUpdate: true });

      sinon.assert.match(lm.options.preventHistoryEntry, true);
      sinon.assert.match(lm.options.preventContextUpdate, true);
    });

    it('should keep default values when options are not provided', () => {
      lm.withOptions({});

      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
    });

    it('should ignore unknown options', () => {
      lm.withOptions({ foo: 'bar' });

      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
      sinon.assert.match(lm.options.foo, undefined);
    });

    it('should allow explicitly setting options to false', () => {
      lm.options.preventHistoryEntry = true;
      lm.options.preventContextUpdate = true;

      lm.withOptions({ preventHistoryEntry: false, preventContextUpdate: false });

      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
    });

    it('should return instance without modifying when a non-object is passed', () => {
      const result = lm.withOptions('invalid');

      sinon.assert.match(result, lm);
      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
    });

    it('should return instance without modifying when null is passed', () => {
      const result = lm.withOptions(null);

      sinon.assert.match(result, lm);
      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
    });

    it('should return instance without modifying when undefined is passed', () => {
      const result = lm.withOptions();

      sinon.assert.match(result, lm);
      sinon.assert.match(lm.options.preventHistoryEntry, false);
      sinon.assert.match(lm.options.preventContextUpdate, false);
    });

    it('should pass options to sendPostMessageToLuigiCore when chained with navigate', () => {
      sinon.stub(lm, 'sendPostMessageToLuigiCore');

      lm.withOptions({ preventHistoryEntry: true, preventContextUpdate: true }).navigate('/overview');

      sinon.assert.calledOnce(lm.sendPostMessageToLuigiCore);
      const sentMsg = lm.sendPostMessageToLuigiCore.getCall(0).args[0];
      sinon.assert.match(sentMsg.msg, 'luigi.navigation.open');
      sinon.assert.match(sentMsg.params.preventHistoryEntry, true);
      sinon.assert.match(sentMsg.params.preventContextUpdate, true);
      sinon.assert.match(sentMsg.params.link, '/overview');
    });
  });

  describe('goBack', () => {
    beforeEach(() => {
      sinon.stub(lm, 'sendPostMessageToLuigiCore');
    });

    it('should call sendPostMessageToLuigiCore', () => {
      const goBackValue = 'message';
      const message = {
        msg: 'luigi.navigation.back',
        goBackContext: '"message"'
      };

      lm.goBack(goBackValue);

      sinon.assert.calledOnceWithExactly(lm.sendPostMessageToLuigiCore, message);
    });
  });

  describe('sendPostMessageToLuigiCore', () => {
    beforeEach(() => {
      sinon.stub(window, 'postMessage');
    });

    it('should call window.postMessage with the msg', () => {
      const msg = 'message';

      lm.sendPostMessageToLuigiCore(msg);

      sinon.assert.calledOnceWithExactly(window.postMessage, msg, '*');
    });
  });
});
