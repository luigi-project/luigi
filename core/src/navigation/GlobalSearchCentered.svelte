<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { GenericHelpers } from '../utilities/helpers';
  import { GlobalSearchHelperClass } from '../utilities/helpers/global-search-helpers';
  import { TOP_NAV_DEFAULTS } from '../utilities/luigi-config-defaults';
  export let searchResult = [];
  export let displaySearchResult;
  export let inputElem;
  export let customSearchItemRendererSlot;
  export let customSearchItemRendererSlotContainer;
  export let globalSearchConfig;
  const dispatch = createEventDispatcher();
  let cancelBtn = TOP_NAV_DEFAULTS.globalSearchCenteredCancelButton;
  export let isSearchFieldVisible;
  let search = {};
  let displayClearSearchFieldBtn = false;
  let getTranslation = getContext('getTranslation');
  let globalSearchHelper;

  onMount(async () => {
    search = globalSearchConfig;
    cancelBtn = search.globalSearchCenteredCancelButton ? search.globalSearchCenteredCancelButton : cancelBtn;
    globalSearchHelper.setSearchPlaceholder(inputElem);
    globalSearchHelper.getCustomRenderer();
    globalSearchHelper.handleVisibilityGlobalSearch();
    const globalSearchCtn = document.querySelector('.lui-global-search');
    if (globalSearchCtn) {
      const resizeObserver = new ResizeObserver(() => {
        globalSearchHelper.handleVisibilityGlobalSearch();
      });
      resizeObserver.observe(globalSearchCtn);
    }
  });

  beforeUpdate(() => {
    search = globalSearchConfig;
    if (!globalSearchHelper) {
      globalSearchHelper = new GlobalSearchHelperClass(search, dispatch);
    }
    globalSearchHelper.getCustomRenderer();
    renderClearBtn();
  });

  function renderCustomSearchItem(item, slotContainer, index) {
    globalSearchHelper.renderCustomSearchItem(item, slotContainer, index);
  }

  function closeSearchResult() {
    globalSearchHelper.closeSearchResult();
  }

  function onKeyUp(event) {
    globalSearchHelper.onKeyUp(event, displaySearchResult);
  }

  function searchBtnClicked() {
    if (search && GenericHelpers.isFunction(search.searchProvider.onSearchBtnClick)) {
      search.searchProvider.onSearchBtnClick();
    }
  }

  function renderClearBtn() {
    inputElem && inputElem.value ? (displayClearSearchFieldBtn = true) : (displayClearSearchFieldBtn = false);
  }

  function clearSearchField() {
    inputElem.value = '';
    closeSearchResult();
    displayClearSearchFieldBtn = false;
  }

  function onSearchResultItemSelected(searchResultItem) {
    globalSearchHelper.onSearchResultItemSelected(searchResultItem);
  }

  function handleKeydown(result, event) {
    globalSearchHelper.handleKeydown(result, event, inputElem, customSearchItemRendererSlotContainer);
  }

  export function onActionClick(searchResultItem) {
    globalSearchHelper.onActionClick(searchResultItem);
  }

  export function toggleSearch() {
    globalSearchHelper.toggleSearch(isSearchFieldVisible, displaySearchResult, inputElem, customSearchItemRendererSlot);
  }
</script>

<svelte:window on:click={closeSearchResult} on:blur={closeSearchResult} />
<div
  class="fd-shellbar__action lui-global-search-input {isSearchFieldVisible ? 'lui-global-search-mobile--active' : ''}"
