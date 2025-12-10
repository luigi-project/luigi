import type { Luigi } from '../core-api/luigi';
import type { ModalSettings } from './navigation.service';

export interface ModalPromiseObject {
  closePromise?: Promise<void>;
  resolveFn?: () => void;
  onCloseRequestHandler?: () => void;
  onInternalClose?: Function;
  modalsettings?: ModalSettings;
}

export class ModalService {
  _modalStack: ModalPromiseObject[] = [];
  modalSettings: ModalSettings = {};
  
  constructor(private luigi: Luigi) { }

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
          this.clearModalStack();
        }
      } catch (e) {
        console.warn('onInternalClose threw an error', e);
      }
      //Clarify if this is needed
      // if (closePromise) {
      //   try {
      //     //called when browser back
      //     console.log('browser back');
      //     await closePromise;
      //     this.removeModalFromStack();
      //   } catch (e) {
      //     console.warn('closePromise rejected', e);
      //   }
      // }
    }
  }


  /**
   * Adds a modal promise object to the internal modal stack.
   *
   * This method is used to track active modals in a last-in-first-out (LIFO) stack,
   * enabling the service to manage and resolve/dismiss modals in the correct order.
   *
   * @param modalObj - The modal promise object to register on the stack.
   * @returns void
   */
  registerModal(modalObj: ModalPromiseObject): void {
    if (!modalObj) {
      return;
    }
    this._modalStack.push(modalObj);
  }

  getModalSettings(): ModalSettings | {} {
    if (this._modalStack.length > 0) {
      return this._modalStack[this._modalStack.length - 1].modalsettings || {};
    }
    return {};
  }

  getModalStackLength(): number {
    return this._modalStack.length;
  }

  updateModalSettings(settings: ModalSettings): void {
    if (this._modalStack.length > 0) {
      const topModal = this._modalStack[this._modalStack.length - 1];
      topModal.modalsettings = { ...topModal.modalsettings, ...settings };
    }
  }

  clearModalStack(): void {
    this._modalStack = [];
  }

  removeModalFromStack(): void {
    this._modalStack.pop();
  }
}
