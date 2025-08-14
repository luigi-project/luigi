<svelte:options
  customElement={{
    tag: null,
    shadow: 'none',
    props: {
      activeFeatureToggleList: { type: 'Array', reflect: false, attribute: 'active-feature-toggle-list' },
      anchor: { type: 'String', reflect: false, attribute: 'anchor' },
      clientPermissions: {
        type: 'Object',
        reflect: false,
        attribute: 'client-permissions'
      },
      compoundConfig: {
        type: 'Object',
        reflect: false,
        attribute: 'compound-config'
      },
      context: { type: 'String', reflect: false, attribute: 'context' },
      deferInit: { type: 'Boolean', attribute: 'defer-init' },
      dirtyStatus: { type: 'Boolean', reflect: false, attribute: 'dirty-status' },
      documentTitle: { type: 'String', reflect: false, attribute: 'document-title' },
      hasBack: { type: 'Boolean', reflect: false, attribute: 'has-back' },
      locale: { type: 'String', reflect: false, attribute: 'locale' },
      noShadow: { type: 'Boolean', attribute: 'no-shadow', reflect: false },
      nodeParams: { type: 'Object', reflect: false, attribute: 'node-params' },
      pathParams: { type: 'Object', reflect: false, attribute: 'path-params' },
      searchParams: {
        type: 'Object',
        reflect: false,
        attribute: 'search-params'
      },
      skipInitCheck: { type: 'Boolean', reflect: false, attribute: 'skip-init-check' },
      theme: { type: 'String', reflect: false, attribute: 'theme' },
      userSettings: {
        type: 'Object',
        reflect: false,
        attribute: 'user-settings'
      },
      viewurl: { type: 'String', reflect: false, attribute: 'viewurl' },
      webcomponent: { type: 'String', reflect: false, attribute: 'webcomponent' }
    },
    extend: (customElementConstructor) => {
      let notInitFn = (name) => {
        return () =>
          console.warn(name + " can't be called on luigi-container before its micro frontend is attached to the DOM.");
      };
      return class extends customElementConstructor {
        updateContext = notInitFn('updateContext');
        notifyAlertClosed = notInitFn('notifyAlertClosed');
        notifyConfirmationModalClosed = notInitFn('notifyConfirmationModalClosed');
        attributeChangedCallback(name, oldValue, newValue) {
          try {
            super.attributeChangedCallback(name, oldValue, newValue);
          } catch (e) {
            console.warn('Error in attributeChangedCallback', e);
          }
          if (this.containerInitialized && name === 'context') {
            this.updateContext(JSON.parse(newValue));
          }
        }

        getNoShadow() {
          return this.hasAttribute('no-shadow') || this.noShadow;
        }
      };
    }
  }}
/>

<script lang="ts">
  import { onMount } from 'svelte';
  import { Events } from './constants/communication';
  import type { ContainerElement } from './constants/container.model';
  import { ContainerService } from './services/container.service';
  import { WebComponentService } from './services/webcomponents.service';
  import { GenericHelperFunctions } from './utilities/helpers';

  /* eslint-disable */
  export let activeFeatureToggleList: string[];
  export let anchor: string;
  export let clientPermissions: any;
  export let compoundConfig: any;
  export let context: string;
  export let deferInit: boolean;
  export let dirtyStatus: boolean;
  export let documentTitle: string;
  export let hasBack: boolean;
  export let locale: string;
  export let noShadow: boolean;
  export let nodeParams: any;
  export let pathParams: any;
  export let searchParams: any;
  export let skipInitCheck: boolean;
  export let theme: string;
  export let userSettings: any;
  export let viewurl: string;
  export let webcomponent: any;
  /* eslint-enable */

  let containerInitialized = false;
  let mainComponent: ContainerElement;
  let eventBusElement: ContainerElement;

  const containerService = new ContainerService();
  const webcomponentService = new WebComponentService();

  // Only needed for get rid of "unused export property" svelte compiler warnings
  export const unwarn = () => {
    return (
      activeFeatureToggleList &&
      anchor &&
      clientPermissions &&
      dirtyStatus &&
      documentTitle &&
      hasBack &&
      locale &&
      noShadow &&
      nodeParams &&
      pathParams &&
      searchParams &&
      skipInitCheck &&
      theme &&
      userSettings
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialize = (thisComponent: any) => {
    if (!compoundConfig || containerInitialized) {
      return;
    }
    thisComponent.updateContext = (contextObj: object, internal?: object) => {
      const rootElement = thisComponent.getNoShadow() ? thisComponent : mainComponent;
      rootElement._luigi_mfe_webcomponent.context = contextObj;
      context = contextObj;

      const compoundChildrenQueryElement = rootElement._luigi_mfe_webcomponent;
      if (compoundChildrenQueryElement) {
        const compoundChildren = compoundChildrenQueryElement.querySelectorAll('[lui_web_component]');
        compoundChildren?.forEach((item) => {
          const ctx = item.context || {};
          item.context = Object.assign(ctx, contextObj);
        });
      }
    };
    const ctx = GenericHelperFunctions.resolveContext(context);
    deferInit = false;

    thisComponent.notifyAlertClosed = (id: string, dismissKey?: string) => {
      // check if thisComponent is in dom
      if (thisComponent.isConnected) {
        webcomponentService.resolveAlert(id, dismissKey);
      }
    }

    thisComponent.notifyConfirmationModalClosed = (result) => {
      // check if thisComponent is in dom
      if (thisComponent.isConnected) {
        webcomponentService.notifyConfirmationModalClosed(!!result);
      }
    }

    const node = {
      compound: compoundConfig,
      viewUrl: viewurl,
      webcomponent: GenericHelperFunctions.checkWebcomponentValue(webcomponent) || true
    };
    if (!thisComponent.getNoShadow()) {
      mainComponent.innerHTML = '';
      const shadow = thisComponent.attachShadow({ mode: 'open' });
      shadow.append(mainComponent);
    } else {
      // removing mainComponent
      thisComponent.innerHTML = '';
    }
    webcomponentService
      .renderWebComponentCompound(node, thisComponent.getNoShadow() ? thisComponent : mainComponent, ctx)
      .then((compCnt: ContainerElement) => {
        eventBusElement = compCnt;
        if (skipInitCheck || !node.viewUrl) {
          thisComponent.initialized = true;
          setTimeout(() => {
            webcomponentService.dispatchLuigiEvent(Events.INITIALIZED, {});
          });
        } else if (eventBusElement.LuigiClient && !eventBusElement.deferLuigiClientWCInit) {
          thisComponent.initialized = true;
          webcomponentService.dispatchLuigiEvent(Events.INITIALIZED, {});
        }
      });
    containerInitialized = true;
    thisComponent.containerInitialized = true;
  };

  onMount(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisComponent: any =
      mainComponent.getRootNode() === document
        ? mainComponent.parentNode
        : (mainComponent.getRootNode() as ShadowRoot).host;

    thisComponent.init = () => {
      initialize(thisComponent);
    };
    if (!deferInit) {
      initialize(thisComponent);
    }

    containerService.registerContainer(thisComponent);
    webcomponentService.thisComponent = thisComponent;
  });
</script>

<main bind:this={mainComponent} />

<style>
  main {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
