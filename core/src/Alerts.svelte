<script>
  import { beforeUpdate, createEventDispatcher, onMount, getContext } from 'svelte';

  const dispatch = createEventDispatcher();

  import { EscapingHelpers } from './utilities/helpers';

  export let alertQueue;
  export let alertTypeMap = {
    info: 'information',
    success: 'success',
    warning: 'warning',
    error: 'error'
  };
  let alertElement;
  const getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  const handleNavigation = getContext('handleNavigation');

  beforeUpdate(() => {
    if (!alertQueue || !alertQueue.length) {
      console.warn('There are no alerts to display');
      return;
    }

    if (alertQueue.processed) {
      return;
    }

    const processedAlerts = alertQueue.map((alert) => {
      const { text, links, closeAfter } = alert.settings;
      const processedData = EscapingHelpers.processTextAndLinks(text, links, alert.settings.id);

      setTimeout(() => {
        // this needs to be done after links are rendered
        processedData.links.forEach((link) => {
          addClickListener(link, alert.settings.id);
        });
      });

      if (alert.settings.afterInit) {
        const el = alertElement;
        alert.settings.afterInit({
          dismiss: () => {
            if (el && el.isConnected) {
              dispatch('alertDismiss', { id: alert.settings.id });
            } else {
              console.debug('Alert already dismissed: ', el);
            }
          },
          element: el
        });
      }

      return {
        settings: { ...alert.settings, text: processedData.sanitizedText },
        dataSanitized: true
      };
    });
    processedAlerts.processed = true;

    alertQueue = processedAlerts;
  });

  onMount(() => {});

  function addClickListener(link, alertId) {
    try {
      const linkElem = document.getElementById(link.elemId);
      if (!linkElem) {
        return;
      }
      if (linkElem.dismissListener) {
        linkElem.removeEventListener('click', linkElem.dismissListener);
      }
      const listener = (event) => {
        if (link.url) {
          const isRelative = !link.url.startsWith('/');
          event.stopPropagation();
          getUnsavedChangesModalPromise().then(
            () => {
              const data = {
                params: {
                  link: link.url,
                  relative: isRelative
                }
              };
              handleNavigation(data);
            },
            () => {}
          );
        } else if (link.dismissKey) {
          dispatch('alertDismiss', {
            id: alertId,
            dismissKey: link.dismissKey
          });
        }
      };
      linkElem.addEventListener('click', listener);
      linkElem.dismissListener = listener;
    } catch (e) {
      console.error('Error on Alert::addClickListener', e);
    }
  }
</script>

<div class="fd-shell__overlay luigi-alert--overlay" aria-hidden="false" bind:this={alertElement}>
  {#each alertQueue as al}
    <div
      class="fd-message-strip fd-message-strip--{alertTypeMap[al.settings.type]} fd-message-strip--dismissible"
      role="alert"
      id="j2ALl423"
      data-testid="luigi-alert"
      aria-labelledby="luigi-alert-sr-{al.settings.id} luigi-alert-text-{al.settings.id}"
    >
      <span class="fd-message-strip__sr-only" id="luigi-alert-sr-{al.settings.id}">{alertTypeMap[al.settings.type]}</span>
      <div class="fd-message-strip__icon-container" aria-hidden="true">
        <span
          class="sap-icon sap-icon--message-{alertTypeMap[al.settings.type]}"
          focusable="false"
          role="presentation"
          aria-hidden="true"
        />
      </div>
      <p class="fd-message-strip__text" id="luigi-alert-text-{al.settings.id}">
        {@html al.dataSanitized ? al.settings.text : ''}
      </p>
      <button
        class="fd-button fd-button--transparent fd-button--compact fd-message-strip__close"
        on:click={() => dispatch('alertDismiss', { id: al.settings.id })}
        aria-label="Close"
        aria-controls="j2ALl423"
        data-testid="luigi-alert-dismiss"
      >
        <i class="sap-icon sap-icon--decline" />
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .luigi-alert--overlay {
    position: absolute;
    z-index: 1100;
    flex-direction: column;
    left: 50%;
    transform: translate(-50%);
    margin-top: calc(var(--luigi__shellbar--height) - 0.625rem);
    .fd-message-strip:not(:first-child) {
      margin-top: 8px;
    }
  }
  .fd-message-strip__text {
    :global(a) {
      display: inline-block;
      line-height: 1.42857;
      color: #0a6ed1;
      color: var(--sapLinkColor, #0a6ed1);
      transition: all 125ms ease-in;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
        color: #0854a0;
        color: var(--sapLink_Hover_Color, #0854a0);
      }
    }
  }
</style>
