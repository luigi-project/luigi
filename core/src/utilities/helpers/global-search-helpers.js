/* istanbul ignore file */
import { GenericHelpers } from './';
import { KEYCODE_ARROW_UP, KEYCODE_ARROW_DOWN, KEYCODE_ENTER, KEYCODE_ESC } from './../keycode.js';
import { Routing } from './../../services/routing';
import { LuigiI18N } from './../../core-api';
export class GlobalSearchHelperClass {
  dispatch;
  search;
  isCustomSearchRenderer;
  isCustomSearchResultItemRenderer;
  customSearchItemRendererSlotContainer;

  constructor(search, dispatcher) {
    this.search = search;
    this.dispatch = dispatcher;
  }

  getCustomRenderer() {
    if (!this.search.searchProvider) return;
    this.isCustomSearchRenderer = GenericHelpers.isFunction(this.search.searchProvider.customSearchResultRenderer);
    this.isCustomSearchResultItemRenderer = GenericHelpers.isFunction(
      this.search.searchProvider.customSearchResultItemRenderer
    );
  }

  updateCustomSearchItemRendererSlotContainer(updatedSlotContainer) {
    this.customSearchItemRendererSlotContainer = updatedSlotContainer;
  }

  handleVisibilityGlobalSearch() {
    if (!document.querySelector('.lui-global-search')) return;
    const globalSearchCtn = document.querySelector('.lui-global-search');
    const condition = globalSearchCtn.offsetWidth <= 384;
    globalSearchCtn.classList.toggle('lui-global-search-toggle', condition);
  }

  setSearchPlaceholder(inputElement) {
    const placeHolder = this.getSearchPlaceholder();
    if (placeHolder) {
      inputElement.placeholder = placeHolder;
    }
  }

  getSearchPlaceholder() {
    const searchProvider = this.search.searchProvider;
    if (!searchProvider || !searchProvider.inputPlaceholder) {
      return undefined;
    }
    const currentLocale = LuigiI18N.getCurrentLocale();
    if (GenericHelpers.isFunction(searchProvider.inputPlaceholder)) {
      return searchProvider.inputPlaceholder();
    }
    if (typeof searchProvider.inputPlaceholder === 'string') {
      const translated = LuigiI18N.getTranslation(searchProvider.inputPlaceholder);
      if (!!translated && translated.trim().length > 0) {
        return translated;
      }
      return searchProvider.inputPlaceholder;
    }
    if (typeof searchProvider.inputPlaceholder === 'object') {
      return searchProvider.inputPlaceholder[currentLocale];
    }
  }

  renderCustomSearchItem(item, slotContainer, index) {
    setTimeout(() => {
      search.searchProvider.customSearchResultItemRenderer(item, slotContainer.children[index], searchApiObj);
    });
    return '';
  }

  onKeyUp({ keyCode }, displaySearchResult) {
    if (this.search && this.search.searchProvider) {
      if (GenericHelpers.isFunction(this.search.searchProvider.onEnter) && keyCode === KEYCODE_ENTER) {
        this.search.searchProvider.onEnter();
      } else if (GenericHelpers.isFunction(this.search.searchProvider.onEscape) && keyCode === KEYCODE_ESC) {
        this.search.searchProvider.onEscape();
      } else if (keyCode === KEYCODE_ARROW_DOWN) {
        if (displaySearchResult) {
          document.querySelector('.luigi-search-result-item__0').childNodes[0].setAttribute('aria-selected', 'true');
          document.querySelector('.luigi-search-result-item__0').focus();
        }
      } else if (GenericHelpers.isFunction(this.search.searchProvider.onInput)) {
        this.search.searchProvider.onInput();
      }
    } else {
      console.warn('GlobalSearch is not available.');
    }
  }

  calcSearchResultItemSelected(direction) {
    let renderedSearchResultItems = this.customSearchItemRendererSlotContainer.children;
    if (renderedSearchResultItems) {
      for (let index = 0; index < renderedSearchResultItems.length; index++) {
        let { childNodes, nextSibling, previousSibling } = renderedSearchResultItems[index];
        let nodeSibling;
        if (childNodes[0].getAttribute('aria-selected') === 'true') {
          if (direction === KEYCODE_ARROW_DOWN) {
            nodeSibling = nextSibling !== null ? nextSibling : renderedSearchResultItems[0];
          }
          if (direction === KEYCODE_ARROW_UP) {
            nodeSibling =
              previousSibling !== null
                ? previousSibling
                : renderedSearchResultItems[renderedSearchResultItems.length - 1];
          }
          childNodes[0].setAttribute('aria-selected', 'false');
          nodeSibling.childNodes[0].setAttribute('aria-selected', 'true');
          nodeSibling.focus();
          break;
        }
      }
    }
  }

