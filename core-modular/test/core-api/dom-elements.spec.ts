import { Elements } from '../../src/core-api/dom-elements';
import type { Luigi } from '../../src/core-api/luigi';
import { UIModule } from '../../src/modules/ui-module';
import { GenericHelpers } from '../../src/utilities/helpers/generic-helpers';
import { LuigiContainerHelpers } from '../../src/utilities/helpers/luigi-container-helpers';

jest.mock('../../src/modules/ui-module', () => ({
  UIModule: {
    modalContainer: []
  }
}));

jest.mock('../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
    isElementVisible: jest.fn()
  }
}));

jest.mock('../../src/utilities/helpers/luigi-container-helpers', () => ({
  LuigiContainerHelpers: {
    getMicrofrontendsInDom: jest.fn()
  }
}));

const mockUIModule = UIModule as jest.Mocked<typeof UIModule>;
const mockIsElementVisible = GenericHelpers.isElementVisible as jest.Mock;
const mockGetMicrofrontendsInDom = LuigiContainerHelpers.getMicrofrontendsInDom as jest.Mock;

function makeLuigi(overrides: {
  shellbarElement?: HTMLElement | null;
  shellbarActions?: HTMLElement | null;
  luigiContainer?: HTMLElement | null;
  navFooterContainer?: HTMLElement | null;
  containerWrapper?: { childNodes: any[]; children: any[] } | null;
} = {}): Luigi {
  const supportedElements = {
    getShellbarElement: () => overrides.shellbarElement ?? null,
    getShellbarActions: () => overrides.shellbarActions ?? null,
    getLuigiContainer: () => overrides.luigiContainer ?? null,
    getNavFooterContainer: () => overrides.navFooterContainer ?? null
  };
  return {
    getEngine: () => ({
      _connector: {
        getCoreAPISupportedElements: () => supportedElements,
        getContainerWrapper: () => overrides.containerWrapper ?? null
      }
    })
  } as unknown as Luigi;
}

