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
import { serviceRegistry } from '../../src/services/service-registry';

describe('UIModule.updateMainContent - withoutSync', () => {
  let containerWrapper: HTMLDivElement;
  let mockLuigi: any;
  let existingContainer: any;

  beforeEach(() => {
    containerWrapper = document.createElement('div');

    existingContainer = document.createElement('luigi-container');
    existingContainer.viewurl = 'https://example.com/current-mfe.html';
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
        }
      }),
      getConfigValue: jest.fn().mockReturnValue(undefined),
      readUserSettings: jest.fn().mockResolvedValue({}),
      i18n: () => ({ getCurrentLocale: () => 'en' }),
      theming: () => ({ getCurrentTheme: () => 'sap_horizon', getCSSVariables: jest.fn().mockResolvedValue({}) }),
      featureToggles: () => ({ getActiveFeatureToggleList: () => [] })
    };

    (serviceRegistry.get as jest.Mock).mockImplementation(() => ({
      applyDecorators: (url: string) => url
    }));
  });

  it('should preserve existing container when withoutSync is true and viewUrls differ', async () => {
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/different-mfe.html'
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, true, false);

    expect(containerWrapper.contains(existingContainer)).toBe(true);
    expect(existingContainer.style.display).toBe('block');
  });

  it('should not update viewurl property when withoutSync is true', async () => {
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/different-mfe.html'
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, true, false);

    expect(existingContainer.viewurl).toBe('https://example.com/current-mfe.html');
  });

  it('should call updateContext with withoutSync: true when withoutSync is true', async () => {
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/different-mfe.html',
      context: { project: 'new-project' }
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, true, false);

    expect(existingContainer.updateContext).toHaveBeenCalledWith(
      { project: 'new-project' },
      { withoutSync: true }
    );
  });

  it('should not call updateViewUrl when withoutSync is true even if hash changed', async () => {
    existingContainer.viewurl = 'https://example.com/mfe.html#page1';
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/mfe.html#page2'
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, true, false);

    expect(existingContainer.updateViewUrl).not.toHaveBeenCalled();
  });

  it('should not call updateContext when both withoutSync and preventContextUpdate are true', async () => {
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/different-mfe.html',
      context: { project: 'new-project' }
    };

    await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, true, true);

    expect(existingContainer.updateContext).not.toHaveBeenCalled();
  });

  it('should remove container from DOM when withoutSync is false and viewUrls differ', async () => {
    const removeSpy = jest.spyOn(existingContainer, 'remove');
    const currentNode = {
      label: 'Target',
      viewUrl: 'https://example.com/different-mfe.html'
    };

    // createContainer will throw due to missing mocks, but we only care that remove() was called
    try {
      await UIModule.updateMainContent(currentNode as any, mockLuigi, undefined, false, false);
    } catch (e) {
      // expected — createContainer needs more mocks
    }

    expect(removeSpy).toHaveBeenCalled();
  });
});