  clearAriaSelected() {
    let renderedSearchResultItems = this.customSearchItemRendererSlotContainer.children;
    if (renderedSearchResultItems) {
      for (let index = 0; index < renderedSearchResultItems.length; index++) {
        let element = renderedSearchResultItems[index];
        if (element.childNodes[0].getAttribute('aria-selected') === 'true') {
          element.childNodes[0].setAttribute('aria-selected', 'false');
        }
      }
    }
  }

  closeSearchResult() {
    this.dispatch('closeSearchResult');
  }

  onSearchResultItemSelected(searchResultItem) {
    if (this.search && GenericHelpers.isFunction(this.search.searchProvider.onSearchResultItemSelected)) {
      this.search.searchProvider.onSearchResultItemSelected(searchResultItem);
    } else if (GenericHelpers.isFunction(this.search.searchProvider.onEscape) && event.keyCode === KEYCODE_ESC) {
      this.search.searchProvider.onEscape();
    }
  }

  handleKeydown(result, { keyCode }, inputElement, customSearchItemRendererSlotContainer) {
    this.updateCustomSearchItemRendererSlotContainer(customSearchItemRendererSlotContainer);
    if (keyCode === KEYCODE_ENTER) {
      this.search.searchProvider.onSearchResultItemSelected(result, this.search);
    }
    if (keyCode === KEYCODE_ARROW_UP || keyCode === KEYCODE_ARROW_DOWN) {
      this.calcSearchResultItemSelected(keyCode);
    } else if (GenericHelpers.isFunction(this.search.searchProvider.onEscape) && keyCode === KEYCODE_ESC) {
      this.clearAriaSelected(this.customSearchItemRendererSlotContainer);
      setTimeout(() => this.setFocusOnGlobalSearchFieldDesktop(inputElement));
      this.search.searchProvider.onEscape();
    }
  }

  setFocusOnGlobalSearchFieldDesktop(inputElement) {
    if (inputElement) {
      inputElement.focus();
    }
  }

  onActionClick(searchResultItem) {
    let node = searchResultItem.pathObject;
    if (node.externalLink) {
      Routing.navigateToLink(node);
    } else {
      this.dispatch('handleSearchNavigation', { node });
    }
  }

  toggleSearch(isSearchFieldVisible, displaySearchResult, inputElem, customSearchItemRendererSlot) {
    if (!isSearchFieldVisible) {
      setTimeout(() => this.setFocusOnGlobalSearchFieldDesktop(inputElem));
    } else {
      displaySearchResult = false;
    }

    this.dispatch('toggleSearch', {
      isSearchFieldVisible,
      inputElem,
      customSearchItemRendererSlot
    });

    if (
      this.search &&
      this.search.searchProvider &&
      GenericHelpers.isFunction(this.search.searchProvider.toggleSearch)
    ) {
      const fieldVisible = isSearchFieldVisible === undefined ? true : !isSearchFieldVisible;
      this.search.searchProvider.toggleSearch(inputElem, fieldVisible);
    }
  }

  // Clear the input and notify the search provider so the result list updates.
  clearSearchField(inputElement) {
    if (inputElement) {
      inputElement.value = '';
      inputElement.focus();
    }
    if (this.search && this.search.searchProvider) {
      if (GenericHelpers.isFunction(this.search.searchProvider.onInput)) {
        this.search.searchProvider.onInput();
      }
    }
    this.closeSearchResult();
  }

  // In-pill magnifier:
  //   - empty input → collapse the field (toggle off)
  //   - non-empty input → submit (call onSearchBtnClick if provided, else onEnter)
  onSearchBtnClick(inputElement, displaySearchResult) {
    const value = inputElement && inputElement.value ? inputElement.value : '';
    if (!value) {
      this.toggleSearch(true, displaySearchResult, inputElement, undefined);
      return;
    }
    if (this.search && this.search.searchProvider) {
      if (GenericHelpers.isFunction(this.search.searchProvider.onSearchBtnClick)) {
        this.search.searchProvider.onSearchBtnClick();
      } else if (GenericHelpers.isFunction(this.search.searchProvider.onEnter)) {
        this.search.searchProvider.onEnter();
      }
    }
  }
}
