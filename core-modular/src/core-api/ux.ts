import { DirtyStatusHelpers } from '../utilities/helpers/dirty-status-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { type AlertSettings, type ProcessedAlertSettings, type ConfirmationModalSettings } from '../modules/ux-module';
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

  addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();

  removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();

  updateDirtyStatus = (isDirty: boolean, source: any) => DirtyStatusHelpers.updateDirtyStatus(isDirty, source);

  readDirtyStatus = (): boolean => DirtyStatusHelpers.readDirtyStatus();

  setDirtyStatus = (isDirty: boolean, source: any) =>
    this.luigi.getEngine()._connector?.setDirtyStatus(isDirty, source);

  getDirtyStatus = () => this.luigi.getEngine()._connector?.getDirtyStatus();
}