describe('Elements', () => {
  let elements: Elements;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUIModule.modalContainer = [];
    mockIsElementVisible.mockReturnValue(false);
  });

  describe('getShellbar', () => {
    it('returns the shellbar element', () => {
      const shellbar = document.createElement('div');
      elements = new Elements(makeLuigi({ shellbarElement: shellbar }));
      expect(elements.getShellbar()).toBe(shellbar);
    });

    it('returns null if connector is not available', () => {
      const luigi = { getEngine: () => ({ _connector: null }) } as unknown as Luigi;
      elements = new Elements(luigi);
      expect(elements.getShellbar()).toBeNull();
    });

    it('returns null if shellbar element is not available', () => {
      elements = new Elements(makeLuigi({ shellbarElement: null }));
      expect(elements.getShellbar()).toBeNull();
    });
  });

  describe('getShellbarActions', () => {
    it('returns the shellbar actions element', () => {
      const actions = document.createElement('div');
      elements = new Elements(makeLuigi({ shellbarActions: actions }));
      expect(elements.getShellbarActions()).toBe(actions);
    });

    it('returns null if shellbar actions element is not available', () => {
      elements = new Elements(makeLuigi({ shellbarActions: null }));
      expect(elements.getShellbarActions()).toBeNull();
    });
  });

  describe('getLuigiContainer', () => {
    it('returns the Luigi container element', () => {
      const container = document.createElement('div');
      elements = new Elements(makeLuigi({ luigiContainer: container }));
      expect(elements.getLuigiContainer()).toBe(container);
    });

    it('returns null if Luigi container is not available', () => {
      elements = new Elements(makeLuigi({ luigiContainer: null }));
      expect(elements.getLuigiContainer()).toBeNull();
    });
  });

  describe('getNavFooterContainer', () => {
    it('returns the nav footer container element', () => {
      const footer = document.createElement('div');
      elements = new Elements(makeLuigi({ navFooterContainer: footer }));
      expect(elements.getNavFooterContainer()).toBe(footer);
    });

    it('returns null if nav footer container is not available', () => {
      elements = new Elements(makeLuigi({ navFooterContainer: null }));
      expect(elements.getNavFooterContainer()).toBeNull();
    });
  });

  describe('getMicrofrontends', () => {
    it('delegates to LuigiContainerHelpers.getMicrofrontendsInDom', () => {
      const mockResult = [{ id: 'mf1', active: true, container: document.createElement('div'), type: 'main' }];
      mockGetMicrofrontendsInDom.mockReturnValue(mockResult);
      const luigi = makeLuigi();
      elements = new Elements(luigi);

      const result = elements.getMicrofrontends();

      expect(mockGetMicrofrontendsInDom).toHaveBeenCalledWith(luigi);
      expect(result).toBe(mockResult);
    });
  });

  describe('getMicrofrontendIframes', () => {
    it('returns null if containerWrapper is not available', () => {
      elements = new Elements(makeLuigi({ containerWrapper: null }));
      expect(elements.getMicrofrontendIframes()).toBeNull();
    });

    it('returns iframes from main container only', () => {
      const iframe = document.createElement('iframe');
      const element = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe } };
      const containerWrapper = { childNodes: [element], children: [] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      const result = elements.getMicrofrontendIframes();

      expect(result).toEqual([iframe]);
    });

    it('includes modal iframes before main iframes', () => {
      const mainIframe = document.createElement('iframe');
      const modalIframe = document.createElement('iframe');
      const modalElement = { tagName: 'LUIGI-MODAL', iframeHandle: { iframe: modalIframe } };
      mockUIModule.modalContainer = [modalElement] as any;

      const mainElement = { tagName: 'LUIGI-MAIN', iframeHandle: { iframe: mainIframe } };
      const containerWrapper = { childNodes: [mainElement], children: [] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      const result = elements.getMicrofrontendIframes();

      expect(result).toEqual([modalIframe, mainIframe]);
    });

    it('skips elements without iframeHandle', () => {
      const element = { tagName: 'LUIGI-WC', iframeHandle: null };
      const containerWrapper = { childNodes: [element], children: [] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getMicrofrontendIframes()).toEqual([]);
    });

    it('skips non-LUIGI elements', () => {
      const iframe = document.createElement('iframe');
      const element = { tagName: 'DIV', iframeHandle: { iframe } };
      const containerWrapper = { childNodes: [element], children: [] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getMicrofrontendIframes()).toEqual([]);
    });

    it('returns empty array when no iframes found', () => {
      const containerWrapper = { childNodes: [], children: [] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getMicrofrontendIframes()).toEqual([]);
    });
  });

  describe('getCurrentMicrofrontendIframe', () => {
    it('returns null if containerWrapper is not available', () => {
      elements = new Elements(makeLuigi({ containerWrapper: null }));
      expect(elements.getCurrentMicrofrontendIframe()).toBeNull();
    });

    it('returns modal iframe if present (takes priority over main)', () => {
      const modalIframe = document.createElement('iframe');
      const mainIframe = document.createElement('iframe');
      mockUIModule.modalContainer = [{ iframeHandle: { iframe: modalIframe } }] as any;
      mockIsElementVisible.mockReturnValue(true);

      const mainElement = { tagName: 'LUIGI-MAIN', iframeHandle: { iframe: mainIframe } };
      const containerWrapper = { childNodes: [], children: [mainElement] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getCurrentMicrofrontendIframe()).toBe(modalIframe);
    });

    it('returns main iframe if visible and no modal', () => {
      const mainIframe = document.createElement('iframe');
      mockUIModule.modalContainer = [];
      mockIsElementVisible.mockReturnValue(true);

      const mainElement = { tagName: 'LUIGI-MAIN', iframeHandle: { iframe: mainIframe } };
      const containerWrapper = { childNodes: [], children: [mainElement] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getCurrentMicrofrontendIframe()).toBe(mainIframe);
    });

    it('returns webcomponent if visible and no iframe and no modal', () => {
      const webcomponent = document.createElement('div');
      mockUIModule.modalContainer = [];
      mockIsElementVisible.mockReturnValue(true);

      const element = {
        tagName: 'LUIGI-WC',
        iframeHandle: null,
        shadowRoot: { firstElementChild: { firstElementChild: webcomponent } }
      };
      const containerWrapper = { childNodes: [], children: [element] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getCurrentMicrofrontendIframe()).toBe(webcomponent);
    });

    it('returns null if no visible element found', () => {
      mockUIModule.modalContainer = [];
      mockIsElementVisible.mockReturnValue(false);

      const element = { tagName: 'LUIGI-MAIN', iframeHandle: { iframe: document.createElement('iframe') } };
      const containerWrapper = { childNodes: [], children: [element] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getCurrentMicrofrontendIframe()).toBeNull();
    });

    it('skips non-LUIGI elements when searching for active iframe', () => {
      mockUIModule.modalContainer = [];
      mockIsElementVisible.mockReturnValue(true);

      const element = { tagName: 'DIV', iframeHandle: { iframe: document.createElement('iframe') } };
      const containerWrapper = { childNodes: [], children: [element] };
      elements = new Elements(makeLuigi({ containerWrapper }));

      expect(elements.getCurrentMicrofrontendIframe()).toBeNull();
    });
  });
});
