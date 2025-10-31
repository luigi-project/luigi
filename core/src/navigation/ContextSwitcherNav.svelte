<script>
  import { createEventDispatcher } from 'svelte';
  import { NavigationHelpers } from '../utilities/helpers';

  export let actions = [];
  export let config = {};
  export let customOptionsRenderer;
  export let options = [];
  export let selectedLabel;
  export let selectedOption;
  export let isMobile;
  export let getNodeName;
  export let getRouteLink;
  export let getTranslation;
  export let isContextSwitcherDropdownShown;

  const dispatch = createEventDispatcher();
  export function onActionClick(node) {
    dispatch('onActionClick', { node });
  }

  export function goToOption(option, selectedOption) {
    dispatch('goToOption', { option, selectedOption });
  }
</script>

<nav class="fd-menu lui-ctx-switch-nav {isMobile ? 'fd-menu--mobile' : ''}">
  {#if actions && actions.length}
    <ul class="fd-menu__list fd-menu__list--top">
      {#each actions as node}
        {#if node.position === 'top' || !['top', 'bottom'].includes(node.position)}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="fd-menu__item"
            role="presentation"
            on:click={() => onActionClick(node)}
            data-testid={NavigationHelpers.getTestId(node)}
          >
            <a href={getRouteLink(node)} on:click|preventDefault={() => {}} class="fd-menu__link">
              <span class="fd-menu__title">{$getTranslation(node.label)}</span>
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
  <ul class="fd-menu__list" id="context_menu_middle">
    {#if options && options.length === 0 && isContextSwitcherDropdownShown}
      <li class="lui-contextswitcher-indicator">
        <div
          class="fd-busy-indicator fd-busy-indicator--m"
          aria-hidden="false"
          aria-label="Loading"
          data-testid="luigi-loading-spinner"
        >
          <div class="fd-busy-indicator__circle" />
          <div class="fd-busy-indicator__circle" />
          <div class="fd-busy-indicator__circle" />
        </div>
      </li>
    {/if}
    {#if options && options.length}
      {#each options as node}
        {#await getNodeName(node.label, config.fallbackLabelResolver, node.id) then label}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="fd-menu__item"
            role="presentation"
            on:click={() => goToOption(node, selectedOption)}
            data-testid={NavigationHelpers.getTestId(node)}
          >
            {#if customOptionsRenderer}
              {@html customOptionsRenderer(node, label === selectedLabel)}
            {:else}
              <a
                href={getRouteLink(node)}
                on:click={(event) => {
                  NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
                }}
                class="fd-menu__link {label === selectedLabel ? 'is-selected' : ''}"
                title={label}
              >
                <span class="fd-menu__title">{label}</span>
              </a>
            {/if}
          </li>
        {/await}
      {/each}
    {/if}
  </ul>
  {#if actions && actions.length}
    <ul class="fd-menu__list fd-menu__list--bottom">
      {#each actions as node}
        {#if node.position === 'bottom'}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="fd-menu__item"
            role="presentation"
            on:click={() => onActionClick(node)}
            data-testid={NavigationHelpers.getTestId(node)}
          >
            <a
              href={getRouteLink(node)}
              on:click={(event) => {
                NavigationHelpers.handleNavAnchorClickedWithoutMetaKey(event);
              }}
              class="fd-menu__link"
            >
              <span class="fd-menu__title">{$getTranslation(node.label)}</span>
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</nav>

<style lang="scss">
  :global(.fd-popover__body) {
    .lui-ctx-switch-nav {
      max-height: calc(100vh - 76px);
      overflow-y: auto;
    }
  }

  .fd-menu__list {
    &--bottom {
      border-top: var(--sapList_BorderWidth, 0.0625rem) solid var(--sapList_BorderColor, #e4e4e4);
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }
    &--top {
      border-bottom: var(--sapList_BorderWidth, 0.0625rem) solid var(--sapList_BorderColor, #e4e4e4);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  :global(.lui-contextswitcher-indicator) {
    padding: 20px 0;
    text-align: center;
  }
</style>
