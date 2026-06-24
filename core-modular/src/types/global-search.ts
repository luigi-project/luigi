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

/**
 * Imperative global-search surface exposed by a Luigi connector.
 *
 * The connector returns this handler from `getGlobalSearchHandler()`; if the
 * connector does not implement global search, it may omit `getGlobalSearchHandler`
 * entirely.
 */
export interface GlobalSearchHandler {
  openSearchField(): void;

  closeSearchField(): void;

  clearSearchField(): void;

  showSearchResult(
    searchResultItems: SearchResultItem[],
    searchQuery: string,
    isCentered: boolean,
    onShowCallback: (rendererSlot?: any) => void
  ): void;

  closeSearchResult(): void;

  setSearchString(searchString: string, onSetCallback: (inputElem?: HTMLInputElement) => void): void;

  setSearchInputPlaceholder(placeholder: string): void;

  toggleSearch(isSearchFieldVisible: boolean, onToggleCallback: (inputElem?: HTMLInputElement) => void): void;
}
