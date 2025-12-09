import type { Luigi } from "../core-api/luigi";

export class ModalService {
    modalStack: any[] = [];
    constructor(private luigi: Luigi) { }

    /**
     * Closes the topmost modal in the stack.
     */
    async closeModal(): Promise<void> {
        if (this.modalStack.length > 0) {
            const modalPromiseObj = this.modalStack.pop();
            const { closePromise, onInternalClose } = modalPromiseObj;

            try {
                onInternalClose();
            } catch (e) {
                console.warn('onInternalClose threw an error', e);
            }

            await closePromise;
        }
    }
}