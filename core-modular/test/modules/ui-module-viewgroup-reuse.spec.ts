jest.mock('@luigi-project/container', () => ({
  __esModule: true,
  default: {},
  LuigiContainer: class {},
  LuigiCompoundContainer: class {}
}));

jest.mock('../../src/services/service-registry', () => ({
  serviceRegistry: { get: jest.fn() }
}));

jest.mock('../../src/services/navigation.service', () => ({ NavigationService: class {} }));
jest.mock('../../src/services/preloading.service', () => ({ PreloadingService: class {} }));
jest.mock('../../src/services/routing.service', () => ({ RoutingService: class {} }));
jest.mock('../../src/services/dirty-status.service', () => ({ DirtyStatusService: class {} }));
jest.mock('../../src/services/modal.service', () => ({ ModalService: class {} }));
jest.mock('../../src/utilities/helpers/auth-helpers', () => ({
  AuthHelpers: { getStoredAuthData: jest.fn().mockReturnValue(null) }
}));

import { UIModule } from '../../src/modules/ui-module';
import { ModalService } from '../../src/services/modal.service';
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.updateMainContent - view-group reuse', () => {
  let containerWrapper: HTMLDivElement;
  let mockLuigi: any;
  let existingContainer: any;

  beforeEach(() => {
    containerWrapper = document.createElement('div');

    // A cached container shared across a view group, currently showing c1.
    existingContainer = document.createElement('luigi-container');
    (existingContainer as any).viewGroup = 'group1';
    existingContainer.viewurl = 'http://localhost:4400/microfrontend.html#child1';
    existingContainer.style.display = 'block';
    existingContainer.updateContext = jest.fn();
    existingContainer.updateViewUrl = jest.fn();
    containerWrapper.appendChild(existingContainer);

    mockLuigi = {
      getEngine: () => ({
        _connector: {
          getContainerWrapper: () => containerWrapper,
          hideLoadingIndicator: jest.fn(),
          showLoadingIndicator: jest.fn()
        },
        _comm: { addListeners: jest.fn() }
      }),
      getConfigValue: jest.fn().mockReturnValue(undefined),
      readUserSettings: jest.fn().mockResolvedValue({}),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({ getCurrentTheme: () => 'sap_horizon', getCSSVariables: jest.fn().mockResolvedValue({}) }),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] })
    };

    const mockModalService = {
      registerModal: jest.fn(),
      getModalSettings: jest.fn().mockReturnValue({}),
      closeModalsWithDirtyCheck: jest.fn().mockResolvedValue(true)
    };

    (serviceRegistry.get as jest.Mock).mockImplementation((service: any) => {
      if (service === ModalService) return mockModalService;
      return { applyDecorators: (url: string) => url };
    });
  });

  it('reuses the container and updates context when a view-group sibling has a different base URL (c1 -> c2)', async () => {
    const currentNode = {
      label: 'c2',
      viewGroup: 'group1',
      viewUrl: 'http://localhost:4400/microfrontend2.html#child2',
      context: { foo: 'bar' }
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);

    // Same view group, same origin -> container is reused. The base URL differs (not just the hash),
    // so this is a plain context update, not an updateViewUrl hash navigation.
    expect(existingContainer.updateViewUrl).not.toHaveBeenCalled();
    expect(existingContainer.updateContext).toHaveBeenCalledWith({ foo: 'bar' }, { withoutSync: false });
    // The reused container's viewurl is updated in place.
    expect(existingContainer.viewurl).toBe('http://localhost:4400/microfrontend2.html#child2');
  });

  it('calls updateViewUrl when only the hash changes within the same base URL', async () => {
    const currentNode = {
      label: 'c1b',
      viewGroup: 'group1',
      viewUrl: 'http://localhost:4400/microfrontend.html#child9'
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);

    expect(existingContainer.updateViewUrl).toHaveBeenCalledWith('http://localhost:4400/microfrontend.html#child9');
  });

  it('calls updateContext (not updateViewUrl) when the resolved viewUrl is unchanged', async () => {
    const currentNode = {
      label: 'c1',
      viewGroup: 'group1',
      viewUrl: 'http://localhost:4400/microfrontend.html#child1',
      context: { foo: 'bar' }
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);

    expect(existingContainer.updateViewUrl).not.toHaveBeenCalled();
    expect(existingContainer.updateContext).toHaveBeenCalledWith({ foo: 'bar' }, { withoutSync: false });
  });

  it('does NOT reuse a view-group container across different origins (localhost -> 0.0.0.0)', async () => {
    // Same viewGroup name but a different origin. Classic core (isSameViewGroup) requires equal
    // origins; reusing the container would leak one origin's container state to another.
    const currentNode = {
      label: 'c2',
      viewGroup: 'group1',
      viewUrl: 'http://0.0.0.0:4400/microfrontend.html#headlib',
      context: { c2: 'context 2' }
    };

    const removeSpy = jest.spyOn(existingContainer, 'remove');

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);

    // The cross-origin container must be dropped, not reused, and a fresh container created instead.
    expect(removeSpy).toHaveBeenCalled();
    expect(existingContainer.updateViewUrl).not.toHaveBeenCalled();
    expect(existingContainer.updateContext).not.toHaveBeenCalled();
    const containers = [...containerWrapper.childNodes].filter((el: any) => el.tagName?.indexOf('LUIGI-') === 0);
    expect(containers).toContain(
      containers.find((el: any) => el.viewurl === 'http://0.0.0.0:4400/microfrontend.html#headlib')
    );
  });

  it('reuses a not-yet-loaded view-group container that has no viewurl yet', async () => {
    // A freshly created / preloading container may not have a viewurl yet. Reuse must still be
    // allowed in that case (origin cannot be compared, previous unconditional behaviour preserved).
    existingContainer.viewurl = '';

    const currentNode = {
      label: 'c1',
      viewGroup: 'group1',
      viewUrl: 'http://localhost:4400/microfrontend.html#child1',
      context: { foo: 'bar' }
    };

    const removeSpy = jest.spyOn(existingContainer, 'remove');

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);

    expect(removeSpy).not.toHaveBeenCalled();
    expect(existingContainer.updateContext).toHaveBeenCalledWith({ foo: 'bar' }, { withoutSync: false });
  });
});
