import { GlobalSearchService } from '../../src/services/global-search.service';

describe('GlobalSearchService', () => {
  let luigiMock: any;
  let globalSearchHandler: any;
  let globalSearchService: GlobalSearchService;

  beforeEach(() => {
    globalSearchHandler = {
      openSearchField: jest.fn(),
      closeSearchField: jest.fn(),
      clearSearchField: jest.fn(),
      showSearchResult: jest.fn(),
      closeSearchResult: jest.fn(),
      setSearchString: jest.fn(),
      setSearchInputPlaceholder: jest.fn(),
      toggleSearch: jest.fn()
    };
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
          getGlobalSearchHandler: jest.fn().mockReturnValue(globalSearchHandler)
        }
      }),
      i18n: jest.fn().mockReturnValue({
        getTranslation: (key: string) => key
      }),
      ux: jest.fn().mockReturnValue({
        showAlert: jest.fn()
      })
    };
    globalSearchService = new GlobalSearchService(luigiMock);
  });

  describe('hasSearchProvider', () => {
    it('should check search provider and return true', () => {
      jest.spyOn(globalSearchService, 'searchProvider', 'get').mockReturnValue({});
      expect(globalSearchService.hasSearchProvider()).toEqual(true);
    });

    it('should check search provider and return false', () => {
      jest.spyOn(globalSearchService, 'searchProvider', 'get').mockReturnValue(undefined);
      expect(globalSearchService.hasSearchProvider()).toEqual(false);
    });
  });

  describe('getFieldVisibility', () => {
    it.each([false, true])('should get field visibility', (value) => {
      globalSearchService.isSearchFieldVisible = value;
      expect(globalSearchService.getFieldVisibility()).toEqual(value);
    });
  });

  describe('setFieldVisibility', () => {
    it.each([false, true])('should set field visibility', (value) => {
      globalSearchService.setFieldVisibility(value);
      expect(globalSearchService.isSearchFieldVisible).toEqual(value);
    });
  });

  describe('showSearchResult', () => {
    it('should show search result when data is provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      globalSearchService.showSearchResult([{}, {}]);
      expect(globalSearchHandler.showSearchResult).toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not show search result when data is not provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn');
      globalSearchService.showSearchResult(undefined);
      expect(globalSearchHandler.showSearchResult).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Search result array is empty.');
    });
  });

  describe('closeSearchResult', () => {
    it('should close search result', () => {
      globalSearchService.closeSearchResult();
      expect(globalSearchService.isSearchFieldVisible).toEqual(false);
      expect(globalSearchService.searchResult).toEqual([]);
    });
  });

  describe('getSearchQuery', () => {
    it.each([undefined, '', 'test'])('should get search query', (value) => {
      globalSearchService.searchQuery = value;
      expect(globalSearchService.getSearchQuery()).toEqual(value);
    });
  });

  describe('setSearchQuery', () => {
    it('should set search query', () => {
      globalSearchService.setSearchQuery('test');
      expect(globalSearchService.searchQuery).toEqual('test');
      expect(globalSearchHandler.setSearchString).toHaveBeenCalled();
    });
  });

  describe('setSearchInputPlaceholder', () => {
    it('should set search input placeholder', () => {
      globalSearchService.setSearchInputPlaceholder('test');
      expect(globalSearchHandler.setSearchInputPlaceholder).toHaveBeenCalledWith('test');
    });
  });

  describe('toggleSearch', () => {
    it('should toggle isSearchFieldVisible and call connector methods', () => {
      globalSearchService.isSearchFieldVisible = true;
      globalSearchService.toggleSearch();
      expect(globalSearchService.isSearchFieldVisible).toEqual(false);
      expect(globalSearchHandler.toggleSearch).toHaveBeenCalledWith(
        globalSearchService.isSearchFieldVisible,
        expect.any(Function)
      );
      expect(globalSearchHandler.clearSearchField).toHaveBeenCalled();
    });
  });
});
