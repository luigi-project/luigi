import type { GlobalSearchProvider, SearchResultItem } from '../core-api/global-search';
import type { Luigi } from '../core-api/luigi';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { GlobalSearchHelpers } from '../utilities/helpers/global-search-helpers';

export class GlobalSearchService {
  isSearchFieldVisible = false;
  isSearchResultVisible = false;
  searchProvider: GlobalSearchProvider;
  searchQuery = '';
  searchResult: SearchResultItem[] = [];

  constructor(private luigi: Luigi) {
    this.luigi = luigi;
    this.searchProvider = this.luigi.getConfigValue('globalSearch.searchProvider');
  }

  getFieldVisibility(): boolean {
    return this.isSearchFieldVisible;
  }

  setFieldVisibility(value: boolean): void {
    this.isSearchFieldVisible = value;
  }

  showSearchResult(searchResultItems: SearchResultItem[]): void {
    if (searchResultItems?.length) {
      this.luigi.getEngine()._connector?.showSearchResult(searchResultItems, this.searchQuery, (rendererSlot?: any) => {
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
    this.luigi.getEngine()._connector?.setSearchString(this.searchQuery, (inputElem?: HTMLInputElement) => {
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

    this.luigi.getEngine()._connector?.setSearchInputPlaceholder(placeholder);
  }

  toggleSearch(): void {
    this.setFieldVisibility(!this.isSearchFieldVisible);
    this.luigi.getEngine()._connector?.toggleSearch(this.isSearchFieldVisible, (inputElem?: HTMLInputElement) => {
      GlobalSearchHelpers.toggleSearch(this.isSearchFieldVisible, this.searchProvider, inputElem);
    });
    this.luigi.getEngine()._connector?.clearSearchField();
  }
}
