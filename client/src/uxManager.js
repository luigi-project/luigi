import { LuigiClientBase } from './baseClass';
import { lifecycleManager } from './lifecycleManager';
import { helpers } from './helpers';

/**
 * @summary Use the UX Manager to manage the appearance features in Luigi.
 * @augments LuigiClientBase
 * @name uxManager
 * @class
 */
class UxManager extends LuigiClientBase {
  /** @private */
  constructor() {
    super();
    helpers.addEventListener('luigi.current-locale-changed', (e) => {
      if (e.data.currentLocale && lifecycleManager.currentContext?.internal) {
        lifecycleManager.currentContext.internal.currentLocale = e.data.currentLocale;
        lifecycleManager._notifyUpdate();
      }
    });
  }

  /**
   * Adds a backdrop with a loading indicator for the micro frontend frame. This overrides the {@link navigation-parameters-reference.md#node-parameters loadingIndicator.enabled} setting.
   * @memberof uxManager
   */
  showLoadingIndicator() {
    helpers.sendPostMessageToLuigiCore({ msg: 'luigi.show-loading-indicator' });
  }

  /**
   * Removes the loading indicator. Use it after calling {@link #showLoadingIndicator showLoadingIndicator()} or to hide the indicator when you use the {@link navigation-parameters-reference.md#node-parameters loadingIndicator.hideAutomatically: false} node configuration.
   * @memberof uxManager
   */
  hideLoadingIndicator() {
    helpers.sendPostMessageToLuigiCore({ msg: 'luigi.hide-loading-indicator' });
  }

  /**
   * Closes the currently opened micro frontend modal.
   * @memberof uxManager
   */
  closeCurrentModal() {
    helpers.sendPostMessageToLuigiCore({ msg: 'luigi.close-modal' });
  }

  /**
   * Adds a backdrop to block the top and side navigation. It is based on the Fundamental UI Modal, which you can use in your micro frontend to achieve the same behavior.
   * @memberof uxManager
   */
  addBackdrop() {
    helpers.sendPostMessageToLuigiCore({ msg: 'luigi.add-backdrop' });
  }

  /**
   * Removes the backdrop.
   * @memberof uxManager
   */
  removeBackdrop() {
    helpers.sendPostMessageToLuigiCore({ msg: 'luigi.remove-backdrop' });
  }

