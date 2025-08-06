import Events from '@luigi-project/container';
import { UXModule } from './ux-module';
import type { Luigi } from '../core-api/luigi';

export const CommunicationModule = {
  luigi: {} as Luigi,
  init: (luigi: Luigi) => {
    console.log('Init communication...');
    CommunicationModule.luigi = luigi;
  },
  addListeners: (containerElement: any, luigi: Luigi) => {
    containerElement.addEventListener(Events.NAVIGATION_REQUEST, (event: any) => {
      luigi.navigation().navigate(event.detail.link, event.detail.preserveView, event.detail.modal);
    });
    containerElement.addEventListener(Events.ALERT_REQUEST, (event: any) => {
      UXModule.processAlert(event.payload, true, containerElement);
    });
    containerElement.addEventListener(Events.SHOW_CONFIRMATION_MODAL_REQUEST, (event: any) => {
      UXModule.handleConfirmationModalRequest(event.payload, containerElement);
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
    containerElement.addEventListener(Events.ADD_NODE_PARAMS_REQUEST, (event: any) => {
      luigi.routing().addNodeParams(event.payload.data, event.payload.keepBrowserHistory);
    });
  }
};
