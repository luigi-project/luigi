import { APP_LOADING_INDICATOR } from './../utilities/constants';
import { GenericHelpers } from '../utilities/helpers';
import { get, writable } from 'svelte/store';
import { linkManager } from './_internalLinkManager';
import { SemiCollapsibleNavigation } from './../navigation/services/semi-collapsed-navigation';

/**
 * @summary Functions to use Luigi Core UX features.
 * @namespace UX
 * @class
 */
class LuigiUX {
  constructor() {
    this.documentTitle = writable();
  }

  /**
   * Hides the app loading indicator.
   * @memberof UX
   * @since 0.6.4
   */
  hideAppLoadingIndicator() {
    const appLoadingIndicator = document.querySelector(APP_LOADING_INDICATOR.cssSelector);
    if (appLoadingIndicator) {
      appLoadingIndicator.classList.add('hidden');
      setTimeout(() => {
        appLoadingIndicator.parentNode && appLoadingIndicator.parentNode.removeChild(appLoadingIndicator);
      }, 500);
    }
  }

  /**
   * Shows an alert.
   * @memberof UX
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
   * @since 0.6.4
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

  showAlert(settings) {
    if (GenericHelpers.isFunction(Luigi.showAlert)) {
      return Luigi.showAlert(settings);
    } else {
      console.error(
        'Luigi.ux().showAlert() is only available inside your configuration, after the configuration was initialized with Luigi.setConfig().'
      );
    }
  }

  /**
   * Shows a confirmation modal.
   * @memberof UX
   * @param {Object} settings - the settings of the confirmation modal. If you do not provide any value for any of the fields, a default value is used
   * @param {('confirmation'|'success'|'warning'|'error'|'information')} settings.type - the content of the modal type. (Optional)
   * @param {string} [settings.header="Confirmation"] - the content of the modal header
   * @param {string} [settings.body="Are you sure you want to do this?"] - the content of the modal body. It supports HTML formatting elements such as `<br>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<mark>`, `<small>`, `<del>`, `<ins>`, `<sub>`, `<sup>`.
   * @param {string|false} [settings.buttonConfirm="Yes"] - the label for the modal confirmation button. If set to `false`, the button will not be shown.
   * @param {string} [settings.buttonDismiss="No"] - the label for the modal dismiss button
   * @returns {promise} which is resolved when accepting the confirmation modal and rejected when dismissing it
   * @since 0.6.4
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

  showConfirmationModal(settings) {
    if (GenericHelpers.isFunction(Luigi.showConfirmationModal)) {
      return Luigi.showConfirmationModal(settings);
    } else {
      console.error(
        'Luigi.ux().showConfirmationModal() is only available inside your configuration, after the configuration was initialized with Luigi.setConfig().'
      );
    }
  }

  /**
   * Set the document title
   * @memberof UX
   * @param {string} documentTitle
   * @since 1.4.0
   * @example Luigi.ux().setDocumentTitle('Luigi');
   */
  setDocumentTitle(documentTitle) {
    this.documentTitle.set(documentTitle);
    Luigi.configChanged('settings.header');
  }

  /**
   * Get the document title
   * @memberof UX
   * @since 1.4.0
   * @returns {string} a string, which is displayed in the tab.
   * @example Luigi.ux().getDocumentTitle();
   */
  getDocumentTitle() {
    return get(this.documentTitle);
  }

  /**
   * Set the collapsed state of the left side navigation
   * @memberof UX
   * @param {boolean} state
   * @since 1.5.0
   */
  collapseLeftSideNav(state) {
    /* istanbul ignore next */
    SemiCollapsibleNavigation.setCollapsed(state);
  }

  /**
   * Open user settings dialog
   * @memberof UX
   * @since 1.7.1
   */
  openUserSettings() /* istanbul ignore next */ {
    Luigi.openUserSettings();
  }

  /**
   * Close user settings dialog
   * @memberof UX
   * @since 1.7.1
   */
  closeUserSettings() /* istanbul ignore next */ {
    Luigi.closeUserSettings();
  }

  /**
   * Removes backdrop. Function only used internally
   * @memberof UX
   * @private
   */
  removeBackdrop() {
    new linkManager().sendPostMessageToLuigiCore({ msg: 'luigi.remove-backdrop' });
  }

  /**
   * Returns the dirty status, which is set by the Client via [setDirtyStatus](luigi-client-api.md#setdirtystatus). By default, the dirty status is `false`.
   * @memberof UX
   * @returns {boolean}
   * @since 2.1.0
   */
  getDirtyStatus() {
    return Luigi.getDirtyStatus();
  }

  /**
   * Returns the current active theme. Falls back to **defaultTheme** if one wasn't explicitly specified before.
   * @memberof UX
   * @returns {string} theme id
   * @since 2.14.0
   * @example
   * Luigi.ux().getCurrentTheme()
   */
  getCurrentTheme() {
    return Luigi.theming().getCurrentTheme();
  }

  /**
   * Sends message to show loading indicator
   * @memberof UX
   * @ignore
   */
  showLoadingIndicator() {
    window.postMessage({ msg: 'luigi.show-loading-indicator' });
  }

  /**
   * Sends message to hide loading indicator
   * @memberof UX
   * @ignore
   */
  hideLoadingIndicator() {
    window.postMessage({ msg: 'luigi.hide-loading-indicator' });
  }
}

export const ux = new LuigiUX();
