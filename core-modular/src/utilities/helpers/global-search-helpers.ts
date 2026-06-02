import type { GlobalSearchProvider } from '../../core-api/global-search';
import { GenericHelpers } from './generic-helpers';

export const GlobalSearchHelpers = {
  toggleSearch(isSearchFieldVisible: boolean, searchProvider: GlobalSearchProvider, inputElem: HTMLInputElement): void {
    if (searchProvider?.toggleSearch && GenericHelpers.isFunction(searchProvider.toggleSearch) && inputElem) {
      const fieldVisible = isSearchFieldVisible === undefined ? true : isSearchFieldVisible;

      searchProvider.toggleSearch(inputElem, fieldVisible);
    } else {
      console.warn('Toggle search method is not defined in the provider.');
    }
  }
};
