import { get } from 'svelte/store';
import { type AlertSettings, type ConfirmationModalSettings, type UserSettings } from '../modules/ux-module';
import { DirtyStatusService } from '../services/dirty-status.service';
import { serviceRegistry } from '../services/service-registry';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { UserSettingsHelper } from '../utilities/helpers/usersetting-dialog-helpers';
import type { Luigi } from './luigi';

export class UX {
  luigi: Luigi;
  dirtyStatusService = serviceRegistry.get(DirtyStatusService);
  private appLoadingIndicatorSelector = '[luigi-app-loading-indicator]';

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
    if (settings) {
      settings = {
        ...settings,
        ...{
          header: this.luigi.i18n().getTranslation(settings.header || 'luigi.confirmationModal.header'),
          body: this.luigi.i18n().getTranslation(settings.body || 'luigi.confirmationModal.body'),
          buttonDismiss: this.luigi.i18n().getTranslation(settings.buttonDismiss || 'luigi.button.dismiss'),
          buttonConfirm: this.luigi.i18n().getTranslation(settings.buttonConfirm || 'luigi.button.confirm')
        }
      };
    }

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

  hideAppLoadingIndicator = () => {
    const appLoadingIndicator = document.querySelector(this.appLoadingIndicatorSelector);

    if (!appLoadingIndicator) {
      return;
    }

    appLoadingIndicator.classList.add('hidden');

    setTimeout(() => {
      appLoadingIndicator.parentNode?.removeChild(appLoadingIndicator);
    }, 500);
  };

  showLoadingIndicator = (containerWrapper: HTMLElement) =>
    this.luigi.getEngine()._connector?.showLoadingIndicator(containerWrapper);

  hideLoadingIndicator = (containerWrapper: HTMLElement) =>
    this.luigi.getEngine()._connector?.hideLoadingIndicator(containerWrapper);

  addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();

  removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();

  getDirtyStatus = (): boolean => this.dirtyStatusService.readDirtyStatus();
}
