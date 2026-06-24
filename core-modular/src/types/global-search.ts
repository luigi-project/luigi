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
