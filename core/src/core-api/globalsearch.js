/* istanbul ignore file */

/**
 * @summary Functions to use Luigi Global Search.
 * @name GlobalSearch
 * @class
 */
class LuigiGlobalSearch {
  /**
   * Opens the global search field.
   * @memberof GlobalSearch
   * @since 1.3.0
   * @example Luigi.globalSearch().openSearchField();
   */
  openSearchField() {
    Luigi.openSearchField();
  }

  /**
   * Closes the global search field.
   * @memberof GlobalSearch
   * @since 1.3.0
   * @example Luigi.globalSearch().closeSearchField();
   */
  closeSearchField() {
    Luigi.closeSearchField();
  }

  /**
   * Clears the global search field.
   * @memberof GlobalSearch
   * @since 1.3.0
   * @example Luigi.globalSearch().clearSearchField();
   */
  clearSearchField() {
    Luigi.clearSearchField();
  }

  /**
   * Opens the global search result. By standard it is a popover.
   * @memberof GlobalSearch
   * @param {Array} searchResultItems
   * @since 1.3.0
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
  showSearchResult(searchResultItems) {
    Luigi.showSearchResult(searchResultItems);
  }

  /**
   * Closes the global search result. By standard it is rendered as a popover.
   * @memberof GlobalSearch
   * @since 1.3.0
   * @example Luigi.globalSearch().closeSearchResult();
   */
  closeSearchResult() {
    Luigi.closeSearchResult();
  }

  /**
   * Gets the value of the search input field.
   * @memberof GlobalSearch
   * @since 1.3.0
   * @example Luigi.globalSearch().getSearchString();
   */
  getSearchString() {
    return Luigi.getGlobalSearchString();
  }

  /**
   * Sets the value of the search input field.
   * @memberof GlobalSearch
   * @param searchString search value
   * @since 1.3.0
   * @example Luigi.globalSearch().setSearchString('searchString');
   */
  setSearchString(searchString) {
    Luigi.setGlobalSearchString(searchString);
  }

  /**
   * Sets the value of the Placeholder search input field.
   * @memberof GlobalSearch
   * @param searchString search value
   * @since 1.7.1
   * @example Luigi.globalSearch().setSearchInputPlaceholder('HERE input Placeholder');
   */
  setSearchInputPlaceholder(searchString) {
    Luigi.setSearchInputPlaceholder(searchString);
  }
}
export const globalSearch = new LuigiGlobalSearch();
