import Events from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { NavigationService } from '../services/navigation.service';
import { PreloadingService } from '../services/preloading.service';
import { RoutingModule } from './routing-module';
import { serviceRegistry } from '../services/service-registry';
import { UIModule } from './ui-module';
import { UXModule, type AlertSettings, type ConfirmationModalSettings } from './ux-module';
import type { NavigationRequestParams } from '../types/navigation';
import { I18nHelpers } from '../utilities/helpers/i18n-helpers';
import type { LuigiEvent } from '@luigi-project/container/constants/events';

interface NavigationRequestDetail {
  drawer: unknown;
  link: string;
  intent: boolean;
  preserveView: string;
  modal: unknown;
  newTab: boolean;
  withoutSync: boolean;
  preventContextUpdate: boolean;
  preventHistoryEntry: boolean;
  fromVirtualTreeRoot: boolean;
  fromContext: boolean;
  fromClosestContext: boolean;
  fromParent: boolean;
  relative: boolean;
  nodeParams: Record<string, string>;
}

export const CommunicationModule = {
  luigi: {} as Luigi,
  init: (luigi: Luigi) => {
    CommunicationModule.luigi = luigi;
  },
  addListeners: (containerElement: any, luigi: Luigi) => {
    containerElement.addEventListener(Events.INITIALIZED, (event: LuigiEvent) => {
      UXModule.luigi?.ux().hideLoadingIndicator(containerElement.parentNode);
      const preloadingService = serviceRegistry.get(PreloadingService);
      preloadingService.viewGroupLoaded(containerElement);
      if (!containerElement._luigiPreloading && containerElement.style.display !== 'none') {
        preloadingService.preload();
      }
    });
    containerElement.addEventListener(Events.NAVIGATION_COMPLETED_REPORT, () => {
      serviceRegistry.get(PreloadingService).preload();
    });
    containerElement.addEventListener(Events.NAVIGATION_REQUEST, (event: LuigiEvent) => {
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
    containerElement.addEventListener(Events.RUNTIME_ERROR_HANDLING_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { data?: { errorObj?: object } };
      luigi.navigation().runTimeErrorHandler(payload?.data?.errorObj || {});
    });
    containerElement.addEventListener(Events.ALERT_REQUEST, (event: LuigiEvent) => {
      UXModule.processAlert(event.payload as AlertSettings, true, containerElement);
    });
    containerElement.addEventListener(Events.SHOW_CONFIRMATION_MODAL_REQUEST, (event: LuigiEvent) => {
      UXModule.handleConfirmationModalRequest(event.payload as ConfirmationModalSettings, containerElement);
    });
    containerElement.addEventListener(Events.SET_DOCUMENT_TITLE_REQUEST, (event: LuigiEvent) => {
      const detail = event.detail as { title: string };
      CommunicationModule.luigi.getEngine()._connector?.setDocumentTitle(detail.title);
    });
    containerElement.addEventListener(Events.SHOW_LOADING_INDICATOR_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.showLoadingIndicator(containerElement.parentNode);
    });
    containerElement.addEventListener(Events.HIDE_LOADING_INDICATOR_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.hideLoadingIndicator(containerElement.parentNode);
    });
    containerElement.addEventListener(Events.ADD_BACKDROP_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.addBackdrop();
    });
    containerElement.addEventListener(Events.REMOVE_BACKDROP_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.removeBackdrop();
    });
    containerElement.addEventListener(Events.SET_DIRTY_STATUS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { dirty?: boolean };
      UXModule.handleDirtyStatusRequest(payload?.dirty ?? false, containerElement);
    });
    containerElement.addEventListener(Events.ADD_NODE_PARAMS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { data: Record<string, string>; keepBrowserHistory: boolean };
      luigi.routing().addNodeParams(payload.data, payload.keepBrowserHistory);
    });
    containerElement.addEventListener(Events.OPEN_USER_SETTINGS_REQUEST, () => {
      luigi.ux().openUserSettings();
    });
    containerElement.addEventListener(Events.CLOSE_USER_SETTINGS_REQUEST, () => {
      CommunicationModule.luigi.getEngine()._connector?.closeUserSettings();
    });
    containerElement.addEventListener(Events.ADD_SEARCH_PARAMS_REQUEST, (event: LuigiEvent) => {
      const detail = event.detail as { data: Record<string, string>; keepBrowserHistory: boolean };
      RoutingModule.addSearchParamsFromClient(detail.data, detail.keepBrowserHistory, luigi);
    });
    containerElement.addEventListener(Events.UPDATE_MODAL_SETTINGS_REQUEST, (event: LuigiEvent) => {
      const payload = event.payload as { updatedModalSettings: object; addHistoryEntry: boolean };
      UIModule.updateModalSettings(payload.updatedModalSettings, payload.addHistoryEntry, luigi);
    });
    containerElement.addEventListener(Events.SET_CURRENT_LOCALE_REQUEST, (event: LuigiEvent) => {
      if (!I18nHelpers.hasLocaleChangePermission(containerElement)) {
        return;
      }
      const detail = event.detail as { data?: { data?: { currentLocale?: string } } };
      const locale = detail?.data?.data?.currentLocale;
      if (locale) {
        luigi.i18n().setCurrentLocale(locale);
      }
    });
  }
};
