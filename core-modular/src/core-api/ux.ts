import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import {
  type AlertSettings,
  type ProcessedAlertSettings,
  type ConfirmationModalSettings,
  type UserSettings
} from '../modules/ux-module';
import type { Luigi } from './luigi';

export class UX {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  showAlert = (alertSettings: AlertSettings) => {
    return new Promise((resolve) => {
      if (!alertSettings.id) {
        //TODO closeAlert will eine id als string
        alertSettings.id = GenericHelpers.getRandomId().toString();
      }
      const handler = {
        openFromClient: false,
        close: () => {
          resolve(true);
        },
        link: (linkKey: string) => {
          if (alertSettings.links) {
            const link = alertSettings.links[linkKey];
            if (link) {
              link.url && this.luigi?.navigation().navigate(link.url);
              if (link.dismissKey) {
                resolve(link.dismissKey);
                return true;
              }
            }
          }
          return false;
        }
      };
      this.luigi.getEngine()._connector?.renderAlert(alertSettings, handler);
    });
  };

  showConfirmationModal = (settings: ConfirmationModalSettings) => {
    return new Promise((resolve, reject) => {
      this.luigi.getEngine()._connector?.renderConfirmationModal(settings, {
        confirm() {
          resolve(true);
        },
        dismiss() {
          reject();
        }
      });
    });
  };

  openUserSettings = (settings: UserSettings) => {
    this.luigi.getEngine()._connector?.openUserSettings(settings);
  };

  closeUserSettings = () => {
    this.luigi.getEngine()._connector?.closeUserSettings();
  };

  addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();

  removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();
}
