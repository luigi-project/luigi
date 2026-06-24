import type { GlobalSearchProvider, SearchResultItem } from '../../types/global-search';
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
    const placeholder = searchProvider?.inputPlaceholder;

    if (!placeholder) {
      return undefined;
    }

    if (typeof placeholder === 'function') {
      return placeholder();
    }

    if (typeof placeholder === 'string') {
      const translated = luigi.i18n().getTranslation(placeholder);

      if (!!translated && translated.trim().length > 0) {
        return translated;
      }

      return placeholder;
    }

    if (typeof placeholder === 'object') {
      const currentLocale = luigi.i18n().getCurrentLocale();
      return placeholder[currentLocale];
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