>
  <div class="fd-popover">
    <div
      class="luigi-search fd-shellbar__group"
      on:click|stopPropagation={() => {}}
      aria-hidden={!isSearchFieldVisible}
      aria-haspopup="true"
    >
      <div class="fd-input-group fd-shellbar__input-group luigi-search-input-ctn fd-shellbar__search-field">
        {#if search && search.disableInputHandlers}
          <input
            type="text"
            class="fd-input fd-input-group__input fd-shellbar__input-group-input luigi-search__input fd-shellbar__search-field-input"
            data-testid="luigi-search-input__no-handlers"
            onfocus="event.target.parentNode.classList.add('is-focus')"
            onblur="event.target.parentNode.classList.remove('is-focus')"
            placeholder=" "
          />
        {:else}
          <input
            type="text"
            on:keyup={(event) => onKeyUp(event)}
            class="fd-input fd-shellbar__search-field-input
        fd-input-group__input fd-shellbar__input-group-input luigi-search__input"
            data-testid="luigi-search-input"
            bind:this={inputElem}
            on:input={() => renderClearBtn()}
            onfocus="event.target.parentNode.classList.add('is-focus')"
            onblur="event.target.parentNode.classList.remove('is-focus')"
            placeholder=" "
          />
          <div
            class="fd-input-group__addon fd-shellbar__search-field-addon fd-shellbar__search-cancel fd-input-group__addon--button"
          >
            <button
              aria-label="button-search"
              class="fd-shellbar__button fd-button fd-button--transparent"
              on:click={clearSearchField}
            >
              <i class="sap-icon--decline" />
            </button>
          </div>
          <div
            class="fd-input-group__addon fd-shellbar__search-field-addon fd-shellbar__search-submit fd-input-group__addon--button"
          >
            <button
              aria-label="button-search"
              class="fd-shellbar__button fd-button fd-button--transparent"
              on:click={searchBtnClicked}
            >
              <i class="sap-icon--search" />
            </button>
          </div>
          <div class="fd-shellbar__search-field-helper" />
        {/if}
      </div>
      {#if !globalSearchHelper.isCustomSearchRenderer}
        <div
          class="fd-popover__body fd-popover__body--right luigi-search-popover__body"
          aria-hidden={!displaySearchResult}
        >
          <nav class="fd-menu">
            {#if searchResult}
              <ul class="fd-menu__list fd-menu__list--top" bind:this={customSearchItemRendererSlotContainer}>
                {#each searchResult as result, index}
                  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
                  <li
                    class="fd-menu__item luigi-search-result-item__{index}"
                    on:click={(event) => onSearchResultItemSelected(result, event)}
                    on:keyup={(event) => handleKeydown(result, event)}
                    tabindex="0"
                  >
                    {#if !globalSearchHelper.isCustomSearchResultItemRenderer}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-missing-attribute -->
                      <a class="fd-menu__link" on:click|preventDefault={() => {}}>
                        <div class="fd-product-switch__text">
                          <div class="fd-product-switch__title">
                            {result.label}
                          </div>
                          <div class="fd-product-switch__subtitle">
                            {result.description}
                          </div>
                        </div>
                      </a>
                    {:else}
                      {@html renderCustomSearchItem(result, customSearchItemRendererSlotContainer, index)}
                    {/if}
                  </li>
                {/each}
              </ul>
            {/if}
          </nav>
        </div>
      {:else}
        <div bind:this={customSearchItemRendererSlot} />
      {/if}
    </div>
  </div>
</div>
{#if !isSearchFieldVisible}
  <div class="lui-global-search-btn">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="fd-shellbar__group" on:click|stopPropagation={() => {}}>
      <button
        class="fd-button fd-button--transparent fd-shellbar__button"
        aria-haspopup="true"
        aria-expanded={!isSearchFieldVisible}
        on:click={toggleSearch}
        data-testid="luigi-search-btn-desktop"
      >
        <i class="sap-icon sap-icon--search" />
      </button>
    </div>
  </div>
{/if}
{#if isSearchFieldVisible}
  <div
    class="fd-shellbar__group lui-global-search-cancel-btn {isSearchFieldVisible
      ? 'lui-global-search-cancel-btn--active'
      : ''}"
  >
    <button
      class="fd-button fd-button--transparent fd-shellbar__button"
      aria-haspopup="true"
      aria-expanded={!isSearchFieldVisible}
      on:click|stopPropagation={() => toggleSearch()}
      data-testid="luigi-search-cancel-btn"
    >
      {$getTranslation(cancelBtn)}
    </button>
  </div>
{/if}

<style lang="scss">
  //remove default browser outline on focus for search results
  .luigi-search-popover__body {
    li[class*='luigi-search-result']:focus {
      outline: none;
    }
  }

  .lui-clear-search {
    top: -1px;
    position: relative;
  }

  :global(.lui-global-search) {
    order: 2;
    flex-grow: 10;
    max-width: 43rem;
    .fd-popover {
      width: 100%;
    }
  }

  @media (min-width: 1440px) {
    :global(.lui-global-search) {
      margin-left: 3rem;
      margin-right: 3rem;
    }
  }

  @media (min-width: 1024px) and (max-width: 1440px) {
    :global(.lui-global-search) {
      margin-left: 2rem;
      margin-right: 2rem;
    }
  }

  @media (min-width: 1023px) and (max-width: 600px) {
    :global(.lui-global-search) {
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }

  :global(.lui-global-search) {
    display: flex;
    justify-content: center;
  }

  :global(.lui-global-search.lui-global-search-toggle) {
    justify-content: flex-end;
    z-index: 10;
    .lui-global-search-btn {
      display: inline-block;
    }
  }

  .lui-search-btn-ctn {
    font-size: 0;
  }

  .fd-input-group__addon--button {
    display: inline-block;
  }

  :global(.lui-global-search.lui-global-search-toggle) {
    .lui-global-search-input {
      display: none;
    }
    .lui-global-search-input.lui-global-search-mobile--active {
      position: absolute;
      display: block;
      background-color: var(--sapShellColor, #354a5f);
      width: calc(100% - 90px);
      left: 0;
      top: 0;
      z-index: 2;
      padding-left: 1rem;
      padding-right: 0.25rem;
      height: 40px;
    }

    .lui-global-search-cancel-btn.lui-global-search-cancel-btn--active {
      text-align: center;
      position: absolute;
      right: 0;
      display: block;
      display: inline-block;
      background-color: var(--sapShellColor, #354a5f);
      top: 0;
      z-index: 2;
      width: 90px;
      height: 40px;

      .fd-shellbar__button {
        margin-top: 4px;
      }
    }
    .lui-global-search-btn {
      right: 0;
    }
  }

  .lui-global-search-cancel-btn {
    display: none;
  }

  .lui-global-search-btn {
    display: none;
  }

  .lui-global-search-input {
    flex: 0 0 100%;
  }

  :global(.fd-shellbar__group) {
    flex-grow: 1;
  }
  @media (max-width: 599px) {
    :global(.fd-shellbar__logo) {
      display: none;
    }

    :global(.fd-input-group.fd-shellbar__input-group.luigi-search-input-ctn.fd-shellbar__search-field) {
      min-width: 0;
    }
  }

  :global(.fd-input-group.fd-shellbar__input-group.luigi-search-input-ctn.fd-shellbar__search-field) {
    max-width: none;
  }

  :global(
      .fd-input-group__addon.fd-shellbar__search-field-addon.fd-shellbar__search-cancel.fd-input-group__addon--button,
      .fd-input-group__addon.fd-shellbar__search-field-addon.fd-shellbar__search-submit.fd-input-group__addon--button
    ) {
    display: inherit;
  }

  @media (min-width: 600px) {
    :global(.fd-shellbar__group.lui-global-search-cancel-btn.lui-global-search-cancel-btn--active) {
      display: none;
    }
  }
</style>
