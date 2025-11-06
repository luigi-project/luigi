<script>
  import BadgeCounter from './BadgeCounter.svelte';
  import { createEventDispatcher } from 'svelte';
  import { NavigationHelpers } from '../utilities/helpers';

  const dispatch = createEventDispatcher();

  export let label;
  export let nodes;
  export let hasOpenUIicon;
  export let getNodeLabel;
  export let getNodeSubtitle;
  export let noSubTitle;

  function getSapIconStr(iconString) {
    return NavigationHelpers.renderIconClassName(iconString);
  }

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function onActionClick(value) {
    dispatch('listClick', value);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fd-dialog fd-dialog--active" role="presentation" on:click|stopPropagation={() => {}}>
  <div
    class="fd-dialog__content fd-dialog__content--mobile"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title-4"
  >
    <div class="fd-dialog__header fd-bar fd-bar--header">
      <div class="fd-bar__left">
        <div class="fd-bar__element">
          <h2 class="fd-title fd-title--h5" id="dialog-title-4">{label}</h2>
        </div>
      </div>
    </div>
    <div class="fd-dialog__body fd-dialog__body--no-vertical-padding">
      <div class="fd-product-switch__body fd-product-switch__body--mobile">
        <ul class="fd-product-switch__list">
          {#if nodes}
            {#each nodes as node}
              {#if node.label}
                <li
                  class="fd-product-switch__item {noSubTitle == 'true' ? 'y-has-no-subtitle' : ''} {node.selected
                    ? 'selected'
                    : ''}"
                  on:click={() => onActionClick(node)}
                  role="presentation"
                  data-e2e="mobile-topnav-item"
                  data-testid={NavigationHelpers.getTestId(node)}
                >
                  <div class="lui-product-switch__icon fd-product-switch__icon sap-icon">
                    {#if hasOpenUIicon(node)}
                      <i class="sap-icon {node.icon && hasOpenUIicon(node) ? getSapIconStr(node.icon) : ''}" />
                    {:else}
                      <img src={node.icon} alt={node.altText ? node.altText : ''} />
                    {/if}
                    <BadgeCounter {node} />
                  </div>
                  <div class="fd-product-switch__text">
                    <div class="fd-product-switch__title">{getNodeLabel(node)}</div>
                    {#if getNodeSubtitle(node)}
                      <div class="fd-product-switch__subtitle">{getNodeSubtitle(node)}</div>
                    {/if}
                  </div>
                </li>
              {/if}
            {/each}
          {/if}
        </ul>
      </div>
    </div>
    <footer class="fd-dialog__footer fd-bar fd-bar--cosy fd-bar--footer">
      <div class="fd-bar__right">
        <div class="fd-bar__element">
          <button
            class="fd-button fd-button--light fd-dialog__decisive-button"
            on:click
            data-testid="mobile-topnav-close"
          >
            Cancel
          </button>
        </div>
      </div>
    </footer>
  </div>
</div>

<style lang="scss">
  @media (max-width: 1023px) {
    .fd-product-switch__body--mobile {
      //required after FD Styles v.14 to align different sizes of icon/images on mobile for product switcher
      .lui-product-switch__icon {
        display: flex;
        flex-direction: row;
        justify-content: center;
        min-width: 3rem;
        img {
          max-height: 24px;
        }
      }

      .y-has-no-subtitle {
        align-items: center;

        .fd-product-switch__text {
          height: auto;
        }
      }
    }
  }
</style>
