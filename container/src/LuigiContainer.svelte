<svelte:options
  customElement={{
    tag: null,
    shadow: 'none',
    props: {
      activeFeatureToggleList: { type: 'Array', reflect: false, attribute: 'active-feature-toggle-list' },
      allowRules: { type: 'Array', reflect: false, attribute: 'allow-rules' },
      anchor: { type: 'String', reflect: false, attribute: 'anchor' },
      authData: { type: 'Object', reflect: false, attribute: 'auth-data' },
      clientPermissions: { type: 'Object', reflect: false, attribute: 'client-permissions' },
      context: { type: 'String', reflect: false, attribute: 'context' },
      deferInit: { type: 'Boolean', attribute: 'defer-init' },
      dirtyStatus: { type: 'Boolean', reflect: false, attribute: 'dirty-status' },
      documentTitle: { type: 'String', reflect: false, attribute: 'document-title' },
      hasBack: { type: 'Boolean', reflect: false, attribute: 'has-back' },
      label: { type: 'String', reflect: false, attribute: 'label' },
      locale: { type: 'String', reflect: false, attribute: 'locale' },
      noShadow: { type: 'Boolean', attribute: 'no-shadow' },
      nodeParams: { type: 'Object', reflect: false, attribute: 'node-params' },
      pathParams: { type: 'Object', reflect: false, attribute: 'path-params' },
      sandboxRules: { type: 'Array', reflect: false, attribute: 'sandbox-rules' },
      searchParams: { type: 'Object', reflect: false, attribute: 'search-params' },
      skipCookieCheck: { type: 'String', reflect: false, attribute: 'skip-cookie-check' },
      skipInitCheck: { type: 'Boolean', reflect: false, attribute: 'skip-init-check' },
      theme: { type: 'String', reflect: false, attribute: 'theme' },
      userSettings: { type: 'Object', reflect: false, attribute: 'user-settings' },
      viewurl: { type: 'String', reflect: false, attribute: 'viewurl' },
      webcomponent: { type: 'String', reflect: false, attribute: 'webcomponent' }
    },
    extend: (customElementConstructor) => {
      let notInitFn = (name) => {
        return () =>
          console.warn(name + " can't be called on luigi-container before its micro frontend is attached to the DOM.");
      };

      return class extends customElementConstructor {
        sendCustomMessage = notInitFn('sendCustomMessage');
        updateContext = notInitFn('updateContext');
        updateViewUrl = notInitFn('updateViewUrl');
        closeAlert = notInitFn('closeAlert');
        notifyAlertClosed = notInitFn('notifyAlertClosed');
        notifyConfirmationModalClosed = notInitFn('notifyConfirmationModalClosed');
        attributeChangedCallback(name, oldValue, newValue) {
          try{
            super.attributeChangedCallback(name, oldValue, newValue);
          } catch (e) {
            console.error('Error in super.attributeChangedCallback', e);
          }
          if (this.containerInitialized) {
            if (name === 'context') {
              this.updateContext(JSON.parse(newValue));
            }
            if (name === 'auth-data') {
              ContainerAPI.updateAuthData(this.iframeHandle, JSON.parse(newValue));
            }
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
  import { onMount, onDestroy } from 'svelte';
  import { ContainerAPI } from './api/container-api';
  import { Events } from './constants/communication';
  import type { IframeHandle, ContainerElement } from './constants/container.model';
  import { containerService } from './services/container.service';
  import { getAllowRules } from './services/iframe-helpers';
  import { WebComponentService } from './services/webcomponents.service';
  import { GenericHelperFunctions } from './utilities/helpers';

  /* eslint-disable */
  export let activeFeatureToggleList: string[];
  export let allowRules: string[];
  export let anchor: string;
  export let authData: any;
  export let clientPermissions: any;
  export let context: string;
  export let deferInit: boolean;
  export let dirtyStatus: boolean;
  export let documentTitle: string;
  export let hasBack: boolean;
  export let label: string;
  export let locale: string;
  export let noShadow: boolean;
  export let nodeParams: any;
  export let pathParams: any;
  export let sandboxRules: string[];
  export let searchParams: any;
  export let skipCookieCheck: 'false' | 'true';
  export let skipInitCheck: boolean;
  export let theme: string;
  export let userSettings: any;
  export let viewurl: string;
  export let webcomponent: any;
  /* eslint-enable */

  const iframeHandle: IframeHandle = {};
  let mainComponent: ContainerElement;
  let containerInitialized = false;

  const webcomponentService = new WebComponentService();

  // Only needed for get rid of "unused export property" svelte compiler warnings
  export const unwarn = () => {
    return (
      activeFeatureToggleList &&
      allowRules &&
      anchor &&
      authData &&
      clientPermissions &&
      dirtyStatus &&
      documentTitle &&
      hasBack &&
      locale &&
      noShadow &&
      nodeParams &&
      pathParams &&
      sandboxRules &&
      searchParams &&
      skipCookieCheck &&
      skipInitCheck &&
      theme &&
      userSettings
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialize = (thisComponent: any) => {
    if (!containerInitialized) {
      thisComponent.sendCustomMessage = (id: string, data?: object) => {
        ContainerAPI.sendCustomMessage(
          id,
          thisComponent.getNoShadow() ? thisComponent : mainComponent,
          !!webcomponent,
          iframeHandle,
          data
        );
      };
      
      thisComponent.updateContext = (contextObj: object, internal?: object) => {
        context = contextObj;
        if (webcomponent) {
          (thisComponent.getNoShadow() ? thisComponent : mainComponent)._luigi_mfe_webcomponent.context = contextObj;
        } else {
          ContainerAPI.updateContext(contextObj, internal, iframeHandle, nodeParams, pathParams, searchParams);
        }
      };

      thisComponent.closeAlert = (id: string, dismissKey?: string) => {
        thisComponent.notifyAlertClosed(id, dismissKey);
      };

      thisComponent.notifyAlertClosed = (id: string, dismissKey?: string) => {
        // check if thisComponent is in dom
        if (thisComponent.isConnected) {
          if (webcomponent) {
            webcomponentService.resolveAlert(id, dismissKey);
          } else {
            ContainerAPI.notifyAlertClosed(id, dismissKey, iframeHandle);
          }
        }
      }

      thisComponent.notifyConfirmationModalClosed = (result) => {
        // check if thisComponent is in dom
        if (thisComponent.isConnected) {
          if (webcomponent) {
            webcomponentService.notifyConfirmationModalClosed(!!result);
          } else {
            ContainerAPI.notifyConfirmationModalClosed(!!result, iframeHandle);
          }
        }
      }

      containerService.registerContainer(thisComponent);
      webcomponentService.thisComponent = thisComponent;

      const ctx = GenericHelperFunctions.resolveContext(context);

      thisComponent.updateViewUrl = (viewUrl: string, internal?: object) => {
        if (viewUrl?.length) {
          ContainerAPI.updateViewUrl(viewUrl, GenericHelperFunctions.resolveContext(context), internal, iframeHandle);
        }
      };

      if (webcomponent && webcomponent != 'false') {
        if (!thisComponent.getNoShadow()) {
          mainComponent.innerHTML = '';
          const shadow = thisComponent.attachShadow({ mode: 'open' });
          shadow.append(mainComponent);
        } else {
          // removing mainComponent
          thisComponent.innerHTML = '';
        }
        const webComponentValue = GenericHelperFunctions.checkWebcomponentValue(webcomponent);
        webcomponentService.renderWebComponent(
          viewurl,
          thisComponent.getNoShadow() ? thisComponent : mainComponent,
          ctx,
          typeof webComponentValue === 'object' ? { webcomponent: webComponentValue } : {}
        );
      } else {
        if (!thisComponent.getNoShadow()) {
          // removeing mainComponent
          thisComponent.innerHTML = '';
          const shadow = thisComponent.attachShadow({ mode: 'open' });
          shadow.append(mainComponent);
        }
      }
      if (skipInitCheck) {
        thisComponent.initialized = true;
        setTimeout(() => {
          webcomponentService.dispatchLuigiEvent(Events.INITIALIZED, {});
        });
      } else if (webcomponent) {
        (thisComponent.getNoShadow() ? thisComponent : mainComponent).addEventListener('wc_ready', () => {
          if (
            !(thisComponent.getNoShadow() ? thisComponent : mainComponent)._luigi_mfe_webcomponent?.deferLuigiClientWCInit
          ) {
            thisComponent.initialized = true;
            webcomponentService.dispatchLuigiEvent(Events.INITIALIZED, {});
          }
        });
      }
      containerInitialized = true;
      thisComponent.containerInitialized = true;
    }
  };

  onMount(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thisComponent: any = mainComponent.parentNode;
    thisComponent.iframeHandle = iframeHandle;
    thisComponent.init = () => {
      initialize(thisComponent);
    };
    if (!deferInit && viewurl) {
      initialize(thisComponent);
    }
  });

  onDestroy(async () => {});
</script>

<main bind:this={mainComponent} class={webcomponent ? undefined : 'lui-isolated'}>
  {#if containerInitialized}
    {#if !webcomponent || webcomponent === 'false'}
      <style>
        main.lui-isolated,
        .lui-isolated iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        main.lui-isolated {
          line-height: 0;
        }
      </style>
      <iframe
        bind:this={iframeHandle.iframe}
        src={viewurl}
        title={label}
        allow={getAllowRules(allowRules)}
        sandbox={sandboxRules ? sandboxRules.join(' ') : undefined}
      />
    {/if}
  {/if}
</main>
