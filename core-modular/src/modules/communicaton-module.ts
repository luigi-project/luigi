import Events from '@luigi-project/container';
import { UXModule } from './ux-module';
import type { Luigi } from '../core-api/luigi';
import { RoutingModule } from './routing-module';

export const CommunicationModule = {
  luigi: {} as Luigi,
  init: (luigi: Luigi) => {
    console.log('Init communication...');
    CommunicationModule.luigi = luigi;
  },
  addListeners: (containerElement: any, luigi: Luigi) => {
    containerElement.addEventListener(Events.INITIALIZED, (event: any) => {
      UXModule.handleInitializeEvent(event.detail);
    });
    containerElement.addEventListener(Events.NAVIGATION_REQUEST, (event: any) => {
      luigi.navigation().navigate(event.detail.link, event.detail.preserveView, event.detail.modal);
    });
    containerElement.addEventListener(Events.ALERT_REQUEST, (event: any) => {
      UXModule.processAlert(event.payload, true, containerElement);
    });
    containerElement.addEventListener(Events.SHOW_CONFIRMATION_MODAL_REQUEST, (event: any) => {
      UXModule.handleConfirmationModalRequest(event.payload, containerElement);
    });
    containerElement.addEventListener(Events.SET_DOCUMENT_TITLE_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.setDocumentTitle(event.detail.title);
    });
    containerElement.addEventListener(Events.SHOW_LOADING_INDICATOR_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.showLoadingIndicator();
    });
    containerElement.addEventListener(Events.HIDE_LOADING_INDICATOR_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.hideLoadingIndicator();
    });
    containerElement.addEventListener(Events.ADD_BACKDROP_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.addBackdrop();
    });
    containerElement.addEventListener(Events.REMOVE_BACKDROP_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.removeBackdrop();
    });
    containerElement.addEventListener(Events.SET_DIRTY_STATUS_REQUEST, (event: any) => {
      UXModule.handleDirtyStatusRequest(event.detail?.data?.dirty, event.detail?.source);
    });
    containerElement.addEventListener(Events.ADD_NODE_PARAMS_REQUEST, (event: any) => {
      luigi.routing().addNodeParams(event.payload.data, event.payload.keepBrowserHistory);
    });
    containerElement.addEventListener(Events.OPEN_USER_SETTINGS_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.openUserSettings(event.detail);
    });
    containerElement.addEventListener(Events.CLOSE_USER_SETTINGS_REQUEST, (event: any) => {
      CommunicationModule.luigi.getEngine()._connector?.closeUserSettings();
    });
    containerElement.addEventListener(Events.ADD_SEARCH_PARAMS_REQUEST, (event: any) => {
      RoutingModule.addSearchParamsFromClient(event.detail.data, event.detail.keepBrowserHistory, luigi);
    });
  }
};
