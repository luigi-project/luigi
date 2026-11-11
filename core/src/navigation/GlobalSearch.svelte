<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';
  import { GlobalSearchHelperClass } from '../utilities/helpers/global-search-helpers';
  import { TOP_NAV_DEFAULTS } from '../utilities/luigi-config-defaults';
  export let isSearchFieldVisible;
  export let searchResult = [];
  export let displaySearchResult;
  export let inputElem;
  export let customSearchItemRendererSlot;
  export let customSearchItemRendererSlotContainer;
  export let globalSearchConfig;
  const dispatch = createEventDispatcher();
  let search = {};
  let submitBtn = TOP_NAV_DEFAULTS.globalSearchSubmitButton;
  let getTranslation = getContext('getTranslation');
  let globalSearchHelper;
  // When globalSearch.style === 'vega', render the modern layout: in-pill submit/cancel
  // addons matching the Fundamental Styles shellbar reference, with the outside toggle
  // hidden while expanded so the pill visually wraps around it. Default (any other value)
  // keeps the original two-button layout.
  $: isVegaStyle = globalSearchConfig && globalSearchConfig.style === 'vega';

  onMount(async () => {
    submitBtn = search.globalSearchSubmitButton ? search.globalSearchSubmitButton : submitBtn;
    globalSearchHelper.setSearchPlaceholder(inputElem);
    globalSearchHelper.getCustomRenderer();
  });

  beforeUpdate(() => {
    search = globalSearchConfig;
    if (!globalSearchHelper) {
      globalSearchHelper = new GlobalSearchHelperClass(search, dispatch);
    }
    globalSearchHelper.getCustomRenderer();
  });

  function closeSearchResult() {
    globalSearchHelper.closeSearchResult();
  }

  function onKeyUp(event) {
    globalSearchHelper.onKeyUp(event, displaySearchResult);
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

  function clearSearch() {
    globalSearchHelper.clearSearchField(inputElem, displaySearchResult);
  }

  function submitSearch() {
    globalSearchHelper.onSearchBtnClick(inputElem, displaySearchResult);
  }
</script>

<svelte:window on:click={closeSearchResult} on:blur={closeSearchResult} />
<div class="fd-shellbar__action {isSearchFieldVisible ? 'luigi-search-shell__mobile' : ''}">
  <div class="fd-popover">
    <div
      class="fd-popover__control luigi-search"
      class:luigi-search--vega={isVegaStyle}
      on:click|stopPropagation={() => {}}
      aria-hidden={!isSearchFieldVisible}
      aria-haspopup="true"
      role="button"
    >
      <div class="fd-input-group fd-shellbar__input-group fd-shellbar__search-field">
        {#if search && search.disableInputHandlers}
          <!-- svelte-ignore a11y-autofocus -->
          <input
            type="text"
            class="fd-input fd-input-group__input fd-shellbar__input-group-input luigi-search__input fd-shellbar__search-field-input"
            data-testid="luigi-search-input__no-handlers"
            autofocus
            on:focus={(event) => event.target.parentNode.classList.add('is-focus')}
            on:blur={(event) => event.target.parentNode.classList.remove('is-focus')}
          />
        {:else}
          <!-- svelte-ignore a11y-autofocus -->
          <input
            type="text"
            on:keyup={(event) => onKeyUp(event)}
            class="fd-input fd-input-group__input fd-shellbar__input-group-input luigi-search__input fd-shellbar__search-field-input"
            data-testid="luigi-search-input"
            autofocus
            on:focus={(event) => event.target.parentNode.classList.add('is-focus')}
            on:blur={(event) => event.target.parentNode.classList.remove('is-focus')}
            bind:this={inputElem}
          />
        {/if}
        {#if isVegaStyle}
          <!-- cancel (X): hidden by FS via :placeholder-shown sibling rule until input has text -->
          <div
            class="fd-input-group__addon fd-shellbar__search-field-addon fd-shellbar__search-cancel fd-input-group__addon--button"
          >
            <button
              class="fd-shellbar__button fd-button fd-button--transparent"
              aria-label="Clear search"
              on:click|stopPropagation={clearSearch}
              tabindex="-1"
              data-testid="luigi-search-cancel"
            >
              <i class="sap-icon sap-icon--decline" />
            </button>
          </div>
          <!-- submit magnifier: inside the search-field pill -->
          <div
            class="fd-input-group__addon fd-shellbar__search-field-addon fd-shellbar__search-submit fd-input-group__addon--button"
          >
            <button
              class="fd-shellbar__button fd-button fd-button--transparent"
              aria-label={$getTranslation(submitBtn)}
              on:click|stopPropagation={submitSearch}
              data-testid="luigi-search-submit"
            >
              <i class="sap-icon sap-icon--search" />
            </button>
          </div>
        {/if}
        <div class="fd-shellbar__search-field-helper" />
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
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <li
                    class="fd-menu__item luigi-search-result-item__{index}"
                    on:click={(event) => globalSearchHelper.onSearchResultItemSelected(result, event)}
                    on:keyup={(event) => handleKeydown(result, event)}
                    tabindex="0"
                  >
                    {#if !globalSearchHelper.isCustomSearchResultItemRenderer}
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <!-- svelte-ignore a11y-interactive-supports-focus -->
                      <!-- svelte-ignore a11y-missing-attribute -->
                      <a class="fd-menu__link" role="button" on:click|preventDefault={() => {}}>
                        <div class="fd-product-switch__text">
                          <div class="fd-product-switch__title">{result.label}</div>
                          <div class="fd-product-switch__subtitle">{result.description}</div>
                        </div>
                      </a>
                    {:else}
                      {@html globalSearchHelper.renderCustomSearchItem(
                        result,
                        customSearchItemRendererSlotContainer,
                        index
                      )}
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
<div
  class="fd-shellbar__action fd-shellbar__action--desktop luigi-search-btn-toggle"
  class:luigi-search-btn-toggle--hidden={isVegaStyle && isSearchFieldVisible}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div role="presentation" on:click|stopPropagation={() => {}}>
    <button
      class="fd-button fd-button--transparent fd-shellbar__button"
      aria-haspopup="true"
      aria-expanded={!isSearchFieldVisible}
      aria-label={$getTranslation(submitBtn)}
      on:click={toggleSearch}
      data-testid="luigi-search-btn-desktop"
    >
      <i class="sap-icon sap-icon--search" />
    </button>
  </div>
</div>

<style lang="scss">
  //remove default browser outline on focus for search results
  .luigi-search-popover__body {
    li[class*='luigi-search-result']:focus {
      outline: none;
    }
  }

  .luigi-search-btn-toggle--hidden {
    display: none;
  }

  .fd-popover:has(.luigi-search:not(.luigi-search--vega)) {
    margin-top: -1px;
    max-height: calc(var(--sapElement_LineHeight) - 2px);
  }

  .luigi-search:not(.luigi-search--vega) .luigi-search__input {
    width: 184px;
  }

  .luigi-search {
    &[aria-hidden='true'] {
      visibility: hidden;
      width: 0;
    }

    &-popover__body {
      top: calc(2.25rem + 5px);

      &:before,
      &:after {
        display: none;
      }
      .fd-menu {
        max-height: 70vh;
        overflow: auto;
        .fd-menu__item {
          margin-bottom: 10px;
          &:first-child {
            margin-top: 10px;
          }
          &:last-child .fd-menu__link {
            border-radius: 0;
          }
          .fd-product-switch__title {
            font-weight: 600;
          }
        }
      }
    }
  }

  //remove arrow from the search popover
  @media screen and (max-width: 1024px) {
    :global(.lui-shellbar_group--actions .fd-shellbar__input-group.fd-shellbar__search-field) {
      margin-bottom: 0;
    }

    .luigi-search-shell__mobile {
      position: relative;
      height: calc(2.25rem + 2px);
      padding: 0;

      .fd-popover {
        vertical-align: top;
      }

      .luigi-search {
        position: absolute;
        top: -2px;
        right: 0;
        background: var(--sapShellColor);
        z-index: 2;
      }

      .fd-menu {
        max-width: 12rem;
      }
    }
  }

  @media (max-width: 599px) {
    :global(.lui-shellbar_group--actions .fd-shellbar__input-group.fd-shellbar__search-field) {
      max-width: 11rem;
      min-width: 0;
    }
  }
</style>
