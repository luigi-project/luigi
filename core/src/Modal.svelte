<script>
  import Backdrop from './Backdrop.svelte';
  import { afterUpdate, createEventDispatcher, onMount, onDestroy, getContext } from 'svelte';
  import { Navigation } from './navigation/services/navigation';
  import {
    EventListenerHelpers,
    GenericHelpers,
    IframeHelpers,
    RoutingHelpers,
    NavigationHelpers,
    StateHelpers
  } from './utilities/helpers';
  import { WebComponentService } from './services/web-components';
  import { Routing } from './services';
  import { LuigiConfig } from './core-api';

  export let settings;
  export let isDataPrepared = false;
  export let nodepath;
  export let modalIndex;
  export let disableBackdrop;
  const dispatch = createEventDispatcher();
  let nodeObject;
  let btpToolLayout;
  let pathData;
  let nodeParams;
  let iframeCreated = false;
  let wcCreated = false;
  let showLoadingIndicator = false;
  let contextRequested = false;
  let isDrawer = false;
  let isModal = true;
  let modalElementClassSelector;
  let store = getContext('store');

  const getNodeLabel = (node) => {
    return NavigationHelpers.getNodeLabel(node);
  };

  const prepareNodeData = async (path) => {
    const pathUrlRaw = path && path.length ? GenericHelpers.getPathWithoutHash(path) : '';
    const params = RoutingHelpers.parseParams(pathUrlRaw.split('?')[1]);
    nodeParams = RoutingHelpers.getNodeParams(params);
    const dataFromPath = await Navigation.extractDataFromPath(path);
    nodeObject = dataFromPath.nodeObject;
    isDrawer = settings.isDrawer || typeof nodeObject.drawer === 'object';
    modalElementClassSelector = isDrawer ? '._drawer' : `[modal-container-index="${modalIndex}"]`;

    settings._liveLabel = false;

    if (isDrawer) {
      isModal = false;
      if (settings.header === undefined) {
        settings.header = true;
        settings.title = getNodeLabel(nodeObject);
        settings._liveLabel = true;
      } else if (settings.header && settings.header.title) {
        settings.title = settings.header.title;
      }
      if (settings.backdrop === undefined || !settings.backdrop) {
        settings.backdrop = false;
        dispatch('drawerState', { activeDrawer: true });
      }
      if (!settings.size) {
        settings.size = 's';
      }
      if (settings.overlap === undefined) {
        settings.overlap = true;
      }
    } else {
      if (!settings.title) {
        settings.title = getNodeLabel(nodeObject);
        settings._liveLabel = true;
      }
    }
    pathData = dataFromPath.pathData;

    isDataPrepared = true;
  };

  const getNode = async (path) => {
    if (iframeCreated || wcCreated) {
      return;
    }
    if (isDataPrepared) {
      if (nodeObject.webcomponent) {
        //"Workaround" because we need a webcomponent client api
        // to hide/show the loadingIndicator
        showLoadingIndicator = false;
        if (isDrawer) {
          await setDrawerSize();
        } else {
          await setModalSize();
        }

        WebComponentService.renderWebComponent(
          nodeObject.viewUrl,
          document.querySelector(modalElementClassSelector),
          {
            context: pathData.context,
            clientPermissions: nodeObject.clientPermissions || {},
            pathParams: pathData.pathParams || {}
          },
          nodeObject,
          undefined,
          true
        );
        dispatch('wcCreated', {
          modalWC: document.querySelector(modalElementClassSelector),
          modalWCData: { ...pathData, nodeParams }
        });
        wcCreated = true;
      } else {
        const iframe = await createIframeModal(nodeObject.viewUrl, {
          context: pathData.context,
          pathParams: pathData.pathParams,
          nodeParams
        });
        dispatch('iframeCreated', {
          modalIframe: iframe,
          modalIframeData: { ...pathData, nodeParams }
        });
        iframeCreated = true;
      }
    } else {
      await prepareNodeData(path);
    }
  };

  const setModalSize = async () => {
    let height, width;
    const elem = document.querySelector('.lui-modal-index-' + modalIndex);
    const { size, width: settingsWidth, height: settingsHeight } = settings;
    const regex = /^.?[0-9]{1,3}(%|px|rem|em|vh|vw)$/;
    elem.classList.remove('lui-modal-fullscreen');
    if (settingsWidth && settingsWidth.match(regex) && settingsHeight && settingsHeight.match(regex)) {
      height = settingsHeight;
      width = settingsWidth;
    } else {
      switch (size) {
        case 'fullscreen':
          height = '100vh';
          width = '100vw';
          elem.classList.add('lui-modal-fullscreen');
          break;
        case 'm':
          height = '80%';
          width = '60%';
          break;
        case 's':
          height = '80%';
          width = '40%';
          break;
        default:
          height = '80%';
          width = '80%';
      }
    }
    elem.setAttribute('style', `width:${width};height:${height};`);
  };

  const createIframeModal = async (viewUrl, componentData) => {
    if (isDrawer) {
      await setDrawerSize();
    } else {
      await setModalSize();
    }
    if (viewUrl) {
      viewUrl = RoutingHelpers.substituteViewUrl(viewUrl, componentData);
    }

    const iframe = await IframeHelpers.createIframe(viewUrl, undefined, nodeObject, 'modal', componentData);
    const iframeCtn = document.querySelector(modalElementClassSelector);
    iframeCtn.appendChild(iframe);
    return iframe;
  };

  async function setDrawerSize(elem) {
    let styleSettings = '';
    const elemDrawer = document.getElementsByClassName('drawer');
    const drawerDialog = document.getElementsByClassName('drawer-dialog');
    if (settings.size) {
      if (settings.size === 'l') {
        styleSettings = `width:75%;`;
      } else if (settings.size === 'm') {
        styleSettings = `width:50%;`;
      } else if (settings.size === 's') {
        styleSettings = `width:25%;`;
      } else if (settings.size === 'xs') {
        styleSettings = `width:15.5%;`;
      }
    }
    if (settings.backdrop) {
      elemDrawer[0].setAttribute('style', styleSettings);
    } else {
      drawerDialog[0].setAttribute('style', styleSettings);
      elemDrawer[0].setAttribute('style', 'width:100%');
    }
  }

  // [svelte-upgrade warning]
  // beforeUpdate and afterUpdate handlers behave
  // differently to their v2 counterparts
  afterUpdate(() => {
    getNode(nodepath);
  });

  const onMessage = async (e) => {
    const iframe = IframeHelpers.getValidMessageSource(e);

    if ('luigi.show-loading-indicator' === e.data.msg) {
      const mfeLocation = e.data.location || GenericHelpers.calcMFELocation(iframe);
      if ((isModal && mfeLocation === 'modal') || (isDrawer && mfeLocation === 'drawer')) {
        showLoadingIndicator = true;
      }
    }

    if ('luigi.hide-loading-indicator' === e.data.msg) {
      const mfeLocation = e.data.location || GenericHelpers.calcMFELocation(iframe);
      if ((isModal && mfeLocation === 'modal') || (isDrawer && mfeLocation === 'drawer')) {
        showLoadingIndicator = false;
      }
    }

    if ('luigi.get-context' === e.data.msg) {
      contextRequested = true;
      const loadingIndicatorAutoHideEnabled =
        !nodeObject || !nodeObject.loadingIndicator || nodeObject.loadingIndicator.hideAutomatically !== false;
      if (loadingIndicatorAutoHideEnabled) {
        fadeOutLoadingIndicator();
      }
    }

    if ('luigi.close-modal' === e.data.msg) {
      dispatch('close', { type: 'modal' });
    }

    if ('luigi.navigation.updateModalSettings' === e.data.msg) {
      if (e.data.updatedModalSettings.title || e.data.updatedModalSettings.title === '') {
        settings.title = e.data.updatedModalSettings.title;
      }
      if (e.data.updatedModalSettings.size || e.data.updatedModalSettings.width || e.data.updatedModalSettings.height) {
        settings.size = e.data.updatedModalSettings.size;
        settings.height = e.data.updatedModalSettings.height;
        settings.width = e.data.updatedModalSettings.width;
        await setModalSize();
      }
      if (LuigiConfig.getConfigBooleanValue('routing.showModalPathInUrl')) {
        Routing.updateModalDataInUrl(
          RoutingHelpers.getModalPathFromPath(),
          { title: settings.title, size: settings.size, height: settings.height, width: settings.width },
          e.data.addHistoryEntry
        );
      }
    }
  };

  onMount(() => {
    StateHelpers.doOnStoreChange(store, () => {
      if (settings._liveLabel && nodeObject) {
        settings.title = getNodeLabel(nodeObject);
      }
    }, ['navigation.viewgroupdata']);
    btpToolLayout =
      LuigiConfig.getConfigValue('settings.btpToolLayout') &&
      GenericHelpers.requestExperimentalFeature('btpToolLayout', false);
    EventListenerHelpers.addEventListener('message', onMessage);
    // only disable accessibility for all cases other than a drawer without backdrop
    !(settings.isDrawer && !settings.backdrop)
      ? IframeHelpers.disableA11YKeyboardExceptClassName('.lui-modal-index-' + modalIndex)
      : '';
    window.focus();
    // activate loadingindicator if onMount function takes longer than expected
    setTimeout(() => {
      if (!contextRequested && !nodeObject.webcomponent && nodeObject.loadingIndicator?.enabled !== false) {
        showLoadingIndicator = true;
      }
    }, 250);
  });

  onDestroy(() => {
    EventListenerHelpers.removeEventListener('message', onMessage);
    // only disable accessibility for all cases other than a drawer without backdrop
    !(settings.isDrawer && !settings.backdrop)
      ? IframeHelpers.enableA11YKeyboardBackdropExceptClassName('.lui-modal-index-' + modalIndex)
      : '';
  });

  /**
   * This function will be called if the LuigiClient requested the context.
   * That means spinner can fade out in order to display the mf.
   * After 250 ms the spinner will be removed from DOM.
   */
  function fadeOutLoadingIndicator() {
    let spinnerContainer;
    if (isModal) {
      spinnerContainer = document.querySelector(`.lui-modal-mf.lui-modal-index-${modalIndex} .spinnerContainer`);
    } else {
      spinnerContainer = document.querySelector(`.drawer .spinnerContainer`);
    }
    if (spinnerContainer && spinnerContainer.classList.contains('fade-out')) {
      spinnerContainer.classList.remove('fade-out');
      setTimeout(() => {
        showLoadingIndicator = false;
      }, 250);
    }
  }
