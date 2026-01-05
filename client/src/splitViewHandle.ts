import { SplitViewEvents } from '../luigi-client';
import { LuigiClientBase } from './baseClass';
import { helpers } from './helpers';

/**
 * @summary Split view allows to open a micro frontend in a split screen in the lower part of the content area. Open it by calling `const splitViewHandle = LuigiClient.linkManager().openAsSplitView`. At a given time, you can open only one split view. It closes automatically when you navigate to a different route. When you call `handle.collapse()`, the split view gets destroyed. It recreates when you use `handle.expand()`. `openAsSplitView` returns an instance of the split view handle. The functions, actions, and event handlers listed below allow you to control and manage the split view.
 * @augments LuigiClientBase
 * @name splitView
 * @since 0.6.0
 * @class
 */
export class splitViewHandle extends LuigiClientBase {
  private splitView: Record<string, any>;
  private validSplitViewEvents: SplitViewEvents[] = ['close', 'collapse', 'expand', 'resize'];

  /**
   * @private
   */
  constructor(settings: Record<string, any>) {
    super();

    this.splitView = {
      collapsed: false,
      exists: true,
      size: 40
    };

    Object.assign(this.splitView, settings);

    const removeSplitViewListeners = (): void => {
      this.splitView['listeners'].forEach((id: string) => helpers.removeEventListener(id));
    };

    this.splitView['listeners'] = [
      helpers.addEventListener(`luigi.navigation.splitview.internal`, (event: any): void =>
        Object.assign(this.splitView, event.data.data)
      )
    ];
    this.on('resize', (newSize: any) => (this.splitView['size'] = newSize));
    this.on('close', removeSplitViewListeners);
  }

  /**
   * Collapses the split view
   * @memberof splitViewHandle
   * @since 0.6.0
   * @example
   * splitViewHandle.collapse();
   */
  collapse(): void {
    this.sendSplitViewEvent('collapse');
  }

  /**
   * Expands the split view
   * @memberof splitViewHandle
   * @since 0.6.0
   * @example
   * splitViewHandle.expand();
   */

  expand(): void {
    this.sendSplitViewEvent('expand');
  }

  /**
   * Closes and destroys the split view
   * @memberof splitViewHandle
   * @since 0.6.0
   * @example
   * splitViewHandle.close();
   */
  close(): void {
    this.sendSplitViewEvent('close');
  }

  /**
   * Sets the height of the split view
   * @memberof splitView
   * @param {number} value - lower height in percent
   * @since 0.6.0
   * @example
   * splitViewHandle.setSize(60);
   */
  setSize(value: number): void {
    this.sendSplitViewEvent('resize', value);
  }

  /**
   * Registers a listener for split view events
   * @memberof splitView
   * @param {('expand'|'collapse'|'resize'|'close')} name - event name
   * @param {function} callback - gets called when this event gets triggered by Luigi
   * @returns {boolean|string} listener id
   * @since 0.6.0
   * @example
   * const listenerId = splitViewHandle.on('expand', () => {});
   * const listenerId = splitViewHandle.on('collapse', () => {});
   * const listenerId = splitViewHandle.on('resize', () => {});
   * const listenerId = splitViewHandle.on('close', () => {});
   **/
  on(name: SplitViewEvents, callback: (param: number | undefined) => void): boolean | string {
    if (!this.validSplitViewEvents.includes(name)) {
      console.warn(name + ' is not a valid split view event');
      return false;
    }

    const id: string = helpers.addEventListener(`luigi.navigation.splitview.${name}.ok`, (event: any) => {
      const filterParam: number | undefined = typeof event.data.data == 'number' ? event.data.data : undefined;

      callback(filterParam);
    });

    this.splitView['listeners'].push(id);

    return id;
  }

  /**
   * Unregisters a split view listener
   * @memberof splitView
   * @param {string} id - listener id
   * @returns {boolean}
   * @since 0.6.0
   * @example
   * splitViewHandle.removeEventListener(listenerId);
   */
  removeEventListener(id: string): boolean {
    return helpers.removeEventListener(id);
  }

  /**
   * Gets the split view status
   * @memberof splitViewHandle
   * @returns {boolean} true if a split view is loaded
   * @since 0.6.0
   * @example
   * splitViewHandle.exists();
   */
  exists(): boolean {
    return this.splitView['exists'];
  }

  /**
   * Reads the size of the split view
   * @memberof splitViewHandle
   * @returns {number} height in percent
   * @since 0.6.0
   * @example
   * splitViewHandle.getSize();
   */
  getSize(): number {
    return this.splitView['size'];
  }

  /**
   * Reads the collapse status
   * @memberof splitViewHandle
   * @returns {boolean} true if the split view is currently collapsed
   * @since 0.6.0
   * @example
   * splitViewHandle.isCollapsed();
   */
  isCollapsed(): boolean {
    return this.splitView['collapsed'];
  }

  /**
   * Reads the expand status
   * @memberof splitViewHandle
   * @returns {boolean} true if the split view is currently expanded
   * @since 0.6.0
   * @example
   * splitViewHandle.isExpanded();
   */
  isExpanded(): boolean {
    return !this.splitView['collapsed'];
  }

  private sendSplitViewEvent(action: string, data?: any): void {
    helpers.sendPostMessageToLuigiCore({
      data: data || null,
      msg: `luigi.navigation.splitview.${action}`
    });
  }
}
