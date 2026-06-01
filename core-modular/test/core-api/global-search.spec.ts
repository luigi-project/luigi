import { GlobalSearch } from './../../src/core-api/global-search';

describe('GlobalSearch', () => {
  let luigiMock: any;
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
    globalSearch = new GlobalSearch(luigiMock);
  });

  describe('openSearchField', () => {
    it('should set isSearchFieldVisible and call openSearchField via connector', () => {
      globalSearch.openSearchField();
      expect(globalSearch.isSearchFieldVisible).toEqual(true);
      expect(luigiMock.getEngine()._connector.openSearchField).toHaveBeenCalled();
    });
  });

  describe('closeSearchField', () => {
    it('should set isSearchFieldVisible and call closeSearchField via connector', () => {
      globalSearch.closeSearchField();
      expect(globalSearch.isSearchFieldVisible).toEqual(false);
      expect(luigiMock.getEngine()._connector.closeSearchField).toHaveBeenCalled();
    });
  });

  describe('clearSearchField', () => {
    it('should reset searchQuery and call clearSearchField via connector', () => {
      globalSearch.clearSearchField();
      expect(globalSearch.searchQuery).toEqual('');
      expect(luigiMock.getEngine()._connector.clearSearchField).toHaveBeenCalled();
    });
  });

  describe('toggleSearch', () => {
    it('should toggle isSearchFieldVisible and call toggleSearch via connector', () => {
      const clearSearchFieldSpy = jest.spyOn(globalSearch, 'clearSearchField');
      globalSearch.isSearchFieldVisible = true;
      globalSearch.toggleSearch();
      expect(globalSearch.isSearchFieldVisible).toEqual(false);
      expect(luigiMock.getEngine()._connector.toggleSearch).toHaveBeenCalled();
      expect(clearSearchFieldSpy).toHaveBeenCalled();
    });
  });
});
