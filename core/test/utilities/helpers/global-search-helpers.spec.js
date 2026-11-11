import { GlobalSearchHelperClass } from '../../../src/utilities/helpers';
import { LuigiI18N } from '../../../src/core-api';
import { Routing } from '../../../src/services';
import { KEYCODE_ENTER, KEYCODE_ESC, KEYCODE_ARROW_DOWN, KEYCODE_ARROW_UP } from '../../../src/utilities/keycode';
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Global-search-helpers', () => {
  let globalSearchHelpers;
  let search;
  let dispatch;
  let inputElement;

  beforeEach(() => {
    inputElement = document.createElement('input');
    search = {};
    dispatch = sinon.spy();
    globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
    getCurrentLocaleStub = sinon.stub(LuigiI18N, 'getCurrentLocale').returns('en');
    getTranslationStub = sinon.stub(LuigiI18N, 'getTranslation').returns('Digit here text to search....');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getCustomRenderer', () => {
    it('should return if no search provider', () => {
      globalSearchHelpers.getCustomRenderer();
      assert.notExists(globalSearchHelpers.customSearchResultRenderer);
      assert.notExists(globalSearchHelpers.customSearchResultItemRenderer);
    });
  });

  describe('setSearchPlaceholder', () => {
    function setupSearchProvider(inputPlaceholder) {
      search = {
        searchProvider: {
          inputPlaceholder
        }
      };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      globalSearchHelpers.setSearchPlaceholder(inputElement);
    }

    it('should set the search input placeholder when it is a string', () => {
      setupSearchProvider('Digit here text to search....');
      assert.strictEqual(inputElement.placeholder, 'Digit here text to search....');
    });

    it('should set the search input placeholder correctly when it is a function', () => {
      setupSearchProvider(() => 'Function placeholder text');
      assert.strictEqual(inputElement.placeholder, 'Function placeholder text');
    });

    it('should set the search input placeholder correctly with translation', () => {
      setupSearchProvider({
        en: 'English placeholder text',
        fr: 'Texte de remplacement français'
      });
      assert.strictEqual(inputElement.placeholder, 'English placeholder text');
    });

    it('should not set placeholder if searchProvider was not defined', () => {
      assert.strictEqual(inputElement.placeholder, '');
    });
  });

  describe('onKeyUp', () => {
    it('should call onEnter when ENTER key is pressed', () => {
      const onEnterSpy = sinon.spy();
      search = {
        searchProvider: {
          onEnter: onEnterSpy
        }
      };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      const event = { keyCode: KEYCODE_ENTER };
      globalSearchHelpers.onKeyUp(event);
      assert.isTrue(onEnterSpy.calledOnce, 'onEnter should be called once');
    });

    it('should call onEscape when ESC key is pressed', () => {
      const onEscapeSpy = sinon.spy();
      search = {
        searchProvider: {
          onEscape: onEscapeSpy
        }
      };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      const event = { keyCode: KEYCODE_ESC };
      globalSearchHelpers.onKeyUp(event);
      assert.isTrue(onEscapeSpy.calledOnce, 'onEscape should be called once');
    });

    it('should call onInput for other keys when onInput is defined', () => {
      const onInputSpy = sinon.spy();
      search = {
        searchProvider: {
          onInput: onInputSpy
        }
      };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      const event = { keyCode: 65 }; // ASCII code for 'A'
      globalSearchHelpers.onKeyUp(event);
      assert.isTrue(onInputSpy.calledOnce, 'onInput should be called once');
    });
  });

  describe('onActionClick', () => {
    it('should navigate to external link if node.externalLink is defined', () => {
      const navigateToLinkStub = sinon.stub(Routing, 'navigateToLink');
      const searchResultItem = {
        pathObject: {
          externalLink: 'http://example.com'
        }
      };

      globalSearchHelpers.onActionClick(searchResultItem);

      assert.isTrue(navigateToLinkStub.calledOnce);
      assert.isTrue(navigateToLinkStub.calledWith(searchResultItem.pathObject));

      navigateToLinkStub.restore();
    });

    it('should dispatch handleSearchNavigation if node.externalLink is not defined', () => {
      const searchResultItem = {
        pathObject: {
          link: '/some/path'
        }
      };

      globalSearchHelpers.onActionClick(searchResultItem);

      assert.isTrue(dispatch.calledOnce);
      assert.isTrue(dispatch.calledWith('handleSearchNavigation', { node: searchResultItem.pathObject }));
    });
  });

  describe('handleKeydown', () => {
    let search;
    let inputElement;
    let customSearchItemRendererSlotContainer;
    let globalSearchHelpers;
    let clock;

    beforeEach(() => {
      search = {
        searchProvider: {
          onSearchResultItemSelected: sinon.spy(),
          onEscape: sinon.spy()
        }
      };
      inputElement = document.createElement('input');
      customSearchItemRendererSlotContainer = document.createElement('div');
      globalSearchHelpers = new GlobalSearchHelperClass(search);
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    function assertMethodCalledWithArgs(method, args) {
      const methodStub = sinon.stub(globalSearchHelpers, method);

      globalSearchHelpers.handleKeydown(args.result, args.event, inputElement, customSearchItemRendererSlotContainer);

      assert.isTrue(methodStub.calledOnce, `${method} should be called once`);
      assert.isTrue(methodStub.calledWith(...args.expectedArgs), `${method} should be called with correct arguments`);

      methodStub.restore();
    }

    it('should call onSearchResultItemSelected when ENTER key is pressed', () => {
      const result = {};
      const event = { keyCode: KEYCODE_ENTER };

      globalSearchHelpers.handleKeydown(result, event, inputElement, customSearchItemRendererSlotContainer);

      assert.isTrue(search.searchProvider.onSearchResultItemSelected.calledOnce);
      assert.isTrue(search.searchProvider.onSearchResultItemSelected.calledWith(result, search));
    });

    it('should call calcSearchResultItemSelected when ARROW_UP key is pressed', () => {
      const event = { keyCode: KEYCODE_ARROW_UP };
      assertMethodCalledWithArgs('calcSearchResultItemSelected', {
        result: null,
        event,
        expectedArgs: [KEYCODE_ARROW_UP]
      });
    });

    it('should call calcSearchResultItemSelected when ARROW_DOWN key is pressed', () => {
      const event = { keyCode: KEYCODE_ARROW_DOWN };
      assertMethodCalledWithArgs('calcSearchResultItemSelected', {
        result: null,
        event,
        expectedArgs: [KEYCODE_ARROW_DOWN]
      });
    });

    it('should call onEscape and clearAriaSelected when ESC key is pressed', () => {
      const event = { keyCode: KEYCODE_ESC };

      const clearAriaSelectedStub = sinon.stub(globalSearchHelpers, 'clearAriaSelected');
      const setFocusOnGlobalSearchFieldDesktopStub = sinon.stub(
        globalSearchHelpers,
        'setFocusOnGlobalSearchFieldDesktop'
      );

      globalSearchHelpers.handleKeydown(null, event, inputElement, customSearchItemRendererSlotContainer);
      clock.tick(0);

      assert.isTrue(search.searchProvider.onEscape.calledOnce);
      assert.isTrue(clearAriaSelectedStub.calledOnce);
      assert.isTrue(setFocusOnGlobalSearchFieldDesktopStub.calledOnce);

      clearAriaSelectedStub.restore();
      setFocusOnGlobalSearchFieldDesktopStub.restore();
    });
  });

  describe('toggleSearch', () => {
    let globalSearchHelpers;
    let search;
    let dispatchSpy;
    let clock;

    beforeEach(() => {
      search = {
        searchProvider: {
          toggleSearch: sinon.spy()
        }
      };
      dispatchSpy = sinon.spy();
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatchSpy);
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('should set focus on the search field if it is not visible', () => {
      const isSearchFieldVisible = false;
      const displaySearchResult = true;
      const inputElem = document.createElement('input');
      const customSearchItemRendererSlot = document.createElement('div');

      const setFocusSpy = sinon.spy(globalSearchHelpers, 'setFocusOnGlobalSearchFieldDesktop');

      globalSearchHelpers.toggleSearch(
        isSearchFieldVisible,
        displaySearchResult,
        inputElem,
        customSearchItemRendererSlot
      );

      clock.tick(0);
      assert.isTrue(setFocusSpy.calledOnce);
      setFocusSpy.restore();
    });

    it('should dispatch toggleSearch with correct parameters', () => {
      const isSearchFieldVisible = true;
      const displaySearchResult = true;
      const inputElem = document.createElement('input');
      const customSearchItemRendererSlot = document.createElement('div');

      globalSearchHelpers.toggleSearch(
        isSearchFieldVisible,
        displaySearchResult,
        inputElem,
        customSearchItemRendererSlot
      );

      assert.isTrue(dispatchSpy.calledOnce);
      assert.isTrue(
        dispatchSpy.calledWith('toggleSearch', {
          isSearchFieldVisible,
          inputElem,
          customSearchItemRendererSlot
        })
      );
    });

    it('should call searchProvider.toggleSearch with correct parameters', () => {
      const isSearchFieldVisible = true;
      const displaySearchResult = true;
      const inputElem = document.createElement('input');
      const customSearchItemRendererSlot = document.createElement('div');

      globalSearchHelpers.toggleSearch(
        isSearchFieldVisible,
        displaySearchResult,
        inputElem,
        customSearchItemRendererSlot
      );

      assert.isTrue(search.searchProvider.toggleSearch.calledOnce);
      assert.isTrue(search.searchProvider.toggleSearch.calledWith(inputElem, !isSearchFieldVisible));
    });
  });

  describe('clearSearchField', () => {
    it('should clear the input value and focus the element', () => {
      inputElement.value = 'some query';
      const focusSpy = sinon.spy(inputElement, 'focus');

      globalSearchHelpers.clearSearchField(inputElement);

      assert.strictEqual(inputElement.value, '');
      assert.isTrue(focusSpy.calledOnce);
    });

    it('should dispatch closeSearchResult', () => {
      globalSearchHelpers.clearSearchField(inputElement);

      assert.isTrue(dispatch.calledWith('closeSearchResult'));
    });

    it('should call searchProvider.onInput if defined so the result list refreshes', () => {
      const onInputSpy = sinon.spy();
      search = { searchProvider: { onInput: onInputSpy } };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);

      globalSearchHelpers.clearSearchField(inputElement);

      assert.isTrue(onInputSpy.calledOnce);
    });

    it('should not throw when searchProvider is not defined', () => {
      assert.doesNotThrow(() => globalSearchHelpers.clearSearchField(inputElement));
      assert.isTrue(dispatch.calledWith('closeSearchResult'));
    });

    it('should not throw when inputElement is missing', () => {
      assert.doesNotThrow(() => globalSearchHelpers.clearSearchField(null));
      assert.isTrue(dispatch.calledWith('closeSearchResult'));
    });
  });

  describe('onSearchBtnClick', () => {
    it('should collapse the search field by calling toggleSearch when the input is empty', () => {
      const toggleSearchSpy = sinon.spy(globalSearchHelpers, 'toggleSearch');
      inputElement.value = '';

      globalSearchHelpers.onSearchBtnClick(inputElement, true);

      assert.isTrue(toggleSearchSpy.calledOnce);
      assert.isTrue(toggleSearchSpy.calledWith(true, true, inputElement, undefined));
      toggleSearchSpy.restore();
    });

    it('should collapse the search field when inputElement is missing', () => {
      const toggleSearchSpy = sinon.spy(globalSearchHelpers, 'toggleSearch');

      globalSearchHelpers.onSearchBtnClick(null, false);

      assert.isTrue(toggleSearchSpy.calledOnce);
      toggleSearchSpy.restore();
    });

    it('should call searchProvider.onSearchBtnClick when input has a value', () => {
      const onSearchBtnClickSpy = sinon.spy();
      const onEnterSpy = sinon.spy();
      search = { searchProvider: { onSearchBtnClick: onSearchBtnClickSpy, onEnter: onEnterSpy } };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      inputElement.value = 'hello';

      globalSearchHelpers.onSearchBtnClick(inputElement, false);

      assert.isTrue(onSearchBtnClickSpy.calledOnce);
      assert.isTrue(onEnterSpy.notCalled, 'onEnter should not be called when onSearchBtnClick is defined');
    });

    it('should fall back to searchProvider.onEnter when onSearchBtnClick is not defined', () => {
      const onEnterSpy = sinon.spy();
      search = { searchProvider: { onEnter: onEnterSpy } };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      inputElement.value = 'hello';

      globalSearchHelpers.onSearchBtnClick(inputElement, false);

      assert.isTrue(onEnterSpy.calledOnce);
    });

    it('should not call toggleSearch when input has a value', () => {
      const onEnterSpy = sinon.spy();
      search = { searchProvider: { onEnter: onEnterSpy } };
      globalSearchHelpers = new GlobalSearchHelperClass(search, dispatch);
      inputElement.value = 'hello';
      const toggleSearchSpy = sinon.spy(globalSearchHelpers, 'toggleSearch');

      globalSearchHelpers.onSearchBtnClick(inputElement, false);

      assert.isTrue(toggleSearchSpy.notCalled);
      toggleSearchSpy.restore();
    });

    it('should not throw when searchProvider is not defined and input has a value', () => {
      inputElement.value = 'hello';

      assert.doesNotThrow(() => globalSearchHelpers.onSearchBtnClick(inputElement, false));
    });
  });
});
