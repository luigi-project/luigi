import { GlobalSearchHelpers } from '../../../src/utilities/helpers/global-search-helpers';

describe('GlobalSearchHelpers', () => {
  describe('toggleSearch', () => {
    it.each([
      {visible: true, result: true},
      {visible: false, result: false},
      {visible: undefined, result: true},
      {visible: null, result: null}
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
