import type { Luigi } from '../core-api/luigi';

export interface ModalPromiseObject {
  closePromise?: Promise<void>;
  resolveFn?: () => void;
  onCloseRequestHandler?: () => void;
  onInternalClose?: Function;
}

export class ModalService {
  modalStack: ModalPromiseObject[] = [];
  constructor(private luigi: Luigi) {}

  /**
   * Closes the topmost modal in the stack.
   */
  async closeModals(): Promise<void> {
    if (this.modalStack.length > 0) {
      this.modalStack.forEach(async (modalPromiseObj: ModalPromiseObject) => {
        const { closePromise, onInternalClose } = modalPromiseObj;

        try {
          if (typeof onInternalClose === 'function') {
            onInternalClose();
          }
        } catch (e) {
          console.warn('onInternalClose threw an error', e);
        }

        if (closePromise) {
          await closePromise;
        }
      });
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
    this.modalStack.push(modalObj);
  }
}