</script>

<div
  class={isModal || (isDrawer && settings.backdrop)
    ? 'fd-dialog fd-dialog--active'
    : `drawer-dialog ${btpToolLayout ? 'btp-drawer-dialog' : ''}`}
  style={isModal ? 'z-index:1001' : ''}
>
  <div
    class="fd-dialog__content {isDrawer
      ? settings.backdrop
        ? `drawer drawer-dialog__content ${btpToolLayout ? 'btp-drawer__backdrop' : 'drawer__backdrop'}`
        : 'drawer drawer-dialog__content'
      : 'lui-modal-mf lui-modal-index-' + modalIndex}"
    data-testid={isModal ? 'modal-mf' : 'drawer-mf'}
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title-1"
  >
    {#if isModal || (isDrawer && settings.header)}
      <div class="lui-modal-header fd-dialog__header fd-bar fd-bar--header">
        <Backdrop disable={disableBackdrop} />
        <div class="fd-bar__left">
          <div class="fd-bar__element">
            {#if settings.title}
              <h2 class="fd-title fd-title--h5" id="dialog-title-1">{settings.title}</h2>
            {/if}
          </div>
        </div>
        <div class="fd-bar__right">
          <div class="fd-bar__element">
            <button
              class="fd-button fd-button--transparent fd-button--compact"
              on:click={() => dispatch('close', { activeDrawer: false })}
              aria-label="close"
              data-testid={settings.closebtn_data_testid && isModal
                ? settings.closebtn_data_testid
                : 'lui-modal-index-' + modalIndex}
            >
              <i class="sap-icon sap-icon--decline" />
            </button>
          </div>
        </div>
      </div>
    {/if}
    <div class="fd-dialog__body">
      {#if isDrawer}
        <slot />
      {/if}
      <div
        class="iframeModalCtn {isDrawer ? '_drawer' : '_modal'} "
        modal-container-index={!isDrawer ? modalIndex : undefined}
      />
    </div>
    {#if showLoadingIndicator}
      <div class="fd-page spinnerContainer fade-out" aria-hidden="false" aria-label="Loading">
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
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .drawer-dialog {
    position: absolute;
    top: calc(#{$topNavHeight});
    bottom: 0;
    width: 25%;
    z-index: 3;
    right: 0;

    .drawer {
      height: 100%;
    }
  }

  .drawer-dialog.btp-drawer-dialog {
    top: calc(#{$combinedLayoutGap} + #{$topNavHeight});
  }

  :global(.lui-breadcrumb) .drawer-dialog.btp-drawer-dialog {
    top: calc(#{$combinedLayoutGap} + #{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  .drawer {
    bottom: 0;
    width: 25vw;
    overflow-y: auto;
    left: auto;
    right: 0;
  }

  :global(.lui-breadcrumb) .drawer-dialog {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  :global(.lui-breadcrumb) .drawer__backdrop {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  :global(.lui-breadcrumb) .btp-drawer__backdrop {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height) + $combinedLayoutGap);
  }

  .drawer__backdrop {
    top: $topNavHeight;
  }

  .btp-drawer__backdrop {
    top: calc($topNavHeight + $combinedLayoutGap);
  }

  .iframeModalCtn {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .iframeModalCtn :global(iframe) {
    width: 100%;
    height: 100%;
    border: 0;
    position: absolute;
  }
  .lui-modal-mf {
    position: relative;
    .spinnerContainer {
      left: 0;
    }
  }
  .lui-modal-fullscreen {
    max-height: none;
    max-width: none;
    border-radius: 0;
  }
  .spinnerContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 0;
    right: 0;
    min-width: auto;
    min-height: auto;
    display: flex;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.25s;
  }

  .drawer-dialog__content {
    max-width: none;
    max-height: none;
    min-width: 0;
    .spinnerContainer {
      left: 0;
    }
  }

  .drawer-dialog--active {
    display: block;
    background-color: transparent;
  }

  @media (max-width: 599px) {
    .drawer-dialog__content:not(.fd-dialog__content--mobile) {
      max-width: none;
      min-width: 50vw;
    }
  }

  .fd-dialog {
    &__body {
      overflow-wrap: break-word;
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  .lui-modal-header {
    position: relative;
  }

  .fade-out {
    opacity: 1;
  }
</style>
