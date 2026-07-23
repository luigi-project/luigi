import type { LuigiCompoundContainer, LuigiContainer } from '@luigi-project/container';
import type { Luigi } from '../core-api/luigi';
import { serviceRegistry } from '../services/service-registry';
import { DirtyStatusService } from '../services/dirty-status.service';
import type { AlertSettings, ConfirmationModalSettings, Link } from '../types/ux';
import { EscapingHelpers } from '../utilities/helpers/escaping-helpers';
import { writable } from '../utilities/store';

// Re-exported for backwards-compatibility with consumers that imported these from this module.
export type {
  AlertHandler,
  AlertSettings,
  ConfirmationModalHandler,
  ConfirmationModalSettings,
  Link
} from '../types/ux';

export interface ProcessedAlertSettings {
  settings: AlertSettings;
}

export interface ProcessedTextAndLinks {
  sanitizedText: string;
  links: Link[];
}

export interface UserSettings {
  [key: string]: number | string | boolean;
}

let dirtyStatusService: DirtyStatusService;

export const UXModule = {
  luigi: undefined as Luigi | undefined,
  documentTitle: undefined as any,
  init: (luigi: Luigi) => {
    UXModule.luigi = luigi;
    UXModule.documentTitle = writable(undefined);
    dirtyStatusService = serviceRegistry.get(DirtyStatusService);
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

    if (confirmationModalSettings) {
      const modalBody = confirmationModalSettings.body
        ? confirmationModalSettings.body
        : UXModule.luigi.i18n().getTranslation('luigi.confirmationModal.body');

      confirmationModalSettings = {
        ...confirmationModalSettings,
        ...{
          header: UXModule.luigi
            .i18n()
            .getTranslation(confirmationModalSettings.header || 'luigi.confirmationModal.header'),
          body: EscapingHelpers.sanatizeHtmlExceptTextFormatting(modalBody),
          buttonDismiss: UXModule.luigi
            .i18n()
            .getTranslation(confirmationModalSettings.buttonDismiss || 'luigi.button.dismiss'),
          buttonConfirm: UXModule.luigi
            .i18n()
            .getTranslation(confirmationModalSettings.buttonConfirm || 'luigi.button.confirm')
        }
      };
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
    dirtyStatusService.updateDirtyStatus(isDirty, source);
  }
};
