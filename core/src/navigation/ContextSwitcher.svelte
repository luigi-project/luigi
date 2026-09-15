<script>
  import { createEventDispatcher, onMount, onDestroy, getContext, beforeUpdate, tick } from 'svelte';
  import { ContextSwitcherHelpers } from './services/context-switcher';
  import ContextSwitcherNav from './ContextSwitcherNav.svelte';
  import { LuigiConfig } from '../core-api';
  import { Routing } from '../services/routing';
  import {
    IframeHelpers,
    RoutingHelpers,
    StateHelpers,
    NavigationHelpers,
    GenericHelpers,
    EventListenerHelpers,
    DropdownKeyboardHelpers
  } from '../utilities/helpers';

  const dispatch = createEventDispatcher();

  export let contextSwitcherEnabled = false;
  export let dropDownStates = {};
  export let selectedLabel = null;
  export let config = {};
  export let actions = [];
  export let options = null;
  let alwaysShowDropdown = true;
  $: renderAsDropdown =
    alwaysShowDropdown || (actions && actions.length > 0) || (options && options.length > 1) || !selectedOption;
  export let selectedOption;
  export let fallbackLabelResolver = null;
  export let pathParams;
  export let customOptionsRenderer;
  export let customSelectedOptionRenderer;
  export let isMobile;
  export let contextSwitcherToggle = false;
  export let defaultLabel;
  let preserveSubPathOnSwitch;
  let getUnsavedChangesModalPromise = getContext('getUnsavedChangesModalPromise');
  let store = getContext('store');
  let getTranslation = getContext('getTranslation');
  let prevContextSwitcherToggle = false;
  let selectedNodePath;
  export let addNavHrefForAnchor;
  let isContextSwitcherDropdownShown;
  let popoverEl;
  let focusMenuOnOpen = 'first';
  let skipNextTriggerClick = false;
  // Keep in sync with $desktopMaxWidth in core/src/styles/_variables.scss.
  let isNarrowViewport =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(max-width: 899px)').matches
      : false;

  onMount(async () => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mq = window.matchMedia('(max-width: 899px)');
      const syncViewport = (event) => {
        isNarrowViewport = event && typeof event.matches === 'boolean' ? event.matches : mq.matches;
      };
      if (mq.addEventListener) {
        mq.addEventListener('change', syncViewport);
      } else if (mq.addListener) {
        mq.addListener(syncViewport);
      }
    }
    StateHelpers.doOnStoreChange(store, async () => {
      const contextSwitcherConfig = LuigiConfig.getConfigValue('navigation.contextSwitcher');
      contextSwitcherEnabled = !!contextSwitcherConfig;
      if (!contextSwitcherEnabled) {
        return;
      }

      customOptionsRenderer = GenericHelpers.isFunction(contextSwitcherConfig.customOptionsRenderer)
        ? contextSwitcherConfig.customOptionsRenderer
        : undefined;

      customSelectedOptionRenderer = GenericHelpers.isFunction(contextSwitcherConfig.customSelectedOptionRenderer)
        ? contextSwitcherConfig.customSelectedOptionRenderer
        : undefined;
      config = contextSwitcherConfig;
      options = undefined;
      if (contextSwitcherConfig) {
        alwaysShowDropdown = contextSwitcherConfig.alwaysShowDropdown !== false; // default is true
        actions = await LuigiConfig.getConfigValueAsync('navigation.contextSwitcher.actions');
        const currentPath = Routing.getCurrentPath();

        fallbackLabelResolver = contextSwitcherConfig.fallbackLabelResolver;

        ContextSwitcherHelpers.resetFallbackLabelCache();

        // options are loaded lazy by default
        if (!contextSwitcherConfig.lazyloadOptions) {
          await fetchOptions();
        }
        if (ContextSwitcherHelpers.isContextSwitcherDetailsView(currentPath, contextSwitcherConfig.parentNodePath)) {
          await setSelectedContext(currentPath);
        }
      }
    }, ['navigation.contextSwitcher']);

    RoutingHelpers.addRouteChangeListener((path) => setSelectedContext(path));

    EventListenerHelpers.addEventListener('message', (e) => {
      if (!IframeHelpers.getValidMessageSource(e)) return;
      if (e.data && e.data.msg === 'luigi.refresh-context-switcher') {
        options = null;
        fetchOptions();
      }
    });

    defaultLabel = config.defaultLabel;
  });

  onDestroy(() => {
    setContentInert(false);
  });

  beforeUpdate(() => {
    if (prevContextSwitcherToggle !== contextSwitcherToggle) {
      prevContextSwitcherToggle = contextSwitcherToggle;
      fetchOptions();
    }
    isContextSwitcherDropdownShown = dropDownStates.contextSwitcherPopover || false;
  });

  function getNodeName(label, config, id) {
    if (label) {
      return Promise.resolve(label);
    }
    return ContextSwitcherHelpers.getFallbackLabel(config, id);
  }

  function getRouteLink(node) {
    return RoutingHelpers.getNodeHref(node, pathParams);
  }

  // [svelte-upgrade suggestion]
  // review these functions and remove unnecessary 'export' keywords
  export async function fetchOptions() {
    options = await ContextSwitcherHelpers.fetchOptions(options);
    const conf = config || {};
    const parentNodePath = conf.parentNodePath;
    const fallbackLabelResolver = conf.fallbackLabelResolver;
    const currentPath = Routing.getCurrentPath();
    selectedOption = await ContextSwitcherHelpers.getSelectedOption(currentPath, options, parentNodePath);
    selectedLabel = await ContextSwitcherHelpers.getSelectedLabel(
      currentPath,
      options,
      parentNodePath,
      fallbackLabelResolver
    );
    selectedNodePath = await ContextSwitcherHelpers.getSelectedNode(currentPath, options, parentNodePath);
    preserveSubPathOnSwitch = conf.preserveSubPathOnSwitch;
  }

  export async function setSelectedContext(currentPath) {
    const conf = config || {};
    const parentNodePath = conf.parentNodePath;
    const fallbackLabelResolver = conf.fallbackLabelResolver;
    selectedOption = await ContextSwitcherHelpers.getSelectedOption(currentPath, options, parentNodePath);
    selectedLabel = await ContextSwitcherHelpers.getSelectedLabel(
      currentPath,
      options,
      parentNodePath,
      fallbackLabelResolver
    );
    selectedNodePath = await ContextSwitcherHelpers.getSelectedNode(currentPath, options, parentNodePath);
  }

  export async function onActionClick(event) {
    let node = event.detail.node;
    if (node.clickHandler) {
      const result = await node.clickHandler(node);
      // If the clickHandler returns true, open the link
      if (!result) {
        return;
      }
    }
    setTimeout(() => {
      goToPath(node.link);
    });

    if (isMobile) {
      dispatch('toggleDropdownState');
    }
  }

  export function goToPath(path) {
    getUnsavedChangesModalPromise().then(
      () => {
        Routing.navigateTo(path);
      },
      () => {}
    );
  }

  export function goToOption(event) {
    let option = event.detail.option;
    let selectedOption = event.detail.selectedOption;
    getUnsavedChangesModalPromise().then(
      () => {
        if (preserveSubPathOnSwitch && selectedOption) {
          Routing.navigateTo(ContextSwitcherHelpers.getNodePathFromCurrentPath(option, selectedOption));
        } else {
          Routing.navigateTo(option.link);
        }
        if (isMobile) {
          dispatch('toggleDropdownState');
        }
      },
      () => {}
    );
  }

  export function toggleDropdownState() {
    dispatch('toggleDropdownState');
    const ddStates = dropDownStates || {};
    const isOpened = GenericHelpers.parseJSON(ddStates['contextSwitcherPopover']);
    if (isOpened) {
      fetchOptions();
    }
  }

  function setContentInert(isInert) {
    if (typeof document === 'undefined') {
      return;
    }
    document.querySelectorAll('.iframeContainer, iframe').forEach((node) => {
      if (isInert) {
        node.setAttribute('inert', '');
      } else {
        node.removeAttribute('inert');
      }
    });
  }

  $: if (!isMobile) {
    setContentInert(Boolean(dropDownStates && dropDownStates.contextSwitcherPopover));
  }

  function isDropdownOpen() {
    return Boolean(dropDownStates && dropDownStates.contextSwitcherPopover);
  }

  function focusMenuItem(which) {
    const root = !isMobile ? document.getElementById('contextSwitcherPopover') || popoverEl : popoverEl;
    const items = DropdownKeyboardHelpers.getMenuItems(root);
    if (!items.length) {
      return;
    }
    const index = which === 'last' ? items.length - 1 : 0;
    DropdownKeyboardHelpers.applyRovingTabindex(items, index);
  }

  function scheduleMenuFocus() {
    if (isMobile) {
      return;
    }
    const attempt = () => {
      const popover = document.getElementById('contextSwitcherPopover');
      if (popover) {
        popover.removeAttribute('inert');
      }
      focusMenuItem(focusMenuOnOpen);
    };
    tick().then(() => {
      attempt();
      requestAnimationFrame(() => {
        attempt();
        setTimeout(attempt, 0);
      });
    });
  }

  function triggerKeyboardAction(node) {
    node.addEventListener('keydown', onTriggerKeydown);
    return {
      destroy() {
        node.removeEventListener('keydown', onTriggerKeydown);
      }
    };
  }

  function popoverKeyboardAction(node) {
    node.addEventListener('keydown', onPopoverKeydown);
    return {
      destroy() {
        node.removeEventListener('keydown', onPopoverKeydown);
      }
    };
  }

  async function closeAndFocusTrigger() {
    if (isDropdownOpen()) {
      toggleDropdownState();
    }
    await tick();
    setTimeout(() => {
      const trigger = document.querySelector('[data-testid="luigi-contextswitcher-button"]');
      if (trigger) {
        trigger.focus();
      }
    }, 0);
  }

  function onTriggerClick(event) {
    if (event) {
      event.preventDefault();
    }
    if (!renderAsDropdown) {
      return;
    }
    if (skipNextTriggerClick) {
      skipNextTriggerClick = false;
      return;
    }
    focusMenuOnOpen = 'first';
    toggleDropdownState();
    scheduleMenuFocus();
  }

  function onTriggerKeydown(event) {
    DropdownKeyboardHelpers.handleTriggerKeydown(event, {
      isOpen: isDropdownOpen(),
      isDisabled: !renderAsDropdown || event.currentTarget.getAttribute('aria-disabled') === 'true',
      onToggle: (focus) => {
        focusMenuOnOpen = focus || 'first';
        if (DropdownKeyboardHelpers.isActivationKey(event)) {
          skipNextTriggerClick = true;
          setTimeout(() => {
            skipNextTriggerClick = false;
          }, 1000);
        }
        toggleDropdownState();
        scheduleMenuFocus();
      },
      onFocusFirst: () => focusMenuItem('first'),
      onFocusLast: () => focusMenuItem('last'),
      onClose: closeAndFocusTrigger
    });
  }

  function onPopoverKeydown(event) {
    DropdownKeyboardHelpers.handleMenuKeydown(event, {
      items: DropdownKeyboardHelpers.getMenuItems(event.currentTarget),
      onEscape: closeAndFocusTrigger,
      onActivate: (item) => item.click()
    });
  }