  /**
   * This method informs the main application that there are unsaved changes in the current view in the iframe. It can be used to prevent navigation away from the current view, for example with form fields which were edited but not submitted. However, this functionality is not restricted to forms. If you use `withoutSync()` together with `setDirtyStatus()`, this is a special case in which the dirty state logic needs to be handled by the micro frontend. For example, if the user navigates with an Angular router, which would trigger `withoutSync()`, Angular needs to take care about dirty state, prevent the navigation and ask for permission to navigate away, through `uxManager().showConfirmationModal(settings)`.
   * @param {boolean} isDirty - indicates if there are any unsaved changes on the current page or in the component
   * @memberof uxManager
   */
  setDirtyStatus(isDirty) {
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.set-page-dirty',
      dirty: isDirty
    });
  }

  /**
   * Shows a confirmation modal.
   * @memberof uxManager
   * @param {Object} settings - the settings of the confirmation modal. If you don't provide any value for any of the fields, a default value is used
   * @param {('confirmation'|'success'|'warning'|'error'|'information')} settings.type - the content of the modal type. (Optional)
   * @param {string} [settings.header="Confirmation"] - the content of the modal header
   * @param {string} [settings.body="Are you sure you want to do this?"] - the content of the modal body. It supports HTML formatting elements such as `<br>`, `<b>`, `<strong>`, `<i>`, `<em>`, `<mark>`, `<small>`, `<del>`, `<ins>`, `<sub>`, `<sup>`.
   * @param {string|false} [settings.buttonConfirm="Yes"] - the label for the modal confirmation button. If set to `false`, the button will not be shown.
   * @param {string} [settings.buttonDismiss="No"] - the label for the modal dismiss button
   * @returns {promise} which is resolved when accepting the confirmation modal and rejected when dismissing it
   * @example
   * import LuigiClient from '@luigi-project/client';
   * const settings = {
   *  type: "confirmation",
   *  header: "Confirmation",
   *  body: "Are you sure you want to do this?",
   *  buttonConfirm: "Yes",
   *  buttonDismiss: "No"
   * }
   * LuigiClient
   *  .uxManager()
   *  .showConfirmationModal(settings)
   *  .then(() => {
   *     // Logic to execute when the confirmation modal is dismissed
   *  });
   */
  showConfirmationModal(settings) {
    helpers.addEventListener('luigi.ux.confirmationModal.hide', (e, listenerId) => {
      this.hideConfirmationModal(e.data.data);
      helpers.removeEventListener(listenerId);
    });
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.ux.confirmationModal.show',
      data: { settings }
    });

    const confirmationModalPromise = {};
    confirmationModalPromise.promise = new Promise((resolve, reject) => {
      confirmationModalPromise.resolveFn = resolve;
      confirmationModalPromise.rejectFn = reject;
    });
    this.setPromise('confirmationModal', confirmationModalPromise);
    return confirmationModalPromise.promise;
  }

  /**
   * @private
   * @memberof uxManager
   * @param {Object} modal - confirmed boolean value if ok or cancel has been pressed
   */
  hideConfirmationModal(modal) {
    const promise = this.getPromise('confirmationModal');
    if (promise) {
      modal.confirmed ? promise.resolveFn() : promise.rejectFn();
      this.setPromise('confirmationModal', undefined);
    }
  }

  /**
   * Shows an alert.
   * @memberof uxManager
   * @param {Object} settings - the settings for the alert
   * @param {string} settings.text - the content of the alert. To add a link to the content, you have to set up the link in the `links` object. The key(s) in the `links` object must be used in the text to reference the links, wrapped in curly brackets with no spaces. If you don't specify any text, the alert is not displayed
   * @param {('info'|'success'|'warning'|'error')} settings.type - sets the type of alert
   * @param {Object} settings.links - provides links data
   * @param {Object} settings.links.LINK_KEY - object containing the data for a particular link. To properly render the link in the alert message refer to the description of the **settings.text** parameter
   * @param {string} settings.links.LINK_KEY.text - text which replaces the link identifier in the alert content
   * @param {string} settings.links.LINK_KEY.url - URL to navigate when you click the link. Currently, only internal links are supported in the form of relative or absolute paths
   * @param {string} settings.links.LINK_KEY.dismissKey - dismissKey which represents the key of the link
   * @param {number} settings.closeAfter - (optional) time in milliseconds that tells Luigi when to close the Alert automatically. If not provided, the Alert will stay on until closed manually. It has to be greater than `100`
   * @returns {promise} which is resolved when the alert is dismissed
   * @example
   * import LuigiClient from '@luigi-project/client';
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
   * LuigiClient
   *  .uxManager()
   *  .showAlert(settings)
   *  .then(() => {
   *     // Logic to execute when the alert is dismissed
   *  });
   */
  showAlert(settings) {
    //generate random ID
    settings.id = helpers.getRandomId();

    helpers.addEventListener('luigi.ux.alert.hide', (e, listenerId) => {
      if (e.data.id === settings.id) {
        this.hideAlert(e.data);
        helpers.removeEventListener(listenerId);
      }
    });

    if (settings?.closeAfter < 100) {
      console.warn(`Message with id='${settings.id}' has too small 'closeAfter' value. It needs to be at least 100ms.`);
      settings.closeAfter = undefined;
    }
    helpers.sendPostMessageToLuigiCore({
      msg: 'luigi.ux.alert.show',
      data: { settings }
    });

    const alertPromises = this.getPromise('alerts') || {};
    alertPromises[settings.id] = {};
    alertPromises[settings.id].promise = new Promise((resolve) => {
      alertPromises[settings.id].resolveFn = resolve;
    });
    this.setPromise('alerts', alertPromises);
    return alertPromises[settings.id].promise;
  }

  /**
   * @private
   * @memberof uxManager
   * @param {Object} alertObj
   * @param {string} alertObj.id - alert id
   * @param {string} alertObj.dismissKey - key of the link
   */
  hideAlert({ id, dismissKey }) {
    const alerts = this.getPromise('alerts');
    if (id && alerts[id]) {
      alerts[id].resolveFn(dismissKey ? dismissKey : id);
      delete alerts[id];
      this.setPromise('alerts', alerts);
    }
  }

  /**
   * Gets the current locale.
   * @returns {string} current locale
   * @memberof uxManager
   */
  getCurrentLocale() {
    return lifecycleManager.currentContext?.internal?.currentLocale;
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Sets current locale to the specified one.
   *
   * **NOTE:** this must be explicitly allowed on the navigation node level by setting `clientPermissions.changeCurrentLocale` to `true`. (See {@link navigation-parameters-reference.md Node parameters}.)
   *
   * @param {string} locale - locale to be set as the current locale
   * @memberof uxManager
   */
  setCurrentLocale(locale) {
    if (locale) {
      helpers.sendPostMessageToLuigiCore({
        msg: 'luigi.ux.set-current-locale',
        data: {
          currentLocale: locale
        }
      });
    }
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Checks if the current micro frontend is displayed inside a split view
   * @returns {boolean} indicating if it is loaded inside a split view
   * @memberof uxManager
   * @since 0.6.0
   */
  isSplitView() {
    return lifecycleManager.currentContext?.internal?.splitView;
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Checks if the current micro frontend is displayed inside a modal
   * @returns {boolean} indicating if it is loaded inside a modal
   * @memberof uxManager
   * @since 0.6.0
   */
  isModal() {
    return lifecycleManager.currentContext?.internal?.modal;
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Checks if the current micro frontend is displayed inside a drawer
   * @returns {boolean} indicating if it is loaded inside a drawer
   * @memberof uxManager
   * @since 1.26.0
   */
  isDrawer() {
    return lifecycleManager.currentContext?.internal?.drawer;
  }

  /**
   * Gets the current theme.
   * @returns {*} current themeObj
   * @memberof uxManager
   */
  getCurrentTheme() {
    return lifecycleManager.currentContext?.internal?.currentTheme;
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Gets the CSS variables from Luigi Core with their key and value.
   * @returns {Object} CSS variables with their key and value.
   * @memberof uxManager
   * @since 2.3.0
   * @example LuigiClient.uxManager().getCSSVariables();
   */
  getCSSVariables() {
    return lifecycleManager.currentContext?.internal?.cssVariables || {};
  }

  /**
   * <!-- label-success: Web App API only  -->
   * Adds the CSS variables from Luigi Core in a <style> tag to the document <head> section.
   * @memberof uxManager
   * @since 2.3.0
   * @example LuigiClient.uxManager().applyCSS();
   */
  applyCSS() {
    document.querySelectorAll('head style[luigi-injected]').forEach((luigiInjectedStyleTag) => {
      luigiInjectedStyleTag.remove();
    });
    const vars = lifecycleManager.currentContext?.internal?.cssVariables;
    if (vars) {
      let cssString = ':root {\n';
      Object.keys(vars).forEach((key) => {
        const val = vars[key];
        cssString += (key.startsWith('--') ? '' : '--') + key + ':' + val + ';\n';
      });
      cssString += '}';
      const themeStyle = document.createElement('style');
      themeStyle.setAttribute('luigi-injected', true);
      themeStyle.innerHTML = cssString;
      document.head.appendChild(themeStyle);
    }
  }
}
export const uxManager = new UxManager();
