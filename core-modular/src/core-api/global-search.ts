import { GlobalSearchService } from '../services/global-search.service';
import { serviceRegistry } from '../services/service-registry';
import type { Luigi } from './luigi';

export interface GlobalSearchProvider {
  customSearchResultItemRenderer?: (searchResultItem: any, slot: HTMLLIElement, searchApiObj: any) => object;
  customSearchResultRenderer?: (searchResults: any[], slot: HTMLDivElement, searchApiObj: any) => object;
  disableInputHandlers?: boolean;
  inputPlaceholder?: any;
  onEnter?: () => void;
  onEscape?: () => void;
  onInput?: () => void;
  onSearchBtnClick?: () => void;
  onSearchResultItemSelected?: (searchResultItem: any) => void;
  searchFieldCentered?: boolean;
  toggleSearch?: (element: HTMLInputElement, visible: boolean) => void;
}

export interface SearchResultItem {
  description: string;
  label: string;
  pathObject: Record<string, any>;
}

export class GlobalSearch {
  luigi: Luigi;
  globalSearchService: GlobalSearchService;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
    this.globalSearchService = serviceRegistry.get(GlobalSearchService);
  }

  /**
   * Opens the global search field.
   * @example Luigi.globalSearch().openSearchField();
   */
  openSearchField(): void {
    if (this.globalSearchService.hasSearchProvider()) {
      this.globalSearchService.setFieldVisibility(true);
      this.luigi.getEngine()._connector?.openSearchField();
    }
  }

  /**
   * Closes the global search field.
   * @example Luigi.globalSearch().closeSearchField();
   */
  closeSearchField(): void {
    if (this.globalSearchService.hasSearchProvider()) {
      this.globalSearchService.setFieldVisibility(false);
      this.luigi.getEngine()._connector?.closeSearchField();
    }
  }

  /**
   * Clears the global search field.
   * @example Luigi.globalSearch().clearSearchField();
   */
  clearSearchField(): void {
    if (this.globalSearchService.hasSearchProvider()) {
      this.globalSearchService.setSearchQuery('');
      this.luigi.getEngine()._connector?.clearSearchField();
      this.closeSearchResult();
    }
  }

  /**
   * Opens the global search result. By standard it is a popover.
   * @param {Array<SearchResultItem>} searchResultItems
   * @example
   * let searchResultItem = {
   *   pathObject: {
   *     link,
   *     params: {}
   *   },
   *   label,
   *   description
   * }
   *
   * Luigi.globalSearch().showSearchResult([searchResultItem1, searchResultItem2]);
   */
  showSearchResult(searchResultItems: SearchResultItem[]): void {
    if (this.globalSearchService.hasSearchProvider()) {
      this.globalSearchService.showSearchResult(searchResultItems);
    }
  }

  /**
   * Closes the global search result. By standard it is rendered as a popover.
   * @example Luigi.globalSearch().closeSearchResult();
   */
  closeSearchResult() {
    this.globalSearchService.closeSearchResult();
    this.luigi.getEngine()._connector?.closeSearchResult();
  }

  /**
   * Gets the value of the search input field.
   * @example Luigi.globalSearch().getSearchString();
   */
  getSearchString(): string {
    return this.globalSearchService.getSearchQuery();
  }

  /**
   * Sets the value of the search input field.
   * @param searchString search value
   * @example Luigi.globalSearch().setSearchString('searchString');
   */
  setSearchString(searchString: string) {
    this.globalSearchService.setSearchQuery(searchString);
  }

  /**
   * Sets the value of the Placeholder search input field.
   * @param placeholder placeholder value
   * @example Luigi.globalSearch().setSearchInputPlaceholder('HERE input Placeholder');
   */
  setSearchInputPlaceholder(placeholder: string) {
    this.globalSearchService.setSearchInputPlaceholder(placeholder);
  }
}
