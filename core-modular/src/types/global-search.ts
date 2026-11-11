/**
 * Top-level `globalSearch` section of the Luigi configuration.
 *
 * See https://docs.luigi-project.io/docs/navigation-parameters-reference?section=global-search.
 */
export interface GlobalSearch {
  /**
   * Disables Luigi's internal keyup/etc. handlers on the search input field.
   * When `true`, a `searchProvider` must be defined to attach custom logic.
   */
  disableInputHandlers?: boolean;

  /**
   * Label for the cancel button shown next to the search field on small viewports
   * in centered mode. Only used when `searchFieldCentered` is active. Defaults to
   * `'Cancel'`.
   */
  globalSearchCenteredCancelButton?: string;

  /**
   * Render the search input in the center of the shellbar instead of inline.
   */
  searchFieldCentered?: boolean;

  /**
   * Provider object carrying the renderers and event callbacks Luigi invokes
   * during search interaction.
   */
  searchProvider?: GlobalSearchProvider;
}

export interface GlobalSearchProvider {
  customSearchResultItemRenderer?: (searchResultItem: any, slot: HTMLLIElement, searchApiObj: any) => object;
  customSearchResultRenderer?: (searchResults: any[], slot: HTMLDivElement, searchApiObj: any) => object;
  /**
   * Placeholder text for the search input. May be a plain string, a function
   * returning a string, or a locale-keyed map (`{ en: '...', de: '...' }`).
   */
  inputPlaceholder?: string | (() => string) | Record<string, string>;
  onEnter?: () => void;
  onEscape?: () => void;
  onInput?: () => void;
  onSearchBtnClick?: () => void;
  onSearchResultItemSelected?: (searchResultItem: any) => void;
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
