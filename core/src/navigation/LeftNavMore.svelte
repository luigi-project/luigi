<script>
  export let collapsedMode;
  let moreContent;

  function moreclick() {
    moreContent.setAttribute('lui-hidden', 'false');
    moreContent.parentNode.querySelector('a.lui-more-button').setAttribute('aria-expanded', 'true');
  }
</script>

{#if collapsedMode}
  <li class="lui-spacer" role="presentation" aria-hidden="true" />
{/if}
<li class="fd-navigation-list__item fd-popover lui-more" role="none" style="display: none">
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <a
    class="fd-navigation-list__content fd-popover__control lui-more-button"
    role="menuitemradio"
    aria-label="Nav Item"
    aria-checked="true"
    tabindex="0"
    aria-expanded="false"
    aria-haspopup="menu"
    on:click|preventDefault|stopPropagation={moreclick}
    on:keyup={(event) => {
      (event.code === 'Enter' || event.code === 'Space') && moreclick();
    }}
  >
    <div class="fd-navigation-list__content-container">
      <span class="fd-navigation-list__icon">
        <i class=" sap-icon--overflow" role="presentation"></i>
      </span>
    </div>
  </a>
  <div
    lui-hidden="true"
    bind:this={moreContent}
    class="fd-navigation-list__popover-body fd-popover__body fd-popover__body--after
        fd-popover__body--bottom fd-popover__body--arrow-left fd-popover__body--arrow-y-bottom"
    role="dialog"
  >
    <ul class="fd-popover__wrapper fd-navigation-list level-1" role="menu"></ul>
  </div>
</li>

<style lang="scss">
  .fd-popover__control {
    padding-inline-end: 0;
  }

  .lui-spacer {
    flex-grow: 1;
  }

  .lui-more > .fd-popover__body {
    max-height: 90vh;
    overflow: hidden auto;
    & > ul {
      overflow: visible;
    }
  }

  .fd-popover__body[lui-hidden='true'] {
    display: none;
  }
</style>
