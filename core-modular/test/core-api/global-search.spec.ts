import { GlobalSearch } from '../../src/core-api/global-search';
import { GlobalSearchService } from '../../src/services/global-search.service';
import { serviceRegistry } from '../../src/services/service-registry';

describe('GlobalSearch', () => {
  let luigiMock: any;
  let mockGlobalSearchService: any;
  let globalSearch: GlobalSearch;

  beforeEach(() => {
    luigiMock = {
      getConfig: jest.fn().mockReturnValue({ routing: { useHashRouting: false } }),
      getConfigValue: jest.fn().mockImplementation((key: string) => {
        if (key === 'globalSearch.searchProvider')
          return {
            customSearchResultItemRenderer: undefined,
            customSearchResultRenderer: undefined,
            inputPlaceholder: 'Type some text to search...',
            onEnter: undefined,
            onEscape: undefined,
            onInput: undefined,
            onSearchResultItemSelected: undefined,
            toggleSearch: jest.fn()
          };
        return null;
      }),
      navigation: jest.fn(() => ({ navigate: jest.fn() })),
      getEngine: jest.fn().mockReturnValue({
        _connector: {
          openSearchField: jest.fn(),
          closeSearchField: jest.fn(),
          clearSearchField: jest.fn(),
          closeSearchResult: jest.fn(),
          toggleSearch: jest.fn()
        }
      }),
      i18n: jest.fn().mockReturnValue({
        getTranslation: (key: string) => key
      }),
      ux: jest.fn().mockReturnValue({
        showAlert: jest.fn()
      })
    };
    mockGlobalSearchService = {
      getFieldVisibility: jest.fn(),
      setFieldVisibility: jest.fn(),
      getSearchQuery: jest.fn(),
      setSearchQuery: jest.fn(),
      closeSearchResult: jest.fn(),
      showSearchResult: jest.fn(),
      setSearchInputPlaceholder: jest.fn(),
      toggleSearch: jest.fn()
    };
    jest.spyOn(serviceRegistry, 'get').mockImplementation((service: any) => {
      if (service === GlobalSearchService) return mockGlobalSearchService;
      return {} as any;
    });
    globalSearch = new GlobalSearch(luigiMock);
  });

  describe('openSearchField', () => {
    it('should set isSearchFieldVisible and call openSearchField via connector', () => {
      globalSearch.openSearchField();
      expect(globalSearch.globalSearchService.setFieldVisibility).toHaveBeenCalledWith(true);
      expect(luigiMock.getEngine()._connector.openSearchField).toHaveBeenCalled();
    });
  });

  describe('closeSearchField', () => {
    it('should set isSearchFieldVisible and call closeSearchField via connector', () => {
      globalSearch.closeSearchField();
      expect(globalSearch.globalSearchService.setFieldVisibility).toHaveBeenCalledWith(false);
      expect(luigiMock.getEngine()._connector.closeSearchField).toHaveBeenCalled();
    });
  });

  describe('clearSearchField', () => {
    it('should reset searchQuery and call clearSearchField via connector', () => {
      const closeSearchResultSpy = jest.spyOn(globalSearch, 'closeSearchResult');
      globalSearch.clearSearchField();
      expect(globalSearch.globalSearchService.setSearchQuery).toHaveBeenCalledWith('');
      expect(luigiMock.getEngine()._connector.clearSearchField).toHaveBeenCalled();
      expect(closeSearchResultSpy).toHaveBeenCalled();
    });
  });

  describe('showSearchResult', () => {
    it('should show search result', () => {
      globalSearch.showSearchResult('test');
      expect(globalSearch.globalSearchService.showSearchResult).toHaveBeenCalledWith('test');
    });
  });

  describe('closeSearchResult', () => {
    it('should close search result and call closeSearchResult via connector', () => {
      globalSearch.closeSearchResult();
      expect(globalSearch.globalSearchService.closeSearchResult).toHaveBeenCalled();
      expect(luigiMock.getEngine()._connector.closeSearchResult).toHaveBeenCalled();
    });
  });

  describe('getSearchString', () => {
    it('should get search string', () => {
      globalSearch.getSearchString();
      expect(globalSearch.globalSearchService.getSearchQuery).toHaveBeenCalled();
    });
  });

  describe('setSearchString', () => {
    it('should set search string', () => {
      globalSearch.setSearchString('test');
      expect(globalSearch.globalSearchService.setSearchQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('setSearchInputPlaceholder', () => {
    it('should set search input placeholder', () => {
      globalSearch.setSearchInputPlaceholder('test');
      expect(globalSearch.globalSearchService.setSearchInputPlaceholder).toHaveBeenCalledWith('test');
    });
  });
});
