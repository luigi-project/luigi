import Hogan from 'hogan.js';

const suggestionTemplate = `
       <div class="ds-suggestion" role="option" id="option-27550019" aria-selected="true">
        <a class="algolia-docsearch-suggestion algolia-docsearch-suggestion__main algolia-docsearch-suggestion__secondary" style="white-space: normal;">
          <div class="algolia-docsearch-suggestion--category-header">
              <span class="algolia-docsearch-suggestion--category-header-lvl0">
               {{{title1}}}
              </span>
          </div>
          <div class="algolia-docsearch-suggestion--wrapper">
            <div class="algolia-docsearch-suggestion--subcategory-column">
              <span class="algolia-docsearch-suggestion--subcategory-column-text">{{{title2}}}</span>
            </div>
            <div class="algolia-docsearch-suggestion--content">
              <div class='algolia-docsearch-suggestion--subcategory-inline'>{{{title2}}}</div>
              <div class="algolia-docsearch-suggestion--title">{{{title3}}}</div>
              <div class="algolia-docsearch-suggestion--text">{{{description}}}</div>
            </div>
          </div>
        </a>
    </div>
        `;

const empty = `
  <div class="algolia-docsearch">
    <div class="algolia-docsearch--wrapper">
        <div class="algolia-docsearch--content algolia-docsearch--no-results">
            <div class="algolia-docsearch--title">
                <div class="algolia-docsearch--text">
                    No results found for query <b>"{{query}}"</b>
                </div>
            </div>
        </div>
    </div>
  </div>
  `;

const KEYCODE_ARROW_UP = 38;
const KEYCODE_ARROW_DOWN = 40;
export const KEYCODE_ENTER = 13;

let eventInit = false;
let currentItems = [];
let currentPosition = 0;
let lastQuery = '';
function handleEvent(event) {
  if (event.keyCode == KEYCODE_ENTER && currentPosition !== 0) {
    currentItems[currentPosition - 1].click();
    return;
  }
  if (event.keyCode !== KEYCODE_ARROW_DOWN && event.keyCode !== KEYCODE_ARROW_UP) {
    return;
  }

  event.keyCode === KEYCODE_ARROW_DOWN ? currentPosition++ : currentPosition--;
  if (currentPosition === -1) {
    currentPosition = currentItems.length;
  }
  currentPosition = currentPosition % (currentItems.length + 1);
  keyElement();
}

function keyElement() {
  currentItems.forEach((item) => item.classList.remove('ds-cursor'));
  if (currentPosition === 0) {
    return;
  }
  currentItems[currentPosition - 1].classList.add('ds-cursor');
}

export default class ResultRender {
  constructor(query, results) {
    this.query = query;
    this.results = results;
    this.addKeyEvent();
  }

  addKeyEvent() {
    if (eventInit) {
      return;
    }
    let elem = document.querySelector('input.luigi-search__input');
    elem.addEventListener('keyup', handleEvent);
    eventInit = true;
  }

  buildDomResults() {
    currentItems = [];
    if (this.query !== lastQuery) {
      currentPosition = 0;
      lastQuery = this.query;
    }
    this.cleanResults();
    const { resultSpan, container } = this.buildContainer();
    if (this.results.length === 0) {
      this.domEmpty(resultSpan);
    } else {
      this.domResults(resultSpan);
    }
    return container;
  }

  cleanResults() {
    let elem = document.querySelector('span.algolia-autocomplete');
    if (elem) {
      elem.remove();
    }
  }

  domResults(span) {
    let template = Hogan.compile(suggestionTemplate);
    for (let result of this.results) {
      let data = this.dataTemplate(result);
      let html = this.renderResult(template, data);
      let searchItem = this.htmlToElement(html);
      this.attachItemEvents(searchItem, result);
      currentItems.push(searchItem);
      span.appendChild(searchItem);
    }
  }

  domEmpty(span) {
    let template = Hogan.compile(empty);
    let data = { query: this.query };
    let output = template.render(data);
    let searchItem = this.htmlToElement(output);
    span.appendChild(searchItem);
  }

  shortText(text) {
    let short = text;
    if (short.length > 80) {
      let lastPost = short.substring(80).indexOf(' ') + 80;
      short = short.substring(0, lastPost) + '..';
    }
    return this.highlightKeyword(short);
  }

  dataTemplate(result) {
    return {
      label: this.shortText(result.label),
      description: this.shortText(result.description),
      title1: this.shortText(result.title1),
      title2: this.shortText(result.title2),
      title3: this.shortText(result.title3)
    };
  }

  renderResult(template, data) {
    return template.render(data);
  }

  highlightKeyword(text) {
    this.perm(this.query).forEach((subQ) => {
      let replace = '<span class="algolia-docsearch-suggestion--highlight">' + subQ + '</span>';
      text = text.replaceAll(subQ, replace);
    });
    return text;
  }

  attachItemEvents(searchItem, result) {
    searchItem.addEventListener('click', (e) => {
      e.preventDefault();
      Luigi.navigation().withParams(result.pathObject.params).navigate(result.pathObject.link);
      Luigi.globalSearch().closeSearchResult();
      Luigi.globalSearch().clearSearchField();
    });
    searchItem.addEventListener('mouseover', (e) => {
      e.preventDefault();
      searchItem.set;
      searchItem.classList.add('ds-cursor');
    });
    searchItem.addEventListener('mouseout', (e) => {
      e.preventDefault();
      searchItem.classList.remove('ds-cursor');
    });
  }

  buildContainer() {
    let span = this.createAttribute('span', {
      class: 'algolia-autocomplete algolia-autocomplete-right',
      style: 'position: relative; display: inline-block; direction: ltr;'
    });
    let span_ = this.createAttribute('span', {
      class: 'ds-dropdown-menu ds-with-1',
      role: 'listbox',
      id: 'algolia-autocomplete-listbox-0',
      style: 'position: absolute; top: 100%; z-index: 100; left: 0px; right: auto; display: block;'
    });
    let div_1 = this.createAttribute('div', { class: 'ds-dataset-1' });
    let span_11 = this.createAttribute('span', { class: 'ds-suggestions', style: 'display: block;' });
    let divLogo = this.htmlToElement(
      '<div class="algolia-docsearch-footer">Search by <a class="algolia-docsearch-footer--logo" ' +
        'href="https://www.algolia.com/docsearch">Algolia</a></div>'
    );

    span.appendChild(span_);
    span_.appendChild(div_1);
    div_1.appendChild(span_11);
    div_1.appendChild(divLogo);

    return {
      container: span,
      resultSpan: span_11
    };
  }

  createAttribute(type, attributes) {
    let elem = document.createElement(type);
    if (!attributes) {
      return elem;
    }
    Object.keys(attributes).forEach((key) => elem.setAttribute(key, attributes[key]));
    return elem;
  }

  htmlToElement(html) {
    return new DOMParser().parseFromString(html, 'text/html').body.firstChild;
  }

  perm(str) {
    let results = [];
    let arr = str.split('');
    let len = Math.pow(arr.length, 2);

    for (let i = 0; i < len; i++) {
      for (let k = 0, j = i; k < arr.length; k++, j >>= 1) {
        arr[k] = j & 1 ? arr[k].toUpperCase() : arr[k].toLowerCase();
      }
      let combo = arr.join('');
      results.push(combo);
    }
    return results;
  }
}
