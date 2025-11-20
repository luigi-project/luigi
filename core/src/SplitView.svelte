<script>
  import Backdrop from './Backdrop.svelte';
  import { afterUpdate, onDestroy, onMount, createEventDispatcher, getContext } from 'svelte';
  import { LuigiElements } from './core-api';
  import { SplitViewSvc } from './services';
  import { EventListenerHelpers, GenericHelpers, IframeHelpers } from './utilities/helpers';

  const dispatch = createEventDispatcher();

  let elements = {
    draggable: null,
    iframe: null,
    split: null
  };
  let lastNode;
  let pathData;
  let nodeParams;
  let currentNode;
  let messageHandler;
  let splitViewIframe;
  let splitViewIframeData;
  let splitViewWC;
  let splitViewWCData;
  export let nodepath;
  export let collapsed;
  export let splitViewSettings = {};
  export let isDataPrepared = false;
  export let disableBackdrop;
  let wasDataPrepared = false;
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');

  //TODO refactor
  const getComponentWrapper = () => {
    return {
      get: () => {
        return {
          collapsed,
          splitViewSettings,
          isDataPrepared,
          lastNode,
          pathData,
          nodeParams,
          currentNode,
          splitViewIframe,
          splitViewIframeData,
          splitViewWC,
          splitViewWCData
        };
      },
      set: (obj) => {
        if (obj) {
          Object.getOwnPropertyNames(obj).forEach((prop) => {
            if (prop === 'splitViewSettings') {
              splitViewSettings = obj.splitViewSettings;
            } else if (prop === 'lastNode') {
              lastNode = obj.lastNode;
            } else if (prop === 'pathData') {
              pathData = obj.pathData;
            } else if (prop === 'nodeParams') {
              nodeParams = obj.nodeParams;
            } else if (prop === 'collapsed') {
              collapsed = obj.collapsed;
            } else if (prop === 'isDataPrepared') {
              isDataPrepared = obj.isDataPrepared;
            } else if (prop === 'currentNode') {
              currentNode = obj.currentNode;
            } else if (prop === 'splitViewIframe') {
              splitViewIframe = obj.splitViewIframe;
            } else if (prop === 'splitViewIframeData') {
              splitViewIframeData = obj.splitViewIframeData;
            } else if (prop === 'splitViewWC') {
              splitViewWC = obj.splitViewWC;
            } else if (prop === 'splitViewWCData') {
              splitViewWCData = obj.splitViewWCData;
            }
          });
        }
      },
      dispatch,
      getUnsavedChangesModalPromise
    };
  };

  const getNode = async () => {
    if (isDataPrepared) {
      if (!collapsed) {
        SplitViewSvc.createAndSetView(getComponentWrapper());
      }
    } else {
      await SplitViewSvc.prepareSplitViewData(getComponentWrapper(), nodepath);
    }
  };

  const updateElementSelectors = () => {
    elements.split = SplitViewSvc.getContainer();
    elements.iframe = IframeHelpers.getIframeContainer();
    elements.draggable = SplitViewSvc.getDragger();
  };

  const setSplitViewSize = () => {
    const draggerBackdrop = SplitViewSvc.getDraggerBackdrop();
    if (draggerBackdrop) {
      draggerBackdrop.style.display = 'none';
    }

    updateElementSelectors();
    // setting again, to be sure its positioned when using it programmatically
    if (elements.draggable) {
      elements.draggable.style.top = `${SplitViewSvc.splitViewValues.top}px`;
    }

    elements.split.style.top = `${SplitViewSvc.splitViewValues.top}px`;
    elements.iframe.style.marginBottom = `${elements.split.clientHeight}px`;
  };

  function _messageHandler(e) {
    if (!IframeHelpers.getValidMessageSource(e)) return;

    // actions, like collapse, expand, setSize as well as register
    // event handlers: onCollapse, onExpand, onResize

    if ('luigi.navigation.splitview.close' === e.data.msg) {
      SplitViewSvc.close(getComponentWrapper());
    }
    if ('luigi.navigation.splitview.collapse' === e.data.msg) {
      collapse();
    }
    if ('luigi.navigation.splitview.expand' === e.data.msg) {
      expand();
    }
    if ('luigi.navigation.splitview.resize' === e.data.msg) {
      const percentBottom = parseInt(e.data.data);
      SplitViewSvc.calculateAndSetSplitViewValues(percentBottom, SplitViewSvc.internalValues);

      // In case setSize gets called before expanding
      if (collapsed) {
        return;
      }
      setSplitViewSize();
      SplitViewSvc.sendMessageToClients('resize.ok', SplitViewSvc.splitViewValues.percent);
    }
  }

  onMount(() => {
    updateSizes();
    // bind(this) changes the signature, required to
    // be assigned to var in order to removeEventListener
    messageHandler = _messageHandler.bind(this);
    EventListenerHelpers.addEventListener('message', messageHandler);
  });

  // [svelte-upgrade warning]
  // beforeUpdate and afterUpdate handlers behave
  // differently to their v2 counterparts
  afterUpdate(() => {
    getNode();
    if (wasDataPrepared !== isDataPrepared && !collapsed) {
      wasDataPrepared = isDataPrepared;
      setSplitViewSize();
    }
  });

  onDestroy(() => {
    window.removeEventListener('message', messageHandler);
  });

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export function collapse() {
    SplitViewSvc.collapse(getComponentWrapper());
  }

  export async function expand() {
    await SplitViewSvc.expand(getComponentWrapper());
    if (elements.draggerBackdrop) {
      elements.draggerBackdrop.style.display = 'none';
    }
  }
  export function updateSizes() {
    const shellbarHeight = GenericHelpers.getShellbarHeight();
    SplitViewSvc.internalValues.innerHeight = GenericHelpers.getInnerHeight();
    SplitViewSvc.internalValues.rightContentHeight = SplitViewSvc.internalValues.innerHeight - shellbarHeight;
    SplitViewSvc.internalValues.thresholdBottom = 30;
    SplitViewSvc.internalValues.thresholdTop = shellbarHeight + 30;
    SplitViewSvc.calculateAndSetSplitViewValues(SplitViewSvc.splitViewValues.percent, SplitViewSvc.internalValues);
    if (!collapsed) {
      setSplitViewSize();
    }
  }

  export function onDragStart(e) {
    let m_pos = e.y;
    let newValues = {};

    const resize = function resize(re) {
      const diff = m_pos - re.y;

      const dragTop = parseInt(getComputedStyle(elements.draggable, '').top);

      if (isNaN(dragTop) || diff === 0) {
        // happens in collapsed state on mouse over draggable
        // or if expanded only clicked without movement
        return;
      }

      const top = dragTop - diff;
      const bottom = SplitViewSvc.internalValues.innerHeight - top;
      const tresh = SplitViewSvc.enforceTresholds(top, bottom);

      if (top < tresh.top || bottom < tresh.bottom) {
        // if outside bounds, do nothing
        return;
      }

      newValues = tresh;
      m_pos = re.y;
      elements.draggable.style.top = `${newValues.top}px`;
    };

    const onMouseUp = function onMouseUp() {
      clearListeners();
      if (!newValues.top || !newValues.bottom || newValues.top == SplitViewSvc.internalValues.m_pos_prev) {
        SplitViewSvc.getDraggerBackdrop().style.display = 'none';
        return;
      }
      SplitViewSvc.internalValues.m_pos_prev = newValues.top;
      SplitViewSvc.splitViewValues = newValues;

      setSplitViewSize();

      SplitViewSvc.sendMessageToClients('resize.ok', newValues.percent);
    };

    const clearListeners = function clearListeners() {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', resize);
    };
    const addListeners = function resetListeners() {
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('mousemove', resize);
    };

    updateElementSelectors();
    clearListeners();
    addListeners();
    SplitViewSvc.getDraggerBackdrop().style.display = 'block';
  }

  const setDraggerVisibility = (visible) => {
    let dragger = SplitViewSvc.getDraggerButton();
    if (dragger) dragger.style.display = visible ? 'block' : 'none';
    dragger = SplitViewSvc.getCollapsedDraggerButton();
    if (dragger) dragger.style.display = visible ? 'block' : 'none';
  };

  const backdropStateChanged = (event) => {
    setDraggerVisibility(!event.detail || event.detail.backdropActive !== true);
  };
