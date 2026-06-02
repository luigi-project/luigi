import { GlobalSearchHelpers } from '../utilities/helpers/global-search-helpers';
import type { Luigi } from './luigi';

export interface GlobalSearchProvider {
  customSearchResultItemRenderer?: (searchResultItem: any, slot: HTMLLIElement, searchApiObj: any) => object;
  customSearchResultRenderer?: (searchResults: any[], slot: HTMLDivElement, searchApiObj: any) => object;
  inputPlaceholder?: any;
  onEnter?: () => void;
  onEscape?: () => void;
  onInput?: () => void;
  onSearchResultItemSelected?: (searchResultItem: any) => void;
  toggleSearch?: (element: HTMLInputElement, visible: boolean) => void;
}

export class GlobalSearch {
  luigi: Luigi;
  isSearchFieldVisible = false;
  searchQuery: string | undefined;
  searchProvider: GlobalSearchProvider;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.searchProvider = this.luigi.getConfigValue('globalSearch.searchProvider');
  }

  /**
   * Opens the global search field.
   * @example Luigi.globalSearch().openSearchField();
   */
  openSearchField(): void {
    if (this.checkSearchProvider(this.searchProvider)) {
      this.isSearchFieldVisible = true;
      this.luigi.getEngine()._connector?.openSearchField();
    }
  }

  /**
   * Closes the global search field.
   * @example Luigi.globalSearch().closeSearchField();
   */
  closeSearchField(): void {
    if (this.checkSearchProvider(this.searchProvider)) {
      this.isSearchFieldVisible = false;
      this.luigi.getEngine()._connector?.closeSearchField();
    }
  }

  /**
   * Clears the global search field.
   * @example Luigi.globalSearch().clearSearchField();
   */
  clearSearchField(): void {
    if (this.checkSearchProvider(this.searchProvider)) {
      this.searchQuery = '';
      this.luigi.getEngine()._connector?.clearSearchField();
      // TODO `closeSearchResult` method
    }
  }

  /**
   * Toggles search field visibility.
   */
  toggleSearch(): void {
    this.isSearchFieldVisible = !this.isSearchFieldVisible;
    this.luigi.getEngine()._connector?.toggleSearch(this.isSearchFieldVisible, (inputElem: HTMLInputElement) => {
      GlobalSearchHelpers.toggleSearch(this.isSearchFieldVisible, this.searchProvider, inputElem);
    });
    this.clearSearchField();
  }

  private checkSearchProvider(searchProvider: GlobalSearchProvider): boolean {
    if (!searchProvider) {
      console.warn('No search provider defined.');
      return false;
    } else {
      return true;
    }
  }
}
