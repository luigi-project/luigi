import type { Luigi } from '../core-api/luigi';
import type { ModalSettings } from '../types/navigation';

export interface ModalPromiseObject {
  closePromise?: Promise<void>;
  resolveFn?: () => void;
  onCloseRequestHandler?: () => void;
  onInternalClose?: () => void;
  modalsettings?: ModalSettings;
}

export class ModalService {
  _modalStack: ModalPromiseObject[] = [];
  modalSettings: ModalSettings = {};

  constructor(private luigi: Luigi) {}

  /**
   * Closes the topmost modal in the stack.
   */
  async closeModals(): Promise<void> {
    if (this._modalStack.length === 0) return;

    const toClose = [...this._modalStack];
    for (const { onInternalClose } of toClose) {
      try {
        if (typeof onInternalClose === 'function') {
          onInternalClose();
        }
      } catch (e) {
        console.warn('onInternalClose threw an error', e);
      }
    }
    this.clearModalStack();
  }

  /**
   * Adds a modal promise object to the internal modal stack.
   *
   * This method is used to track active modals in a last-in-first-out (LIFO) stack,
   * enabling the service to manage and resolve/dismiss modals in the correct order.
   *
   * @param modalObj - The modal promise object to register on the stack.
   * @returns {void}
   */
  registerModal(modalObj: ModalPromiseObject): void {
    if (!modalObj) {
      return;
    }
    this._modalStack.push(modalObj);
  }

  /**
   * Gets the settings of the first modal in the stack.
   * @returns The settings of the first modal in the stack, or an empty object if the stack is empty.
   */
  getModalSettings(): ModalSettings | {} {
    if (this._modalStack.length > 0) {
      return this._modalStack[0].modalsettings || {};
    }
    return {};
  }

  /**
   * Gets the current number of modals in the stack.
   * @returns number The current number of modals in the stack.
   */
  getModalStackLength(): number {
    return this._modalStack.length;
  }

  /**
   * Updates the settings of the first modal in the stack.
   * @param settings modal settings to update the first modal with
   */
  updateFirstModalSettings(settings: ModalSettings): void {
    if (this._modalStack.length > 0) {
      const topModal = this._modalStack[0];
      topModal.modalsettings = { ...topModal.modalsettings, ...settings };
    }
  }

  /**
   * Clears the entire modal stack.
   */
  clearModalStack(): void {
    this._modalStack = [];
  }

  /**
   * Removes modal from the stack by index.
   */
  removeModalFromStackByIndex(index: number): void {
    if (this._modalStack[index]) {
      this._modalStack.splice(index, 1);
    }
  }

  /**
   * Removes the last modal from the stack.
   */
  removeLastModalFromStack(): void {
    this._modalStack.pop();
  }
}
