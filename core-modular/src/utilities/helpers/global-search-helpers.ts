import type { GlobalSearchProvider, SearchResultItem } from '../../core-api/global-search';
import type { Luigi } from '../../core-api/luigi';
import { GenericHelpers } from './generic-helpers';

export const GlobalSearchHelpers = {
  handleSearchResultRenderer(
    searchProvider: GlobalSearchProvider,
    searchResultItems: SearchResultItem[],
    rendererSlot: any
  ): void {
    if (!searchProvider?.customSearchResultRenderer) {
      return;
    }

    const searchApiObj = {
      customSearchResultItemRenderer: searchProvider?.customSearchResultItemRenderer,
      fireItemSelected: (item: any) => {
        if (
          searchProvider?.onSearchResultItemSelected &&
          typeof searchProvider.onSearchResultItemSelected === 'function'
        ) {
          searchProvider.onSearchResultItemSelected(item);
        }
      }
    };

    searchProvider.customSearchResultRenderer(searchResultItems, rendererSlot, searchApiObj);
  },

  getSearchPlaceholder(luigi: Luigi): string | undefined {
    const searchProvider = luigi.getConfigValue('globalSearch.searchProvider');

    if (!searchProvider?.inputPlaceholder) {
      return undefined;
    }

    if (GenericHelpers.isFunction(searchProvider.inputPlaceholder)) {
      return searchProvider.inputPlaceholder();
    }

    if (typeof searchProvider.inputPlaceholder === 'string') {
      const translated = luigi.i18n().getTranslation(searchProvider.inputPlaceholder);

      if (!!translated && translated.trim().length > 0) {
        return translated;
      }

      return searchProvider.inputPlaceholder;
    }

    const currentLocale = luigi.i18n().getCurrentLocale();

    if (typeof searchProvider.inputPlaceholder === 'object') {
      return searchProvider.inputPlaceholder[currentLocale];
    }
  },

  toggleSearch(
    isSearchFieldVisible: boolean,
    searchProvider: GlobalSearchProvider,
    inputElem?: HTMLInputElement
  ): void {
    if (searchProvider?.toggleSearch && GenericHelpers.isFunction(searchProvider.toggleSearch) && inputElem) {
      const fieldVisible = isSearchFieldVisible === undefined ? true : isSearchFieldVisible;

      searchProvider.toggleSearch(inputElem, fieldVisible);
    } else {
      console.warn('Toggle search method is not defined in the provider.');
    }
  }
};
