import { GlobalSearchHelpers } from '../../../src/utilities/helpers/global-search-helpers';

describe('GlobalSearchHelpers', () => {
  let luigiMock: any;

  beforeEach(() => {
    luigiMock = {
      i18n: jest.fn().mockReturnValue({
        getCurrentLocale: () => 'en',
        getTranslation: (key: string) => key
      })
    };
  });

  describe('handleSearchResultRenderer', () => {
    it('should call customSearchResultRenderer', () => {
      const searchProvider = {
        customSearchResultRenderer: jest.fn(),
        onSearchResultItemSelected: jest.fn()
      };
      const searchResultRendererSpy = jest.spyOn(searchProvider, 'customSearchResultRenderer');

      GlobalSearchHelpers.handleSearchResultRenderer(searchProvider, [], undefined);

      expect(searchResultRendererSpy).toHaveBeenCalledWith([], undefined, { fireItemSelected: expect.any(Function) });
    });
  });

  describe('getSearchPlaceholder', () => {
    it.each([
      { placeholder: undefined, result: undefined },
      { placeholder: 'Digit here text to search...', result: 'Digit here text to search...' },
      { placeholder: () => 'Function placeholder text', result: 'Function placeholder text' },
      {
        placeholder: {
          en: 'English placeholder text',
          fr: 'Texte de remplacement français'
        },
        result: 'English placeholder text'
      }
    ])('should get correct result for placeholder', (data) => {
      luigiMock.getConfigValue = jest.fn().mockImplementation((key: string) => {
        if (key === 'globalSearch.searchProvider')
          return {
            inputPlaceholder: data.placeholder
          };
        return null;
      });

      const result = GlobalSearchHelpers.getSearchPlaceholder(luigiMock);

      expect(result).toEqual(data.result);
    });
  });

  describe('toggleSearch', () => {
    it.each([
      { visible: true, result: true },
      { visible: false, result: false },
      { visible: undefined, result: true },
      { visible: null, result: null }
    ])('should call toggleSearch from searchProvider with correct arguments', (data) => {
      const searchProvider = {
        toggleSearch: jest.fn()
      };
      const inputElem = document.createElement('input');
      const toggleSearchSpy = jest.spyOn(searchProvider, 'toggleSearch');

      GlobalSearchHelpers.toggleSearch(data.visible, searchProvider, inputElem);

      expect(toggleSearchSpy).toHaveBeenCalledWith(inputElem, data.result);
    });

    it('should not call toggleSearch from searchProvider if it is not provided', () => {
      const searchProvider = {
        toggleSearch: undefined
      };
      const inputElem = document.createElement('input');
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      GlobalSearchHelpers.toggleSearch(false, searchProvider, inputElem);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Toggle search method is not defined in the provider.');
    });

    it('should not call toggleSearch from searchProvider if input element is not provided', () => {
      const searchProvider = {
        toggleSearch: jest.fn()
      };
      const toggleSearchSpy = jest.spyOn(searchProvider, 'toggleSearch');
      const consoleWarnSpy = jest.spyOn(console, 'warn');

      GlobalSearchHelpers.toggleSearch(false, searchProvider);

      expect(toggleSearchSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith('Toggle search method is not defined in the provider.');
    });
  });
});
