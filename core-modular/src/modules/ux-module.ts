import type { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import { writable, type Writable } from 'svelte/store';
import type { Luigi } from '../core-api/luigi';
import { DirtyStatusService } from '../services/dirty-status.service';

export interface AlertSettings {
  text?: string;
  type?: string;
  links?: Record<string, Link>;
  closeAfter?: number;
  id?: string;
}

export interface AlertHandler {
  openFromClient: boolean;
  close(): void;
  link(linkKey: string): boolean;
}

export interface ProcessedAlertSettings {
  settings: AlertSettings;
}

export interface Link {
  elemId: string;
  url?: string;
  dismissKey?: string;
}

export interface ProcessedTextAndLinks {
  sanitizedText: string;
  links: Link[];
}

export interface ConfirmationModalSettings {
  icon?: string;
  type?: string;
  header?: string;
  body?: string;
  buttonConfirm?: string;
  buttonDismiss?: string;
}

export interface ConfirmationModalHandler {
  confirm(): void;
  dismiss(): void;
}

export interface UserSettings {
  [key: string]: number | string | boolean;
}

export const UXModule = {
  luigi: undefined as Luigi | undefined,
  documentTitle: undefined as any,
  
  init: (luigi: Luigi) => {
    console.log('ux init...');
    UXModule.luigi = luigi;
    UXModule.documentTitle = writable() as Writable<string>;
  },
  processAlert: (
    alertSettings: AlertSettings,
    openFromClient: boolean,
    containerElement: LuigiContainer | LuigiCompoundContainer
  ) => {
    if (!UXModule.luigi) {
      throw new Error('Luigi is not initialized.');
    }

    const alertHandler = {
      openFromClient,
      close: () => {
        if (alertSettings.id) {
          containerElement.notifyAlertClosed(alertSettings.id);
        }
      },
      link: (linkKey: string) => {
        if (alertSettings.links) {
          const link = alertSettings.links[linkKey];
          if (link) {
            link.url && UXModule.luigi?.navigation().navigate(link.url);
            if (link.dismissKey && alertSettings.id) {
              containerElement.notifyAlertClosed(alertSettings.id, link.dismissKey);
              return true;
            }
          }
        }
        return false;
      }
    };
    UXModule.luigi.getEngine()._connector?.renderAlert(alertSettings, alertHandler);
  },

  handleConfirmationModalRequest: (
    confirmationModalSettings: ConfirmationModalSettings,
    containerElement: LuigiContainer | LuigiCompoundContainer
  ) => {
    if (!UXModule.luigi) {
      throw new Error('Luigi is not initialized.');
    }
    UXModule.luigi.getEngine()._connector?.renderConfirmationModal(confirmationModalSettings, {
      confirm() {
        containerElement.notifyConfirmationModalClosed(true);
      },
      dismiss() {
        containerElement.notifyConfirmationModalClosed(false);
      }
    });
  },

  handleDirtyStatusRequest: (isDirty: boolean, source: any) => {
    if (!UXModule.luigi) {
      throw new Error('Luigi is not initialized.');
    }
    UXModule.luigi.getEngine().dirtyStatusService.updateDirtyStatus(isDirty, source);
  }
};