</script>

{#if contextSwitcherEnabled}
  <!-- DESKTOP VERSION (popover): -->
  {#if !isMobile}
    <div class="fd-shellbar__action fd-shellbar__action--desktop">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="fd-popover fd-popover--right" on:click|stopPropagation={() => {}}>
        <div class="fd-popover__control" role="presentation" on:click|stopPropagation={() => {}}>
          {#if addNavHrefForAnchor && selectedOption}
            <a
              href={selectedOption ? getRouteLink(selectedOption) : undefined}
              class="fd-button fd-button--transparent fd-shellbar__button fd-button--menu fd-shellbar__button--menu lui-ctx-switch-menu"
              aria-controls="contextSwitcherPopover"
              aria-expanded={dropDownStates.contextSwitcherPopover || false}
              aria-haspopup="true"
              tabindex="0"
              title={selectedLabel ? selectedLabel : config.defaultLabel}
              on:click={onTriggerClick}
              use:triggerKeyboardAction
              aria-disabled={!renderAsDropdown}
              data-testid="luigi-contextswitcher-button"
            >
              {#if selectedOption && customSelectedOptionRenderer}
                {@html customSelectedOptionRenderer(selectedOption)}
              {:else}
                {#if !selectedLabel}{$getTranslation(config.defaultLabel)}{:else}{selectedLabel}{/if}
                <i class="sap-icon--megamenu fd-shellbar__button--icon" />
              {/if}
            </a>
          {:else}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="fd-button fd-button--transparent fd-button--menu fd-shellbar__button fd-shellbar__button--menu lui-ctx-switch-menu"
              role="button"
              aria-controls="contextSwitcherPopover"
              aria-expanded={dropDownStates.contextSwitcherPopover || false}
              aria-haspopup="true"
              tabindex="0"
              title={selectedLabel ? selectedLabel : config.defaultLabel}
              on:click={onTriggerClick}
              use:triggerKeyboardAction
              aria-disabled={!renderAsDropdown}
              data-testid="luigi-contextswitcher-button"
            >
              {#if selectedOption && customSelectedOptionRenderer}
                {@html customSelectedOptionRenderer(selectedOption)}
              {:else}
                {#if !selectedLabel}{$getTranslation(config.defaultLabel)}{:else}{selectedLabel}{/if}
                <i class="sap-icon--megamenu fd-shellbar__button--icon" />
              {/if}
            </div>
          {/if}
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          bind:this={popoverEl}
          class="fd-popover__body fd-popover__body--right"
          aria-hidden={!(dropDownStates.contextSwitcherPopover || false)}
          id="contextSwitcherPopover"
          data-testid="luigi-contextswitcher-popover"
          use:popoverKeyboardAction
        >
          <ContextSwitcherNav
            {actions}
            {config}
            {customOptionsRenderer}
            {options}
            {selectedLabel}
            {selectedOption}
            {getNodeName}
            {getRouteLink}
            {getTranslation}
            {isMobile}
            {isContextSwitcherDropdownShown}
            {focusMenuOnOpen}
            on:onActionClick={onActionClick}
            on:goToOption={goToOption}
          />
        </div>
      </div>
    </div>
  {/if}
  <!-- MOBILE VERSION (fullscreen dialog): -->
  {#if isMobile && isNarrowViewport && dropDownStates.contextSwitcherPopover && renderAsDropdown}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="fd-dialog fd-dialog--active" role="presentation" on:click|stopPropagation={() => {}}>
      <div
        class="fd-dialog__content fd-dialog__content--mobile"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title-3"
      >
        <div class="fd-dialog__header fd-bar fd-bar--header">
          <div class="fd-bar__left">
            <div class="fd-bar__element">
              <h2 class="fd-title fd-title--h5" id="dialog-title-3">
                {#if !selectedLabel}{$getTranslation(config.defaultLabel)}{/if}
                {#if selectedLabel}{selectedLabel}{/if}
              </h2>
            </div>
          </div>
        </div>
        <div class="fd-dialog__body fd-dialog__body--no-vertical-padding">
          <ContextSwitcherNav
            {actions}
            {config}
            {customOptionsRenderer}
            {options}
            {selectedLabel}
            {selectedOption}
            {getNodeName}
            {getRouteLink}
            {getTranslation}
            {isMobile}
            {isContextSwitcherDropdownShown}
            {focusMenuOnOpen}
            on:onActionClick={onActionClick}
            on:goToOption={goToOption}
          />
        </div>
        <footer class="fd-dialog__footer fd-bar fd-bar--cosy fd-bar--footer">
          <div class="fd-bar__right">
            <div class="fd-bar__element">
              <button
                class="fd-button fd-button--light fd-dialog__decisive-button"
                on:click={toggleDropdownState}
                data-testid="mobile-topnav-close"
              >
                Cancel
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  {/if}
{/if}

<style lang="scss">
  .lui-ctx-switch-menu {
    max-width: 30vw;
    color: var(--sapShell_TextColor, #fff);

    @media (min-width: 1024px) {
      max-width: 15vw;
    }

    @media (min-width: 1300px) {
      max-width: 30vw;
    }
  }

  .lui-ctx-switch-menu {
    &.fd-button[aria-disabled='true'] {
      opacity: 1;
      cursor: default;
      background-color: transparent;
      border: 1px solid var(--sapShell_BorderColor, transparent);
      padding-right: calc(0.625rem - var(--sapButton_BorderWidth, 0.0625rem));
      &:after {
        display: none;
        content: '';
      }
    }
  }

  .fd-popover {
    .fd-popover__body {
      right: 0;
    }
  }
</style>
