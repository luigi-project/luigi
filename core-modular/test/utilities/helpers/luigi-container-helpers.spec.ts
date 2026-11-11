import { LuigiContainerHelpers } from '../../../src/utilities/helpers/luigi-container-helpers';
import { UIModule } from '../../../src/modules/ui-module';
import { GenericHelpers } from '../../../src/utilities/helpers/generic-helpers';

jest.mock('../../../src/modules/ui-module', () => ({
  UIModule: {
    modalContainer: [],
    drawerContainer: null
  }
}));

jest.mock('../../../src/utilities/helpers/generic-helpers', () => ({
  GenericHelpers: {
    isElementVisible: jest.fn()
  }
}));

const mockUIModule = UIModule as jest.Mocked<typeof UIModule>;
const mockIsElementVisible = GenericHelpers.isElementVisible as jest.Mock;

function makeLuigiMock(containerChildren: any[]) {
  return {
    getEngine: () => ({
      _connector: {
        getContainerWrapper: () => ({ childNodes: containerChildren, children: containerChildren })
      }
    })
  } as any;
}

describe('LuigiContainerHelpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUIModule.modalContainer = [];
    mockUIModule.drawerContainer = null;
    mockIsElementVisible.mockReturnValue(true);
  });

  describe('getMainMicrofrontends', () => {
    it('returns empty array if containerWrapper is not available', () => {
      const luigi = { getEngine: () => ({ _connector: { getContainerWrapper: () => null } }) } as any;
      expect(LuigiContainerHelpers.getMainMicrofrontends(luigi)).toEqual([]);
    });

    it('returns empty array if no LUIGI- elements found', () => {
      const luigi = makeLuigiMock([{ tagName: 'DIV' }, { tagName: 'SPAN' }]);
      expect(LuigiContainerHelpers.getMainMicrofrontends(luigi)).toEqual([]);
    });

    it('returns iframe-based entry for LUIGI- element with iframeHandle', () => {
      const iframe = document.createElement('iframe');
      const element = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe }, luigiMfId: 'mf1' };
      const luigi = makeLuigiMock([element]);
      mockIsElementVisible.mockReturnValue(true);

      const result = LuigiContainerHelpers.getMainMicrofrontends(luigi);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ iframe, id: 'mf1', active: true });
    });

    it('returns webcomponent entry for LUIGI- element with shadowRoot', () => {
      const webcomponent = document.createElement('div');
      const firstElementChild = { firstElementChild: webcomponent };
      const element = {
        tagName: 'LUIGI-WC',
        iframeHandle: null,
        shadowRoot: { firstElementChild: firstElementChild },
        luigiMfId: 'mf2'
      };
      const luigi = makeLuigiMock([element]);
      mockIsElementVisible.mockReturnValue(false);

      const result = LuigiContainerHelpers.getMainMicrofrontends(luigi);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ iframe: webcomponent, id: 'mf2', active: false });
    });

    it('skips LUIGI- element if neither iframeHandle nor webcomponent found', () => {
      const element = { tagName: 'LUIGI-EMPTY', iframeHandle: null, shadowRoot: null, luigiMfId: 'mf3' };
      const luigi = makeLuigiMock([element]);

      expect(LuigiContainerHelpers.getMainMicrofrontends(luigi)).toEqual([]);
    });
  });

  describe('getModalMicrofrontends', () => {
    it('returns empty array if modalContainer is empty', () => {
      mockUIModule.modalContainer = [];
      expect(LuigiContainerHelpers.getModalMicrofrontends()).toEqual([]);
    });

    it('returns iframe-based entry for modal element with iframeHandle', () => {
      const iframe = document.createElement('iframe');
      const element = { iframeHandle: { iframe }, luigiMfId: 'modal1' };
      mockUIModule.modalContainer = [element] as any;
      mockIsElementVisible.mockReturnValue(true);

      const result = LuigiContainerHelpers.getModalMicrofrontends();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ iframe, id: 'modal1', active: true });
    });

    it('returns webcomponent entry for modal element with shadowRoot', () => {
      const webcomponent = document.createElement('div');
      const element = {
        iframeHandle: null,
        shadowRoot: { firstElementChild: { firstElementChild: webcomponent } },
        luigiMfId: 'modal2'
      };
      mockUIModule.modalContainer = [element] as any;
      mockIsElementVisible.mockReturnValue(false);

      const result = LuigiContainerHelpers.getModalMicrofrontends();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ iframe: webcomponent, id: 'modal2', active: false });
    });

    it('skips modal element if neither iframeHandle nor webcomponent found', () => {
      const element = { iframeHandle: null, shadowRoot: null, luigiMfId: 'modal3' };
      mockUIModule.modalContainer = [element] as any;

      expect(LuigiContainerHelpers.getModalMicrofrontends()).toEqual([]);
    });
  });

  describe('getDrawerMicrofrontends', () => {
    it('returns empty object if drawerContainer is falsy', () => {
      mockUIModule.drawerContainer = null;
      expect(LuigiContainerHelpers.getDrawerMicrofrontends()).toEqual({});
    });

    it('returns iframe-based entry for drawer with iframeHandle', () => {
      const iframe = document.createElement('iframe');
      mockUIModule.drawerContainer = { iframeHandle: { iframe }, luigiMfId: 'drawer1' } as any;
      mockIsElementVisible.mockReturnValue(true);

      const result = LuigiContainerHelpers.getDrawerMicrofrontends();

      expect(result).toEqual({ iframe, id: 'drawer1', active: true });
    });

    it('returns webcomponent entry for drawer with shadowRoot', () => {
      const webcomponent = document.createElement('div');
      mockUIModule.drawerContainer = {
        iframeHandle: null,
        shadowRoot: { firstElementChild: { firstElementChild: webcomponent } },
        luigiMfId: 'drawer2'
      } as any;
      mockIsElementVisible.mockReturnValue(false);

      const result = LuigiContainerHelpers.getDrawerMicrofrontends();

      expect(result).toEqual({ iframe: webcomponent, id: 'drawer2', active: false });
    });

    it('returns empty object if drawer has neither iframeHandle nor webcomponent', () => {
      mockUIModule.drawerContainer = { iframeHandle: null, shadowRoot: null, luigiMfId: 'drawer3' } as any;

      expect(LuigiContainerHelpers.getDrawerMicrofrontends()).toEqual({});
    });
  });

  describe('getMicrofrontendsInDom', () => {
    it('aggregates main, modal, and drawer microfrontends', () => {
      const mainIframe = document.createElement('iframe');
      const modalIframe = document.createElement('iframe');
      const drawerIframe = document.createElement('iframe');

      const mainElement = { tagName: 'LUIGI-MAIN', iframeHandle: { iframe: mainIframe }, luigiMfId: 'main1' };
      const luigi = makeLuigiMock([mainElement]);

      const modalElement = { iframeHandle: { iframe: modalIframe }, luigiMfId: 'modal1' };
      mockUIModule.modalContainer = [modalElement] as any;

      mockUIModule.drawerContainer = { iframeHandle: { iframe: drawerIframe }, luigiMfId: 'drawer1' } as any;

      mockIsElementVisible.mockReturnValue(true);

      const result = LuigiContainerHelpers.getMicrofrontendsInDom(luigi);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ container: mainIframe, active: true, type: 'main', id: 'main1' });
      expect(result[1]).toEqual({ container: modalIframe, active: true, type: 'modal', id: 'modal1' });
      expect(result[2]).toEqual({ container: drawerIframe, active: true, type: 'drawer', id: 'drawer1' });
    });

    it('omits drawer from result if drawerContainer has no iframe', () => {
      const luigi = makeLuigiMock([]);
      mockUIModule.modalContainer = [];
      mockUIModule.drawerContainer = { iframeHandle: null, shadowRoot: null, luigiMfId: 'dx' } as any;

      const result = LuigiContainerHelpers.getMicrofrontendsInDom(luigi);

      expect(result).toHaveLength(0);
    });

    it('returns empty array when no microfrontends are present', () => {
      const luigi = makeLuigiMock([]);
      mockUIModule.modalContainer = [];
      mockUIModule.drawerContainer = null;

      expect(LuigiContainerHelpers.getMicrofrontendsInDom(luigi)).toEqual([]);
    });
  });

  describe('getAllLuigiContainerIframe', () => {
    it('returns undefined if containerWrapper is not available', () => {
      const luigi = { getEngine: () => ({ _connector: { getContainerWrapper: () => null } }) } as any;

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('returns undefined if connector is not available', () => {
      const luigi = { getEngine: () => ({ _connector: null }) } as any;

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('returns undefined if no matching containers found', () => {
      const luigi = makeLuigiMock([{ tagName: 'DIV', iframeHandle: { iframe: document.createElement('iframe') } }]);

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('returns LUIGI-CONTAINER elements with iframeHandle', () => {
      const iframe = document.createElement('iframe');
      const container = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe }, luigiMfId: 'mf1' };
      const luigi = makeLuigiMock([container]);

      const result = LuigiContainerHelpers.getAllLuigiContainerIframe(luigi);

      expect(result).toHaveLength(1);
      expect(result![0]).toBe(container);
    });

    it('skips LUIGI-CONTAINER elements without iframeHandle', () => {
      const container = { tagName: 'LUIGI-CONTAINER', iframeHandle: null, luigiMfId: 'mf1' };
      const luigi = makeLuigiMock([container]);

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('skips non-LUIGI-CONTAINER elements', () => {
      const iframe = document.createElement('iframe');
      const element = { tagName: 'LUIGI-WC', iframeHandle: { iframe }, luigiMfId: 'mf1' };
      const luigi = makeLuigiMock([element]);

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('includes modal containers with iframeHandle', () => {
      const modalIframe = document.createElement('iframe');
      const modalElement = { iframeHandle: { iframe: modalIframe }, luigiMfId: 'modal1' };
      mockUIModule.modalContainer = [modalElement] as any;
      const luigi = makeLuigiMock([]);

      const result = LuigiContainerHelpers.getAllLuigiContainerIframe(luigi);

      expect(result).toHaveLength(1);
      expect(result![0]).toBe(modalElement);
    });

    it('skips modal containers without iframeHandle', () => {
      const modalElement = { iframeHandle: null, luigiMfId: 'modal1' };
      mockUIModule.modalContainer = [modalElement] as any;
      const luigi = makeLuigiMock([]);

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('includes drawer container with iframeHandle', () => {
      const drawerIframe = document.createElement('iframe');
      mockUIModule.drawerContainer = { iframeHandle: { iframe: drawerIframe }, luigiMfId: 'drawer1' } as any;
      const luigi = makeLuigiMock([]);

      const result = LuigiContainerHelpers.getAllLuigiContainerIframe(luigi);

      expect(result).toHaveLength(1);
      expect(result![0]).toBe(mockUIModule.drawerContainer);
    });

    it('skips drawer container without iframeHandle', () => {
      mockUIModule.drawerContainer = { iframeHandle: null, luigiMfId: 'drawer1' } as any;
      const luigi = makeLuigiMock([]);

      expect(LuigiContainerHelpers.getAllLuigiContainerIframe(luigi)).toBeUndefined();
    });

    it('aggregates main, modal, and drawer containers', () => {
      const mainIframe = document.createElement('iframe');
      const modalIframe = document.createElement('iframe');
      const drawerIframe = document.createElement('iframe');

      const mainContainer = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe: mainIframe }, luigiMfId: 'main1' };
      const modalElement = { iframeHandle: { iframe: modalIframe }, luigiMfId: 'modal1' };
      mockUIModule.modalContainer = [modalElement] as any;
      mockUIModule.drawerContainer = { iframeHandle: { iframe: drawerIframe }, luigiMfId: 'drawer1' } as any;

      const luigi = makeLuigiMock([mainContainer]);

      const result = LuigiContainerHelpers.getAllLuigiContainerIframe(luigi);

      expect(result).toHaveLength(3);
      expect(result![0]).toBe(mainContainer);
      expect(result![1]).toBe(modalElement);
      expect(result![2]).toBe(mockUIModule.drawerContainer);
    });

    it('returns multiple main containers', () => {
      const iframe1 = document.createElement('iframe');
      const iframe2 = document.createElement('iframe');
      const container1 = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe: iframe1 }, luigiMfId: 'mf1' };
      const container2 = { tagName: 'LUIGI-CONTAINER', iframeHandle: { iframe: iframe2 }, luigiMfId: 'mf2' };
      const luigi = makeLuigiMock([container1, container2]);

      const result = LuigiContainerHelpers.getAllLuigiContainerIframe(luigi);

      expect(result).toHaveLength(2);
      expect(result![0]).toBe(container1);
      expect(result![1]).toBe(container2);
    });
  });
});
