import { uxManager } from '../src/uxManager';
import { lifecycleManager } from '../src/lifecycleManager';
import { helpers } from '../src/helpers';

describe('UxManager', () => {
  let sendPostMessageSpy;

  beforeEach(() => {
    sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
    lifecycleManager.currentContext = {
      context: {},
      internal: {
        currentLocale: 'en',
        currentTheme: 'sap_fiori_3',
        splitView: false,
        modal: false,
        drawer: false,
        cssVariables: {}
      }
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.querySelectorAll('head style[luigi-injected]').forEach((el) => el.remove());
  });

  describe('showLoadingIndicator', () => {
    it('sends show-loading-indicator message', () => {
      uxManager.showLoadingIndicator();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.show-loading-indicator'
      });
    });
  });

  describe('hideLoadingIndicator', () => {
    it('sends hide-loading-indicator message', () => {
      uxManager.hideLoadingIndicator();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.hide-loading-indicator'
      });
    });
  });

  describe('closeCurrentModal', () => {
    it('sends close-modal message', () => {
      uxManager.closeCurrentModal();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.close-modal'
      });
    });
  });

  describe('addBackdrop', () => {
    it('sends add-backdrop message', () => {
      uxManager.addBackdrop();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.add-backdrop'
      });
    });
  });

  describe('removeBackdrop', () => {
    it('sends remove-backdrop message', () => {
      uxManager.removeBackdrop();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.remove-backdrop'
      });
    });
  });

  describe('setDirtyStatus', () => {
    it('sends dirty status as true', () => {
      uxManager.setDirtyStatus(true);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.set-page-dirty',
        dirty: true
      });
    });

    it('sends dirty status as false', () => {
      uxManager.setDirtyStatus(false);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.set-page-dirty',
        dirty: false
      });
    });
  });

  describe('showConfirmationModal', () => {
    it('sends confirmation modal show message with settings', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const settings = {
        type: 'confirmation',
        header: 'Confirmation',
        body: 'Are you sure?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No'
      };

      uxManager.showConfirmationModal(settings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.ux.confirmationModal.show',
        data: { settings }
      });
    });

    it('returns a promise', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const result = uxManager.showConfirmationModal({});

      expect(result).toBeInstanceOf(Promise);
    });

    it('registers a listener for modal hide event', () => {
      const addEventListenerSpy = jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      uxManager.showConfirmationModal({});

      expect(addEventListenerSpy).toHaveBeenCalledWith('luigi.ux.confirmationModal.hide', expect.any(Function));
    });
  });

  describe('hideConfirmationModal', () => {
    it('resolves promise when confirmed', () => {
      const resolveFn = jest.fn();
      const rejectFn = jest.fn();
      uxManager.setPromise('confirmationModal', { resolveFn, rejectFn });

      uxManager.hideConfirmationModal({ confirmed: true });

      expect(resolveFn).toHaveBeenCalled();
      expect(rejectFn).not.toHaveBeenCalled();
    });

    it('rejects promise when dismissed', () => {
      const resolveFn = jest.fn();
      const rejectFn = jest.fn();
      uxManager.setPromise('confirmationModal', { resolveFn, rejectFn });

      uxManager.hideConfirmationModal({ confirmed: false });

      expect(rejectFn).toHaveBeenCalled();
      expect(resolveFn).not.toHaveBeenCalled();
    });

    it('clears the promise after resolution', () => {
      const resolveFn = jest.fn();
      const rejectFn = jest.fn();
      uxManager.setPromise('confirmationModal', { resolveFn, rejectFn });

      uxManager.hideConfirmationModal({ confirmed: true });

      expect(uxManager.getPromise('confirmationModal')).toBeUndefined();
    });

    it('does nothing when no promise is set', () => {
      uxManager.setPromise('confirmationModal', undefined);
      expect(() => uxManager.hideConfirmationModal({ confirmed: true })).not.toThrow();
    });
  });

  describe('showAlert', () => {
    it('sends alert show message with settings', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(12345);

      const settings = { text: 'Alert text', type: 'info' };
      uxManager.showAlert(settings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.ux.alert.show',
        data: { settings: expect.objectContaining({ text: 'Alert text', type: 'info', id: 12345 }) }
      });
    });

    it('returns a promise', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(99999);

      const result = uxManager.showAlert({ text: 'test', type: 'info' });
      expect(result).toBeInstanceOf(Promise);
    });

    it('warns and clears closeAfter when value is less than 100', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(55555);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const settings = { text: 'test', type: 'warning', closeAfter: 50 };
      uxManager.showAlert(settings);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("has too small 'closeAfter' value"));
      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.ux.alert.show',
        data: { settings: expect.objectContaining({ closeAfter: undefined }) }
      });
    });

    it('keeps closeAfter when value is 100 or more', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(77777);

      const settings = { text: 'test', type: 'info', closeAfter: 3000 };
      uxManager.showAlert(settings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.ux.alert.show',
        data: { settings: expect.objectContaining({ closeAfter: 3000 }) }
      });
    });

    it('registers a listener for alert hide event', () => {
      const addEventListenerSpy = jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(11111);

      uxManager.showAlert({ text: 'test', type: 'info' });

      expect(addEventListenerSpy).toHaveBeenCalledWith('luigi.ux.alert.hide', expect.any(Function));
    });
  });

  describe('hideAlert', () => {
    it('resolves alert promise with dismissKey when provided', () => {
      const resolveFn = jest.fn();
      const alerts = { 'alert-1': { resolveFn } };
      uxManager.setPromise('alerts', alerts);

      uxManager.hideAlert({ id: 'alert-1', dismissKey: 'neverShowAgain' });

      expect(resolveFn).toHaveBeenCalledWith('neverShowAgain');
    });

    it('resolves alert promise with id when no dismissKey', () => {
      const resolveFn = jest.fn();
      const alerts = { 'alert-2': { resolveFn } };
      uxManager.setPromise('alerts', alerts);

      uxManager.hideAlert({ id: 'alert-2' });

      expect(resolveFn).toHaveBeenCalledWith('alert-2');
    });

    it('removes alert from promises after hiding', () => {
      const resolveFn = jest.fn();
      const alerts = { 'alert-3': { resolveFn }, 'alert-4': { resolveFn: jest.fn() } };
      uxManager.setPromise('alerts', alerts);

      uxManager.hideAlert({ id: 'alert-3' });

      const remaining = uxManager.getPromise('alerts');
      expect(remaining['alert-3']).toBeUndefined();
      expect(remaining['alert-4']).toBeDefined();
    });

    it('does nothing when alert id does not exist', () => {
      const alerts = {};
      uxManager.setPromise('alerts', alerts);

      expect(() => uxManager.hideAlert({ id: 'nonexistent' })).not.toThrow();
    });
  });

  describe('getCurrentLocale', () => {
    it('returns current locale from context', () => {
      lifecycleManager.currentContext.internal.currentLocale = 'de';
      expect(uxManager.getCurrentLocale()).toBe('de');
    });

    it('returns undefined when no internal context', () => {
      lifecycleManager.currentContext = {};
      expect(uxManager.getCurrentLocale()).toBeUndefined();
    });
  });

  describe('setCurrentLocale', () => {
    it('sends set-current-locale message', () => {
      uxManager.setCurrentLocale('fr');

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.ux.set-current-locale',
        data: { currentLocale: 'fr' }
      });
    });

    it('does not send message when locale is empty', () => {
      uxManager.setCurrentLocale('');
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('does not send message when locale is null', () => {
      uxManager.setCurrentLocale(null);
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('does not send message when locale is undefined', () => {
      uxManager.setCurrentLocale(undefined);
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });
  });

  describe('isSplitView', () => {
    it('returns true when inside a split view', () => {
      lifecycleManager.currentContext.internal.splitView = true;
      expect(uxManager.isSplitView()).toBe(true);
    });

    it('returns false when not inside a split view', () => {
      lifecycleManager.currentContext.internal.splitView = false;
      expect(uxManager.isSplitView()).toBe(false);
    });
  });

  describe('isModal', () => {
    it('returns true when inside a modal', () => {
      lifecycleManager.currentContext.internal.modal = true;
      expect(uxManager.isModal()).toBe(true);
    });

    it('returns false when not inside a modal', () => {
      lifecycleManager.currentContext.internal.modal = false;
      expect(uxManager.isModal()).toBe(false);
    });
  });

  describe('isDrawer', () => {
    it('returns true when inside a drawer', () => {
      lifecycleManager.currentContext.internal.drawer = true;
      expect(uxManager.isDrawer()).toBe(true);
    });

    it('returns false when not inside a drawer', () => {
      lifecycleManager.currentContext.internal.drawer = false;
      expect(uxManager.isDrawer()).toBe(false);
    });
  });

  describe('getCurrentTheme', () => {
    it('returns the current theme', () => {
      lifecycleManager.currentContext.internal.currentTheme = 'sap_fiori_3_dark';
      expect(uxManager.getCurrentTheme()).toBe('sap_fiori_3_dark');
    });

    it('returns undefined when no internal context', () => {
      lifecycleManager.currentContext = {};
      expect(uxManager.getCurrentTheme()).toBeUndefined();
    });
  });

  describe('getCSSVariables', () => {
    it('returns CSS variables from context', () => {
      lifecycleManager.currentContext.internal.cssVariables = {
        '--primary-color': '#000',
        '--bg-color': '#fff'
      };

      expect(uxManager.getCSSVariables()).toEqual({
        '--primary-color': '#000',
        '--bg-color': '#fff'
      });
    });

    it('returns empty object when no CSS variables', () => {
      lifecycleManager.currentContext.internal.cssVariables = undefined;
      expect(uxManager.getCSSVariables()).toEqual({});
    });

    it('returns empty object when no internal context', () => {
      lifecycleManager.currentContext = {};
      expect(uxManager.getCSSVariables()).toEqual({});
    });
  });

  describe('applyCSS', () => {
    it('injects a style tag with CSS variables into head', () => {
      lifecycleManager.currentContext.internal.cssVariables = {
        '--primary-color': '#000',
        'bg-color': '#fff'
      };

      uxManager.applyCSS();

      const styleTag = document.querySelector('head style[luigi-injected]');
      expect(styleTag).not.toBeNull();
      expect(styleTag.innerHTML).toContain('--primary-color:#000');
      expect(styleTag.innerHTML).toContain('--bg-color:#fff');
      expect(styleTag.innerHTML).toContain(':root');
    });

    it('does not prepend -- if variable already starts with --', () => {
      lifecycleManager.currentContext.internal.cssVariables = {
        '--my-var': 'blue'
      };

      uxManager.applyCSS();

      const styleTag = document.querySelector('head style[luigi-injected]');
      expect(styleTag.innerHTML).toContain('--my-var:blue');
      expect(styleTag.innerHTML).not.toContain('----my-var');
    });

    it('prepends -- if variable does not start with --', () => {
      lifecycleManager.currentContext.internal.cssVariables = {
        'my-var': 'red'
      };

      uxManager.applyCSS();

      const styleTag = document.querySelector('head style[luigi-injected]');
      expect(styleTag.innerHTML).toContain('--my-var:red');
    });

    it('removes previously injected style tags before applying', () => {
      const existingStyle = document.createElement('style');
      existingStyle.setAttribute('luigi-injected', true);
      existingStyle.innerHTML = ':root { --old: value; }';
      document.head.appendChild(existingStyle);

      lifecycleManager.currentContext.internal.cssVariables = { '--new': 'value' };
      uxManager.applyCSS();

      const styleTags = document.querySelectorAll('head style[luigi-injected]');
      expect(styleTags.length).toBe(1);
      expect(styleTags[0].innerHTML).toContain('--new:value');
      expect(styleTags[0].innerHTML).not.toContain('--old');
    });

    it('does not inject style tag when no CSS variables exist', () => {
      lifecycleManager.currentContext.internal.cssVariables = undefined;
      uxManager.applyCSS();

      const styleTag = document.querySelector('head style[luigi-injected]');
      expect(styleTag).toBeNull();
    });
  });
});
