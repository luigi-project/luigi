<!-- meta
{
  "node": {
    "label": "Global search",
    "category": {
      "label": "Navigation",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 3,
      "position": 2
    }
  }
}
meta -->
# Global search

![Global Search](/assets/globalsearch.jpg)

The global search element can be used to trigger a search. In your configuration, you can implement a custom search provider and some action events like [onEnter](navigation-parameters-reference.md#searchProvider), [onEscape](navigation-parameters-reference.md#searchProvider), [onInput](navigation-parameters-reference.md#searchProvider) and [onSearchResultItemSelected](navigation-parameters-reference.md#searchProvider).
By default, the search result will be rendered in a popup.

Example:
<!-- fiddle-preset:globalSearch -->
```javascript
searchProvider = {
  onInput: () => {
    let searchString = Luigi.globalSearch().getSearchString();
    //searchProvider does a search
  },
  onEnter: () => {
    Luigi.globalSearch().showSearchResult(searchResults)
  },
  onEscape: () => {
    Luigi.globalSearch().closeSearchResult();
    Luigi.globalSearch().clearSearchField();
  },
  customSearchResultRenderer: (searchResults, slot, searchApiObj) => {
    //If this function is implemented, the default search result popover will not be displayed.
    let div = document.createElement('div');
    div.setAttribute(
      'class',
      'fd-popover__body fd-popover__body--right luigi-search__popover__body'
    );
    let nav = document.createElement('nav');
    nav.setAttribute('class', 'fd-menu');
    let ul = document.createElement('ul');
    ul.setAttribute('class', 'fd-menu__list fd-menu__list--top');
    for (let i = 0; i < searchResults.length; i++) {
      let li = document.createElement('li');
      li.setAttribute('class', 'fd-menu__item');
      let a = document.createElement('a');
      a.addEventListener('click', e => {
        searchApiObj.fireItemSelected(searchResults[i]);
      });
      a.setAttribute('class', 'fd-menu__link');
      let span = document.createElement('span');
      span.setAttribute('class', 'fd-menu__title');
      span.innerHTML = searchResults[i].label;
      a.appendChild(span);
      li.appendChild(a);
      ul.appendChild(li);
    }
    nav.appendChild(ul);
    div.appendChild(nav);
    slot.appendChild(div);
  },
  customSearchResultItemRenderer: (searchResultItem, slot, searchApiObj) => {
      let a = document.createElement('a');
    a.setAttribute('class', 'fd-menu__link');
    a.setAttribute('style', 'fd-menu__link');
    a.addEventListener('click', () => {
      searchApiObj.fireItemSelected(searchResultItem);
    })
    let span = document.createElement('span');
    span.setAttribute('class', "fd-menu__title");
    span.innerHTML = searchResultItem.label;
    a.appendChild(span);
    slot.appendChild(a);
  },
  onSearchResultItemSelected: searchResultItem => {
    Luigi.navigation().withParams(searchResultItem.pathObject.params).navigate(searchResultItem.pathObject.link);
  }
}
```