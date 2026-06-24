import type { GlobalSearchHandler, GlobalSearchProvider, SearchResultItem } from '../types/global-search';
import type { Luigi } from '../core-api/luigi';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { GlobalSearchHelpers } from '../utilities/helpers/global-search-helpers';

export class GlobalSearchService {
  isSearchFieldVisible = false;
  isSearchResultVisible = false;
  searchQuery = '';
  searchResult: SearchResultItem[] = [];

  constructor(private luigi: Luigi) {
    this.luigi = luigi;
  }

  get searchProvider(): GlobalSearchProvider {
    return this.luigi.getConfigValue('globalSearch.searchProvider');
  }

  private getHandler(): GlobalSearchHandler | undefined {
    return this.luigi.getEngine()._connector?.getGlobalSearchHandler?.();
  }

  hasSearchProvider(): boolean {
    if (!this.searchProvider) {
      console.warn('No search provider defined.');
      return false;
    }

    return true;
  }

  getFieldVisibility(): boolean {
    return this.isSearchFieldVisible;
  }

  setFieldVisibility(value: boolean): void {
    this.isSearchFieldVisible = value;
  }

  showSearchResult(searchResultItems: SearchResultItem[]): void {
    const isCentered =
      this.luigi.getConfigValue('globalSearch.searchFieldCentered') &&
      this.luigi.getConfigValue('settings.experimental.globalSearchCentered');

    if (searchResultItems?.length) {
      this.getHandler()?.showSearchResult(searchResultItems, this.searchQuery, !!isCentered, (rendererSlot?: any) => {
        if (rendererSlot && GenericHelpers.isFunction(this.searchProvider.customSearchResultRenderer)) {
          GlobalSearchHelpers.handleSearchResultRenderer(this.searchProvider, searchResultItems, rendererSlot);
        } else {
          this.isSearchResultVisible = true;
          this.searchResult = searchResultItems;
        }
      });
    } else {
      console.warn('Search result array is empty.');
    }
  }

  closeSearchResult(): void {
    this.isSearchResultVisible = false;
    this.searchResult = [];
  }

  getSearchQuery(): string {
    return this.searchQuery;
  }

  setSearchQuery(value: string): void {
    this.searchQuery = value || '';
    this.getHandler()?.setSearchString(this.searchQuery, (inputElem?: HTMLInputElement) => {
      if (inputElem) {
        inputElem.value = this.searchQuery;

        if (this.searchProvider.onInput && GenericHelpers.isFunction(this.searchProvider.onInput)) {
          this.searchProvider.onInput();
        } else {
          console.error('onInput is not a function. Please check the global search configuration.');
        }
      }
    });
  }

  setSearchInputPlaceholder(placeholder?: string): void {
    if (!placeholder) {
      placeholder = GlobalSearchHelpers.getSearchPlaceholder(this.luigi) || '';
    }

    this.getHandler()?.setSearchInputPlaceholder(placeholder);
  }

  toggleSearch(): void {
    this.setFieldVisibility(!this.isSearchFieldVisible);
    const handler = this.getHandler();
    handler?.toggleSearch(this.isSearchFieldVisible, (inputElem?: HTMLInputElement) => {
      GlobalSearchHelpers.toggleSearch(this.isSearchFieldVisible, this.searchProvider, inputElem);
    });
    handler?.clearSearchField();
  }
}
