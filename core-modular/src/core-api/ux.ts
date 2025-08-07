import { get } from 'svelte/store';
import { DirtyStatusHelpers } from '../utilities/helpers/dirty-status-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { UserSettingsHelper } from '../utilities/helpers/usersetting-dialog-helpers';
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

  processUserSettingGroups = (): any[] => {
    const userSettings = this.luigi.getConfigValue('userSettings');
    const storedSettings = this.luigi.getConfigValue('settings');

    return UserSettingsHelper.processUserSettingGroups(userSettings, storedSettings);
  };

  openUserSettings = (settings: UserSettings) => {
    this.luigi.getEngine()._connector?.openUserSettings(settings);
  };

  closeUserSettings = () => {
    this.luigi.getEngine()._connector?.closeUserSettings();
  };

  setDocumentTitle = (documentTitle: string) => {
    this.luigi.getEngine()._ux?.documentTitle?.set(documentTitle);
    this.luigi.getEngine()._connector?.setDocumentTitle(documentTitle);
  };

  getDocumentTitle = (): string => {
    return get(this.luigi.getEngine()._ux?.documentTitle) || window.document.title || '';
  };

  showLoadingIndicator = () => this.luigi.getEngine()._connector?.showLoadingIndicator();

  hideLoadingIndicator = () => this.luigi.getEngine()._connector?.hideLoadingIndicator();

  addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();

  removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();

  updateDirtyStatus = (isDirty: boolean, source: any) => DirtyStatusHelpers.updateDirtyStatus(isDirty, source);

  readDirtyStatus = (): boolean => DirtyStatusHelpers.readDirtyStatus();

  setDirtyStatus = (isDirty: boolean, source: any) =>
    this.luigi.getEngine()._connector?.setDirtyStatus(isDirty, source);

  getDirtyStatus = () => this.luigi.getEngine()._connector?.getDirtyStatus();
}
