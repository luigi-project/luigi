import Events from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { NavigationService } from '../services/navigation.service';
import { PreloadingService } from '../services/preloading.service';
import { RoutingModule } from './routing-module';
import { serviceRegistry } from '../services/service-registry';
import { UIModule } from './ui-module';
import { UXModule, type AlertSettings, type ConfirmationModalSettings } from './ux-module';
import type { NavigationRequestParams, NavigationRequestDetail, ViewGroupSettings } from '../types/navigation';
import { I18nHelpers } from '../utilities/helpers/i18n-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import type { LuigiEvent } from '@luigi-project/container/constants/events';

function applyViewGroupData(vg: string, data: Record<string, any>, luigi: Luigi): void {
  const allVgSettings: Record<string, ViewGroupSettings> = luigi.getConfigValue('navigation.viewGroupSettings') || {};
  if (!allVgSettings[vg]) {
    allVgSettings[vg] = {};
  }
  allVgSettings[vg]._liveCustomData = data;
  luigi.configChanged('navigation.viewgroupdata');
}

/**
 * Maps a container event (as dispatched by @luigi-project/container on the container element)
 * to the internal Luigi Client message id (the value microfrontends actually post, e.g.
 * `luigi.navigation.open`). `communication.skipEventsWhenInactive` is configured with these
 * internal ids (see docs/communication.md), so matching has to happen against them, not against
 * the container event names.
 */
const CONTAINER_EVENT_TO_CLIENT_MSG: Record<string, string> = {
  [Events.INITIALIZED]: 'luigi.init.ok',
  [Events.NAVIGATION_COMPLETED_REPORT]: 'luigi.navigate.ok',
  [Events.CUSTOM_MESSAGE]: 'custom',
  [Events.NAVIGATION_REQUEST]: 'luigi.navigation.open',
  [Events.ALERT_REQUEST]: 'luigi.ux.alert.show',
  [Events.SHOW_CONFIRMATION_MODAL_REQUEST]: 'luigi.ux.confirmationModal.show',
  [Events.ADD_SEARCH_PARAMS_REQUEST]: 'luigi.addSearchParams',
  [Events.ADD_NODE_PARAMS_REQUEST]: 'luigi.addNodeParams',
  [Events.SET_CURRENT_LOCALE_REQUEST]: 'luigi.ux.set-current-locale',
  [Events.SET_ANCHOR_LINK_REQUEST]: 'luigi.setAnchor',
  [Events.SET_DIRTY_STATUS_REQUEST]: 'luigi.set-page-dirty',
  [Events.RUNTIME_ERROR_HANDLING_REQUEST]: 'luigi-runtime-error-handling',
  [Events.SHOW_LOADING_INDICATOR_REQUEST]: 'luigi.show-loading-indicator',
  [Events.HIDE_LOADING_INDICATOR_REQUEST]: 'luigi.hide-loading-indicator',
  [Events.GO_BACK_REQUEST]: 'luigi.navigation.back',
  [Events.GET_CURRENT_ROUTE_REQUEST]: 'luigi.navigation.currentRoute',
  [Events.SET_VIEW_GROUP_DATA_REQUEST]: 'luigi.setVGData',
  [Events.ADD_BACKDROP_REQUEST]: 'luigi.add-backdrop',
  [Events.REMOVE_BACKDROP_REQUEST]: 'luigi.remove-backdrop',
  [Events.UPDATE_MODAL_SETTINGS_REQUEST]: 'luigi.navigation.updateModalSettings',
  [Events.CLOSE_CURRENT_MODAL_REQUEST]: 'luigi.close-modal'
};

/**
 * Mirrors the legacy core `skipEventsWhenInactive` behaviour: when the microfrontend's container
 * is currently inactive (not visible), events whose internal message id is listed in
 * `communication.skipEventsWhenInactive` are ignored. Modal and drawer containers are exempt,
 * just like the special iframes in legacy core. Returns true if the event should be skipped.
 */
