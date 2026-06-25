import { type AlertSettings, type ConfirmationModalSettings } from '../modules/ux-module';
import { DirtyStatusService } from '../services/dirty-status.service';
import { serviceRegistry } from '../services/service-registry';
import type { UserSettingsDialogSettings } from '../types/navigation';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { UserSettingsHelper } from '../utilities/helpers/usersetting-dialog-helpers';
import { TOP_NAV_DEFAULTS } from '../utilities/luigi-config-defaults';
import { get } from '../utilities/store';
import type { Luigi } from './luigi';

export class UX {
  luigi: Luigi;
  dirtyStatusService = serviceRegistry.get(DirtyStatusService);
  private appLoadingIndicatorSelector = '[luigi-app-loading-indicator]';

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Shows an alert.
   * @param {Object} settings - the settings for the alert
   * @param {string} settings.text - the content of the alert. To add a link to the content, you have to set up the link in the `links` object. The key(s) in the `links` object must be used in the text to reference the links, wrapped in curly brackets with no spaces. If you do not specify any text, the alert is not displayed
   * @param {('info'|'success'|'warning'|'error')} settings.type - sets the type of alert
   * @param {Object} settings.links - provides links data
   * @param {Object} settings.links.LINK_KEY - object containing the data for a particular link. To properly render the link in the alert message refer to the description of the **settings.text** parameter
   * @param {string} settings.links.LINK_KEY.text - text which replaces the link identifier in the alert content
   * @param {string} settings.links.LINK_KEY.url - URL to navigate when you click the link. Currently, only internal links are supported in the form of relative or absolute paths
   * @param {string} settings.links.LINK_KEY.dismissKey - dismissKey which represents the key of the link.
   * @param {number} settings.closeAfter - (optional) time in milliseconds that tells Luigi when to close the Alert automatically. If not provided, the Alert will stay on until closed manually. It has to be greater than `100`
   * @returns {promise} which is resolved when the alert is dismissed
   * @example
   * const settings = {
   *  text: "Ut enim ad minim veniam, {goToHome} quis nostrud exercitation ullamco {relativePath}. Duis aute irure dolor {goToOtherProject} or {neverShowItAgain}",
   *  type: 'info',
   *  links: {
   *    goToHome: { text: 'homepage', url: '/overview' },
   *    goToOtherProject: { text: 'other project', url: '/projects/pr2' },
   *    relativePath: { text: 'relative hide side nav', url: 'hideSideNav' },
   *    neverShowItAgain: { text: 'Never show it again', dismissKey: 'neverShowItAgain' }
   *  },
   *  closeAfter: 3000
   * }
   * Luigi
   *  .ux()
   *  .showAlert(settings)
   *  .then(() => {
   *     // Logic to execute when the alert is dismissed
   *  });
   */
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

  /**
   * Shows a confirmation modal.
   * @param {Object} settings - the settings of the confirmation modal. If you do not provide any value for any of the fields, a default value is used
   * @param {('confirmation'|'success'|'warning'|'error'|'information')} settings.type - the content of the modal type. (Optional)
   * @param {string} [settings.header="Confirmation"] - the content of the modal header
   * @param {string} [settings.body="Are you sure you want to do this?"] - the content of the modal body. It supports HTML formatting elements such as `<br>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<mark>`, `<small>`, `<del>`, `<ins>`, `<sub>`, `<sup>`.
   * @param {string|false} [settings.buttonConfirm="Yes"] - the label for the modal confirmation button. If set to `false`, the button will not be shown.
   * @param {string} [settings.buttonDismiss="No"] - the label for the modal dismiss button
   * @returns {promise} which is resolved when accepting the confirmation modal and rejected when dismissing it
   * @example
   * const settings = {
   *  header: "Confirmation",
   *  body: "Are you sure you want to do this?",
   *  buttonConfirm: "Yes",
   *  buttonDismiss: "No"
   * }
   * Luigi
   *  .ux()
   *  .showConfirmationModal(settings)
   *  .then(() => {
   *     // Logic to execute when the confirmation modal is dismissed
   *  });
   */
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

  /**
   * Open user settings dialog
   */
  openUserSettings = async () => {
    const userSettings = this.luigi.getConfigValue('userSettings');
    if (!userSettings) {
      return;
    }
    const storedSettings = this.luigi.getConfigValue('settings');

    const previousUserSettings = await this.luigi.readUserSettings();
    const userSettingData = UserSettingsHelper.processUserSettingGroups(userSettings, storedSettings);

    const userSettingsDialog = userSettings.userSettingsDialog || {};
    const dialogHeader = userSettingsDialog.dialogHeader || TOP_NAV_DEFAULTS.userSettingsDialog.dialogHeader;
    const saveBtn = userSettingsDialog.saveBtn || TOP_NAV_DEFAULTS.userSettingsDialog.saveBtn;
    const dismissBtn = userSettingsDialog.dismissBtn || TOP_NAV_DEFAULTS.userSettingsDialog.dismissBtn;
    const userSettingsDialogSettings: UserSettingsDialogSettings = {
      dialogHeader: this.luigi.i18n().getTranslation(dialogHeader),
      saveBtn: this.luigi.i18n().getTranslation(saveBtn),
      dismissBtn: this.luigi.i18n().getTranslation(dismissBtn)
    };
    this.luigi
      .getEngine()
      ._ui?.openUserSettings(userSettingsDialogSettings, userSettingData, previousUserSettings, this.luigi);
  };

  /**
   * Close user settings dialog
   */
  closeUserSettings = () => {
    this.luigi.getEngine()._connector?.closeUserSettings();
  };

  /**
   * Set the document title
   * @param {string} documentTitle
   * @example Luigi.ux().setDocumentTitle('Luigi');
   */
  setDocumentTitle = (documentTitle: string) => {
    this.luigi.getEngine()._ux?.documentTitle?.set(documentTitle);
    this.luigi.getEngine()._connector?.setDocumentTitle(documentTitle);
  };

  /**
   * Get the document title
   * @returns {string} a string, which is displayed in the tab.
   * @example Luigi.ux().getDocumentTitle();
   */
  getDocumentTitle = (): string => {
    return get(this.luigi.getEngine()._ux?.documentTitle) || window.document.title || '';
  };

  /**
   * Hides the app loading indicator.
   */
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

  /**
   * Sends message to show loading indicator
   * @ignore
   */
  showLoadingIndicator = (containerWrapper: HTMLElement) =>
    this.luigi.getEngine()._connector?.showLoadingIndicator(containerWrapper);

  /**
   * Sends message to hide loading indicator
   * @ignore
   */
  hideLoadingIndicator = (containerWrapper: HTMLElement) =>
    this.luigi.getEngine()._connector?.hideLoadingIndicator(containerWrapper);

  /**
   * Adds backdrop. Function only used internally
   * @private
   */
  addBackdrop = () => this.luigi.getEngine()._connector?.addBackdrop();

  /**
   * Removes backdrop. Function only used internally
   * @private
   */
  removeBackdrop = () => this.luigi.getEngine()._connector?.removeBackdrop();

  /**
   * Returns the dirty status, which is set by the Client via [setDirtyStatus](luigi-client-api.md#setdirtystatus). By default, the dirty status is `false`.
   * @returns {boolean}
   */
  getDirtyStatus = (): boolean => this.dirtyStatusService.readDirtyStatus();
}