</script>

<svelte:window on:resize={updateSizes} />
<div id="splitViewContainer" class="fd-page splitViewContainer {collapsed ? 'lui-collapsed' : ''}">
  <Backdrop area="split-view" disable={disableBackdrop} on:stateChanged={backdropStateChanged} />
  <div class="lui-split-view">
    {#if collapsed}
      <div id="splitViewDraggerCollapsed" class="splitViewSeparator isCollapsed">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <!-- svelte-ignore a11y-missing-attribute -->
        <a class="lui-collapse-btn" role="button" on:click|stopPropagation|preventDefault={expand}>
          <i class="sap-icon sap-icon--navigation-up-arrow" />
        </a>
      </div>
      <h1 class="fd-splitView__title">{splitViewSettings.title}</h1>
    {:else}
      <div class="iframeSplitViewCnt" />
    {/if}
  </div>
</div>
{#if !collapsed}
  <div id="splitViewDraggerBackdrop" />
  <div id="splitViewDragger" role="presentation" on:mousedown|stopPropagation={onDragStart}>
    <div class="splitViewSeparator" />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-interactive-supports-focus -->
    <!-- svelte-ignore a11y-missing-attribute -->
    <a class="lui-collapse-btn" role="button" on:click|stopPropagation|preventDefault={collapse}>
      <i class="sap-icon sap-icon--navigation-down-arrow" />
    </a>
  </div>
{/if}

<style lang="scss">
  $collapsedSplitviewHeight: 38px;
  $colorNeutral4: #89919a;

  /* splitview start */
  $collapsedSplitviewHeight: 38px;
  :global(.lui-collapsed.iframeContainer.lui-split-view) {
    margin-bottom: $collapsedSplitviewHeight;
  }

  .splitViewContainer {
    position: absolute;
    bottom: 0;
    right: 0;
    top: 60%; /* default, overridden by computed.getIframeSplitViewTop */
  }
  .splitViewContainer,
  :global(#splitViewDragger),
  :global(#splitViewDraggerBackdrop) {
    left: var(--luigi__left-sidenav--width);

    :global(.btp-layout) & {
      left: 0;
    }
  }

  :global(.lui-collapsed.splitViewContainer) {
    height: $collapsedSplitviewHeight;
    top: auto;
  }

  .fd-splitView__title {
    margin-top: 0;
    font-size: 16px;
    line-height: $collapsedSplitviewHeight;
    vertical-align: center;
    padding-left: 32px;
    background: #fff;
  }

  :global(#splitViewDragger) {
    position: absolute;
    bottom: 0;
    right: 0;
    left: var(--luigi__left-sidenav--width);
    top: 60%; /* default, overridden by computed.getIframeSplitViewTop */
    height: 8px;
    cursor: row-resize;
    &:hover {
      /* enlarge mouse move target */
      margin-top: -15px;
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }

  :global(.splitViewSeparator) {
    border-top: 2px $colorNeutral4 solid;
    &.isCollapsed {
      padding-bottom: 15px;
      .lui-collapse-btn {
        padding: 0;
      }
    }
  }

  .lui-collapse-btn {
    width: 36px;
    height: 22px;
    background: white;
    position: absolute;
    left: 50%;
    margin-left: -12px;
    margin-top: -11px;
    text-align: center;
    border: 1px solid $colorNeutral4;
    border-radius: 4px;
    cursor: pointer;
    &:focus {
      box-shadow: 0 0 0 1px #fafafa;
      box-shadow: 0 0 0 1px var(--fd-color-action-focus);
    }
    &:hover {
      --fd-button-background-color: var(--fd-color-neutral-1);
      --fd-button-color: var(--fd-color-action-1);
      color: #0a6ed1;
      background-color: #fafafa;
    }
  }

  :global(.lui-breadcrumb) :global(#splitViewDraggerBackdrop) {
    top: calc(#{$topNavHeight} + var(--luigi__breadcrumb--height));
  }

  :global(#splitViewDraggerBackdrop) {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    top: $topNavHeight;
    right: 0;
    bottom: 0;
    left: var(--luigi__left-sidenav--width);
    display: none;
  }

  .lui-split-view {
    height: 100%;
    position: relative;

    .splitViewSeparator.isCollapsed {
      position: absolute;
      width: 100%;
      top: 0;
      margin-bottom: 4px;
    }

    .iframeSplitViewCnt {
      background-color: var(--sapBackgroundColor);
      position: absolute;
      width: 100%;
      bottom: 0;
      top: 2px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    .iframeSplitViewCnt :global(iframe) {
      width: 100%;
      height: 100%;
      border: 0;
      position: absolute;
    }
  }

  @media (max-width: ($desktopMinWidth - 1)) {
    :global(body.lui-simpleSlideInNav) {
      :global(.fd-app__sidebar) {
        left: calc(var(--luigi__left-sidenav--width) * -1);
      }
      :global(#splitViewContainer),
      :global(#splitViewDragger),
      :global(#splitViewDraggerBackdrop) {
        left: 0;
      }
    }
  }
</style>