function shouldSkipInactiveEvent(containerElement: any, containerEventName: string, luigi: Luigi): boolean {
  if (UIModule.modalContainer?.includes(containerElement) || UIModule.drawerContainer === containerElement) {
    return false;
  }
  const skipInactiveConfig: string[] = luigi.getConfigValue('communication.skipEventsWhenInactive');
  if (!skipInactiveConfig?.length) {
    return false;
  }
  const clientMsgId = CONTAINER_EVENT_TO_CLIENT_MSG[containerEventName];
  if (!clientMsgId || !skipInactiveConfig.includes(clientMsgId)) {
    return false;
  }
  if (GenericHelpers.isElementVisible(containerElement)) {
    return false;
  }
  console.debug(`EVENT '${clientMsgId}' from inactive microfrontend -> SKIPPED`);
  return true;
}

export const CommunicationModule = {
  luigi: {} as Luigi,
  init: (luigi: Luigi) => {
    CommunicationModule.luigi = luigi;
  },
  addListeners: (containerElement: any, luigi: Luigi) => {
    const addListener = (eventName: string, handler: (event: LuigiEvent) => void): void => {
      containerElement.addEventListener(eventName, (event: LuigiEvent) => {
        if (shouldSkipInactiveEvent(containerElement, eventName, luigi)) {
          return;
        }
        handler(event);
      });
    };
    addListener(Events.INITIALIZED, (event: LuigiEvent) => {
      UXModule.luigi?.ux().hideLoadingIndicator(containerElement.parentNode);
      const preloadingService = serviceRegistry.get(PreloadingService);
      preloadingService.viewGroupLoaded(containerElement);
      if (!containerElement._luigiPreloading && containerElement.style.display !== 'none') {
        preloadingService.preload();
      }
    });
    addListener(Events.NAVIGATION_COMPLETED_REPORT, () => {
      serviceRegistry.get(PreloadingService).preload();
    });
    addListener(Events.NAVIGATION_REQUEST, (event: LuigiEvent) => {
      const detail = event.detail as NavigationRequestDetail;
      const {
        drawer,
        link,
        intent,
        preserveView,
        modal,
        newTab,
        withoutSync,
        preventContextUpdate,
        preventHistoryEntry,
        fromVirtualTreeRoot,
        fromContext,
        fromClosestContext,
        fromParent,
        relative,
        nodeParams
      } = detail;
      const navRequestParams: NavigationRequestParams = {
        drawerSettings: drawer,
        intent,
        modalSettings: modal,
        newTab,
        path: link,
        preserveView,
        preventContextUpdate,
        options: {
          fromVirtualTreeRoot,
          fromContext,
          fromClosestContext,
          fromParent,
          relative,
          nodeParams
        },
        preventHistoryEntry,
        withoutSync
      };
      serviceRegistry
        .get(NavigationService)
        .handleNavigationRequest(navRequestParams, (data: unknown) => event.callback(data));
    });
    addListener(Events.RUNTIME_ERROR_HANDLING_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { data?: { errorObj?: object } };
      luigi.navigation().runTimeErrorHandler(payload?.data?.errorObj || {});
    });
    addListener(Events.ALERT_REQUEST, (event: LuigiEvent) => {
      UXModule.processAlert(event.payload as AlertSettings, true, containerElement);
    });
    addListener(Events.SHOW_CONFIRMATION_MODAL_REQUEST, (event: LuigiEvent) => {
      UXModule.handleConfirmationModalRequest(event.payload as ConfirmationModalSettings, containerElement);
    });
    addListener(Events.SET_DOCUMENT_TITLE_REQUEST, (event: LuigiEvent) => {
      const detail = event.detail as { title: string };
      CommunicationModule.luigi.getEngine()._connector?.setDocumentTitle(detail.title);
    });
    addListener(Events.SHOW_LOADING_INDICATOR_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.showLoadingIndicator(containerElement.parentNode);
    });
    addListener(Events.HIDE_LOADING_INDICATOR_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.hideLoadingIndicator(containerElement.parentNode);
    });
    addListener(Events.ADD_BACKDROP_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.addBackdrop();
    });
    addListener(Events.REMOVE_BACKDROP_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.removeBackdrop();
    });
    addListener(Events.SET_ANCHOR_LINK_REQUEST, (event: LuigiEvent) => {
      const anchor = (event?.payload as string) || '';
      containerElement.anchor = anchor;
      containerElement.updateContext(containerElement.context || {});
      luigi.routing().setAnchor(anchor);
    });
    addListener(Events.SET_DIRTY_STATUS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { dirty?: boolean };
      UXModule.handleDirtyStatusRequest(payload?.dirty ?? false, containerElement);
    });
    addListener(Events.ADD_NODE_PARAMS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { data: Record<string, string>; keepBrowserHistory: boolean };
      luigi.routing().addNodeParams(payload.data, payload.keepBrowserHistory);
    });
    addListener(Events.COLLAPSE_LEFT_NAV_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { state: boolean };
      luigi.ux().collapseLeftSideNav(payload.state);
    });
    addListener(Events.OPEN_USER_SETTINGS_REQUEST, () => {
      luigi.ux().openUserSettings();
    });
    addListener(Events.CLOSE_USER_SETTINGS_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.closeUserSettings();
    });
    addListener(Events.ADD_SEARCH_PARAMS_REQUEST, (event: LuigiEvent) => {
      const detail = event.detail as {
        data: Record<string, string>;
        keepBrowserHistory: boolean;
        preventLuigiConfigUpdate: boolean;
      };
      RoutingModule.addSearchParamsFromClient(
        detail.data,
        detail.keepBrowserHistory,
        detail.preventLuigiConfigUpdate,
        luigi
      );
    });
    addListener(Events.UPDATE_MODAL_SETTINGS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { updatedModalSettings: object; addHistoryEntry: boolean };
      UIModule.updateModalSettings(payload.updatedModalSettings, payload.addHistoryEntry, luigi);
    });
    addListener(Events.SET_CURRENT_LOCALE_REQUEST, (event: LuigiEvent) => {
      if (!I18nHelpers.hasLocaleChangePermission(containerElement)) {
        return;
      }
      const detail = event.detail as { data?: { data?: { currentLocale?: string } } };
      const locale = detail?.data?.data?.currentLocale;
      if (locale) {
        luigi.i18n().setCurrentLocale(locale);
      }
    });
    addListener(Events.GET_CURRENT_ROUTE_REQUEST, (event: LuigiEvent) => {
      const options = event.payload as {
        fromClosestContext?: boolean;
        fromContext?: string | null;
        fromParent?: boolean;
        fromVirtualTreeRoot?: boolean;
      };
      serviceRegistry
        .get(NavigationService)
        .getCurrentRoutePath(options)
        .then((route) => {
          event.callback(route);
        })
        .catch(() => event.callback(''));
    });
    addListener(Events.SET_VIEW_GROUP_DATA_REQUEST, (event: LuigiEvent) => {
      const vg = containerElement.viewGroup;
      if (vg) {
        applyViewGroupData(vg, event.detail as Record<string, any>, luigi);
      }
    });
    addListener(Events.GO_BACK_REQUEST, (event: LuigiEvent) => {
      if (containerElement.parentNode?.classList?.contains('content')) {
        serviceRegistry.get(NavigationService).handleGoBackRequest(event.payload);
      }
    });
    addListener(Events.CUSTOM_MESSAGE, (event: LuigiEvent) => {
      const payload = event.payload as { id: string; _metaData?: { src?: HTMLElement }; data?: Record<string, any> };
      const customMessagesListeners: Record<string, any> =
        luigi.getConfigValue('communication.customMessagesListeners') || {};
      const customMessageListener = customMessagesListeners[payload?.id];
      const userSettingsCMKey = 'luigi.updateUserSettings';

      if (payload?.id === userSettingsCMKey) {
        if (customMessageListener) {
          console.warn(`The key "${userSettingsCMKey}" is not allowed to use for custom messages.`);
        }
        return;
      }

      if (typeof customMessageListener === 'function') {
        const microfrontends = luigi.elements().getMicrofrontends();
        // Web components do not have an iframeHandle. Use the container's stable id for
        // both rendering modes; prefer an exact source match for compound events.
        const source = payload?._metaData?.src || containerElement.iframeHandle?.iframe;
        const microfrontend =
          microfrontends.find((mf) => source && mf.container === source) ||
          microfrontends.find((mf) => containerElement.luigiMfId != null && mf.id === containerElement.luigiMfId);

        const message = { id: payload?.id, ...(payload?.data || {}) };

        customMessageListener(
          message,
          microfrontend,
          GenericHelpers.removeInternalProperties(containerElement.currentNode)
        );
      } else {
        console.warn(
          `Warning: Custom message with id: '${payload?.id}' does not exist. Make sure you provided the same id as in the config file.`
        );
      }
    });
  }
};
