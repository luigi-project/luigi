/**
 * <!-- label-success: Web Component API only-->
 * Publish an event that can be listened to from the container host.
 *
 * Similar to {@link luigi-client-api.md#sendCustomMessage sendCustomMessage} but for WebComponent based microfrontends only.
 *
 * @param {CustomEvent} event Custom event to be published
 * @memberof lifecycleManager
 *
 * @example
 * // case 1: publish an event from a WC based microfrontend
 *
 * // wcComponent.js
 * // sending a message to parent host
 * this.LuigiClient.publishEvent(new CustomEvent('sendSomeMsg', { detail: 'My own message' }));
 *
 * // host.html
 * myContainer.addEventListener('custom-message', event => {
 *   console.log('My custom message from the microfrontend', event.detail.data);
 * }
 *
 * // case 2: publish an event from a compound microfrontend
 *
 * // secondChild.js
 * // Set the custom event name = 'sendInput' and
 * // send a message to its parent (main.html) and sibling (firstChild.js)
 * this.LuigiClient.publishEvent(new CustomEvent('sendInput', { detail: 'My own message' }));
 *
 * // main.html
 * myContainer.addEventListener('custom-message', event => {
 *   console.log('My custom message from microfrontend', event.detail.data);
 * }
 *
 * // Note: eventListeners.name must match CustomEvent name above
 * // eventListeners.source = input1 = id of secondChild.js, which is where the message being sent from
 * compoundConfig = {
 *  ...
 *  children: [
 *   {
 *     viewUrl: 'firstChild.js'
 *     ...
 *     eventListeners: [
 *           {
 *             source: 'input1',
 *             name: 'sendInput',
 *             action: 'update',
 *             dataConverter: data => {
 *               console.log(
 *                 'dataConverter(): Received Custom Message from "input1" MF ' + data
 *               );
 *               return 'new text: ' + data;
 *             }
 *           }
 *      ]
 *   },
 *   {
 *     viewUrl: 'secondChild.js',
 *     id: 'input1',
 *   }
 *
 */
export function publishEvent(event: CustomEvent): void {}
