import { UX } from '../../src/core-api/ux';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { serviceRegistry } from '../../src/services/service-registry';
import { UserSettingsHelper } from '../../src/utilities/helpers/usersetting-dialog-helpers';

describe('UX', () => {
  let luigiMock: any;
  let connectorMock: any;
  let dirtyStatusServiceMock: any;
  let ux: UX;

  beforeEach(() => {
    connectorMock = {
      renderAlert: jest.fn(),
      renderConfirmationModal: jest.fn(),
      setDocumentTitle: jest.fn(),
      closeUserSettings: jest.fn(),
      collapseLeftSideNav: jest.fn(),
      showLoadingIndicator: jest.fn(),
      hideLoadingIndicator: jest.fn(),
      addBackdrop: jest.fn(),
      removeBackdrop: jest.fn()
    };
    luigiMock = {
      getConfigValue: jest.fn().mockReturnValue(undefined),
      readUserSettings: jest.fn().mockResolvedValue({}),
      i18n: jest.fn().mockReturnValue({
        getTranslation: (key: string) => key
      }),
      navigation: jest.fn().mockReturnValue({ navigate: jest.fn() }),
      getEngine: jest.fn().mockReturnValue({
        _connector: connectorMock,
        _ux: undefined,
        _ui: undefined
      })
    };
    dirtyStatusServiceMock = { readDirtyStatus: jest.fn().mockReturnValue(false) };
    jest.spyOn(serviceRegistry, 'get').mockImplementation((service: any) => {
      if (service === DirtyStatusService) return dirtyStatusServiceMock;
      return {} as any;
    });
    ux = new UX(luigiMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('showAlert', () => {
    it('assigns a random id when none is provided and forwards to the connector', async () => {
      const promise = ux.showAlert({ text: 'hi', type: 'info' });
      expect(connectorMock.renderAlert).toHaveBeenCalledTimes(1);
      const [settings, handler] = connectorMock.renderAlert.mock.calls[0];
      expect(typeof settings.id).toBe('string');
      expect(settings.id.length).toBeGreaterThan(0);
      handler.close();
      await expect(promise).resolves.toBe(true);
    });

    it('keeps the provided id intact', () => {
      ux.showAlert({ id: 'my-id', text: 'x', type: 'info' });
      const [settings] = connectorMock.renderAlert.mock.calls[0];
      expect(settings.id).toBe('my-id');
    });

    it('handler.link navigates and resolves with the dismissKey', async () => {
      const navigate = jest.fn();
      luigiMock.navigation.mockReturnValue({ navigate });
      const promise = ux.showAlert({
        text: 'hi',
        type: 'info',
        links: {
          home: { elemId: 'l1', url: '/home', dismissKey: 'dismissed-home' }
        }
      });
      const [, handler] = connectorMock.renderAlert.mock.calls[0];
      expect(handler.link('home')).toBe(true);
      expect(navigate).toHaveBeenCalledWith('/home');
      await expect(promise).resolves.toBe('dismissed-home');
    });

    it('handler.link returns false for an unknown link key', () => {
      ux.showAlert({ text: 'hi', type: 'info', links: { home: { elemId: 'l1', url: '/home' } } });
      const [, handler] = connectorMock.renderAlert.mock.calls[0];
      expect(handler.link('does-not-exist')).toBe(false);
    });

    it('handler.link returns false when no links are configured', () => {
      ux.showAlert({ text: 'hi', type: 'info' });
      const [, handler] = connectorMock.renderAlert.mock.calls[0];
      expect(handler.link('home')).toBe(false);
    });

    it('handler.link returns false when the matched link has no dismissKey', () => {
      ux.showAlert({
        text: 'hi',
        type: 'info',
        links: { home: { elemId: 'l1', url: '/home' } }
      });
      const [, handler] = connectorMock.renderAlert.mock.calls[0];
      expect(handler.link('home')).toBe(false);
    });
  });

  describe('showConfirmationModal', () => {
    it('translates header/body/button labels and resolves on confirm', async () => {
      const i18n = { getTranslation: jest.fn((key: string) => `t(${key})`) };
      luigiMock.i18n.mockReturnValue(i18n);
      const promise = ux.showConfirmationModal({
        header: 'h',
        body: 'b',
        buttonConfirm: 'ok',
        buttonDismiss: 'cancel'
      });
      const [translated, handler] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(translated.header).toBe('t(h)');
      expect(translated.body).toBe('t(b)');
      expect(translated.buttonConfirm).toBe('t(ok)');
      expect(translated.buttonDismiss).toBe('t(cancel)');
      handler.confirm();
      await expect(promise).resolves.toBe(true);
    });

    it('falls back to default i18n keys when fields are omitted', () => {
      const i18n = { getTranslation: jest.fn((key: string) => key) };
      luigiMock.i18n.mockReturnValue(i18n);
      ux.showConfirmationModal({});
      const [translated] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(translated.header).toBe('luigi.confirmationModal.header');
      expect(translated.body).toBe('luigi.confirmationModal.body');
      expect(translated.buttonConfirm).toBe('luigi.button.confirm');
      expect(translated.buttonDismiss).toBe('luigi.button.dismiss');
    });

    it('rejects on dismiss', async () => {
      const promise = ux.showConfirmationModal({});
      const [, handler] = connectorMock.renderConfirmationModal.mock.calls[0];
      handler.dismiss();
      await expect(promise).rejects.toBeUndefined();
    });

    it('skips translation and still forwards when settings is falsy', async () => {
      const promise = ux.showConfirmationModal(undefined as any);
      const [forwarded, handler] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(forwarded).toBeUndefined();
      handler.confirm();
      await expect(promise).resolves.toBe(true);
    });
  });

  describe('collapseLeftSideNav', () => {
    it.each([true, false])('should set the collapsed state of the left side navigation', (state) => {
      ux.collapseLeftSideNav(state);
      expect(connectorMock.collapseLeftSideNav).toHaveBeenCalledWith(state);
    });
  });

  describe('openUserSettings', () => {
    it('does nothing when userSettings config is missing', async () => {
      luigiMock.getConfigValue.mockReturnValue(undefined);
      await ux.openUserSettings();
      expect(luigiMock.readUserSettings).not.toHaveBeenCalled();
    });

    it('reads previous settings and delegates to engine._ui.openUserSettings', async () => {
      const userSettings = {
        userSettingGroups: { profile: { label: 'Profile' } },
        userSettingsDialog: { dialogHeader: 'Custom Header' }
      };
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'userSettings') return userSettings;
        if (key === 'settings') return {};
        return undefined;
      });
      const previous = { profile: { theme: 'dark' } };
      luigiMock.readUserSettings.mockResolvedValue(previous);
      const groups = [{ profile: { label: 'Profile' } }];
      jest.spyOn(UserSettingsHelper, 'processUserSettingGroups').mockReturnValue(groups);
      const uiOpen = jest.fn();
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: undefined,
        _ui: { openUserSettings: uiOpen }
      });

      await ux.openUserSettings();

      expect(luigiMock.readUserSettings).toHaveBeenCalled();
      expect(uiOpen).toHaveBeenCalledTimes(1);
      const [dialogSettings, data, prev, luigiArg] = uiOpen.mock.calls[0];
      expect(dialogSettings).toEqual({
        dialogHeader: 'Custom Header',
        saveBtn: 'Save',
        dismissBtn: 'Cancel'
      });
      expect(data).toBe(groups);
      expect(prev).toBe(previous);
      expect(luigiArg).toBe(luigiMock);
    });

    it('uses TOP_NAV_DEFAULTS labels when userSettingsDialog is not configured', async () => {
      luigiMock.getConfigValue.mockImplementation((key: string) => {
        if (key === 'userSettings') return { userSettingGroups: {} };
        if (key === 'settings') return undefined;
        return undefined;
      });
      jest.spyOn(UserSettingsHelper, 'processUserSettingGroups').mockReturnValue([]);
      const uiOpen = jest.fn();
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: undefined,
        _ui: { openUserSettings: uiOpen }
      });

      await ux.openUserSettings();

      const [dialogSettings] = uiOpen.mock.calls[0];
      expect(dialogSettings).toEqual({
        dialogHeader: 'User Settings',
        saveBtn: 'Save',
        dismissBtn: 'Cancel'
      });
    });
  });

  describe('closeUserSettings', () => {
    it('forwards to the connector', () => {
      ux.closeUserSettings();
      expect(connectorMock.closeUserSettings).toHaveBeenCalled();
    });
  });

  describe('setDocumentTitle / getDocumentTitle', () => {
    it('setDocumentTitle updates the title store and forwards to the connector', () => {
      const setSpy = jest.fn();
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: { documentTitle: { set: setSpy, subscribe: () => () => undefined } }
      });
      ux.setDocumentTitle('My App');
      expect(setSpy).toHaveBeenCalledWith('My App');
      expect(connectorMock.setDocumentTitle).toHaveBeenCalledWith('My App');
    });

    it('getDocumentTitle returns the value from the store when set', () => {
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: { documentTitle: { $value: 'Stored Title' } }
      });
      expect(ux.getDocumentTitle()).toBe('Stored Title');
    });

    it('getDocumentTitle falls back to window.document.title when the store is empty', () => {
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: { documentTitle: { $value: undefined } }
      });
      document.title = 'Doc Title';
      expect(ux.getDocumentTitle()).toBe('Doc Title');
    });

    it('getDocumentTitle returns empty string when nothing is available', () => {
      luigiMock.getEngine.mockReturnValue({
        _connector: connectorMock,
        _ux: { documentTitle: { $value: undefined } }
      });
      document.title = '';
      expect(ux.getDocumentTitle()).toBe('');
    });
  });

  describe('hideAppLoadingIndicator', () => {
    it('is a no-op when no indicator element exists', () => {
      expect(() => ux.hideAppLoadingIndicator()).not.toThrow();
    });

    it('adds the hidden class and removes the element after the timeout', () => {
      jest.useFakeTimers();
      const el = document.createElement('div');
      el.setAttribute('luigi-app-loading-indicator', '');
      document.body.appendChild(el);

      ux.hideAppLoadingIndicator();
      expect(el.classList.contains('hidden')).toBe(true);
      expect(document.body.contains(el)).toBe(true);

      jest.advanceTimersByTime(500);
      expect(document.body.contains(el)).toBe(false);
      jest.useRealTimers();
    });
  });

  describe('loading indicator and backdrop pass-through', () => {
    it('showLoadingIndicator forwards to connector', () => {
      const container = document.createElement('div');
      ux.showLoadingIndicator(container);
      expect(connectorMock.showLoadingIndicator).toHaveBeenCalledWith(container);
    });

    it('hideLoadingIndicator forwards to connector', () => {
      const container = document.createElement('div');
      ux.hideLoadingIndicator(container);
      expect(connectorMock.hideLoadingIndicator).toHaveBeenCalledWith(container);
    });

    it('addBackdrop and removeBackdrop forward to connector', () => {
      ux.addBackdrop();
      ux.removeBackdrop();
      expect(connectorMock.addBackdrop).toHaveBeenCalled();
      expect(connectorMock.removeBackdrop).toHaveBeenCalled();
    });
  });

  describe('getDirtyStatus', () => {
    it('delegates to DirtyStatusService.readDirtyStatus', () => {
      dirtyStatusServiceMock.readDirtyStatus.mockReturnValue(true);
      const ux2 = new UX(luigiMock);
      expect(ux2.getDirtyStatus()).toBe(true);
      expect(dirtyStatusServiceMock.readDirtyStatus).toHaveBeenCalled();
    });
  });
});
