import { LuigiClientBase } from './baseClass';
import { helpers } from './helpers';

/**
 * Split view 
  Allows to open a micro frontend in a split screen in the lower part of the content area. Open it by calling `const splitViewHandle = LuigiClient.linkManager().openAsSplitView`. 
  At a given time, you can open only one split view. It closes automatically when you navigate to a different route.
  When you call `handle.collapse()`, the split view gets destroyed. It recreates when you use `handle.expand()`.
  `openAsSplitView` returns an instance of the split view handle. The functions, actions, and event handlers listed below allow you to control and manage the split view.
  * @augments LuigiClientBase
  * @name splitView
  * @since 0.6.0
  * @class
  */
export class splitViewHandle extends LuigiClientBase {
  /**
   * @private
   */
  constructor(settings) {
    super();

    this.validSplitViewEvents = ['expand', 'collapse', 'resize', 'close'];

    this.splitView = {
      exists: true,
      size: 40,
      collapsed: false
    };

    Object.assign(this.splitView, settings);

    const removeSplitViewListeners = () => {
      this.splitView.listeners.forEach(id => helpers.removeEventListener(id));
    };

    this.splitView.listeners = [
      helpers.addEventListener(`luigi.navigation.splitview.internal`, e => {
        Object.assign(this.splitView, e.data.data);
      })
    ];
    this.on('resize', newSize => {
      this.splitView.size = newSize;
    });
    this.on('close', removeSplitViewListeners);
  }
  /*
   * @private
   */
  sendSplitViewEvent(action, data) {
    helpers.sendPostMessageToLuigiCore({
      msg: `luigi.navigation.splitview.${action}`,
      data
    });
  }

  /**
   * Collapses the split view
   * @memberof splitView
   * @since 0.6.0
   * @example
   * splitViewHandle.collapse();
   */
  collapse() {
    this.sendSplitViewEvent('collapse');
  }
  /**
   * Expands the split view
   * @memberof splitView
   * @since 0.6.0
   * @example
   * splitViewHandle.expand();
   */
  expand() {
    this.sendSplitViewEvent('expand');
  }

  /**
   * Closes and destroys the split view
   * @memberof splitView
   * @since 0.6.0
   * @example
   * splitViewHandle.close();
   */
  close() {
    this.sendSplitViewEvent('close');
  }
  /**
   * Sets the height of the split view
   * @memberof splitView
   * @param {number} value lower height in percent
   * @since 0.6.0
   * @example
   * splitViewHandle.setSize(60);
   */
  setSize(value) {
    this.sendSplitViewEvent('resize', value);
  }
  /**
   * Registers a listener for split view events
   * @memberof splitView
   * @param {('expand'|'collapse'|'resize'|'close')} name event name
   * @param {function} callback gets called when this event gets triggered by Luigi
   * @returns {string} listener id
   * @since 0.6.0
   * @example
   * const listenerId = splitViewHandle.on('expand', () => {});
   * const listenerId = splitViewHandle.on('collapse', () => {});
   * const listenerId = splitViewHandle.on('resize', () => {});
   * const listenerId = splitViewHandle.on('close', () => {});
   **/
  on(name, callback) {
    if (!this.validSplitViewEvents.includes(name)) {
      console.warn(name + ' is not a valid split view event');
      return false;
    }
    const id = helpers.addEventListener(`luigi.navigation.splitview.${name}.ok`, e => {
      const filterParam = typeof e.data.data == 'number' ? e.data.data : undefined;
      callback(filterParam);
    });
    this.splitView.listeners.push(id);
    return id;
  }
  /**
   * Unregisters a split view listener
   * @memberof splitView
   * @param {string} id listener id
   * @since 0.6.0
   * @example
   * splitViewHandle.removeEventListener(listenerId);
   */
  removeEventListener(id) {
    return helpers.removeEventListener(id);
  }

  /**
   * Gets the split view status
   * @memberof splitView
   * @returns {boolean} true if a split view is loaded
   * @since 0.6.0
   * @example
   * splitViewHandle.exists();
   */
  exists() {
    return this.splitView.exists;
  }
  /**
   * Reads the size of the split view
   * @memberof splitView
   * @returns {number} height in percent
   * @since 0.6.0
   * @example
   * splitViewHandle.getSize();
   */
  getSize() {
    return this.splitView.size;
  }
  /**
   * Reads the collapse status
   * @memberof splitView
   * @returns {boolean} true if the split view is currently collapsed
   * @since 0.6.0
   * @example
   * splitViewHandle.isCollapsed();
   */
  isCollapsed() {
    return this.splitView.collapsed;
  }
  /**
   * Reads the expand status
   * @memberof splitView
   * @returns {boolean} true if the split view is currently expanded
   * @since 0.6.0
   * @example
   * splitViewHandle.isExpanded();
   */
  isExpanded() {
    return !this.splitView.collapsed;
  }
}
