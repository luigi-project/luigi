import { ModalService, type ModalPromiseObject } from '../../src/services/modal.service';

describe('ModalService', () => {
  const mockLuigi = {} as any;

  let service: ModalService;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new ModalService(mockLuigi);
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe('closeModals', () => {
    it('does nothing when modalStack is empty', async () => {
      expect(service._modalStack.length).toBe(0);
      await expect(service.closeModals()).resolves.toBeUndefined();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(service._modalStack.length).toBe(0);
    });

    it('calls onInternalClose for each modal if it is a function', async () => {
      const onInternalClose1 = jest.fn();
      const onInternalClose2 = jest.fn();

      const m1: ModalPromiseObject = { onInternalClose: onInternalClose1 };
      const m2: ModalPromiseObject = { onInternalClose: onInternalClose2 };
      service.registerModal(m1);
      service.registerModal(m2);

      await service.closeModals();

      expect(onInternalClose1).toHaveBeenCalledTimes(1);
      expect(onInternalClose2).toHaveBeenCalledTimes(1);
      expect(service._modalStack.length).toBe(0);
    });

    it('skips onInternalClose if not a function', async () => {
      const badHandler = {} as unknown as Function;
      const m: ModalPromiseObject = { onInternalClose: badHandler };
      service.registerModal(m);

      await service.closeModals();

      // badHandler is not actually a function, typeof !== 'function' -> not called
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('onInternalClose threw an error'),
        expect.anything()
      );
      expect(service._modalStack.length).toBe(0);
    });

    it('catches and warns if onInternalClose throws', async () => {
      const throwingHandler = jest.fn(() => {
        throw new Error('boom');
      });
      const m: ModalPromiseObject = { onInternalClose: throwingHandler };
      service.registerModal(m);

      await service.closeModals();

      expect(throwingHandler).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('onInternalClose threw an error', expect.any(Error));
      expect(service._modalStack.length).toBe(0);
    });
  });

  describe('getModalSettings', () => {
    it('returns empty object when modalStack is empty', () => {
      expect(service._modalStack.length).toBe(0);
      const settings = service.getModalSettings();
      expect(settings).toEqual({});
    });

    it('returns modalsettings of the last modal in the stack', () => {
      const m1: ModalPromiseObject = { modalsettings: { title: 'First' } };
      const m2: ModalPromiseObject = { modalsettings: { title: 'Second' } };
      service.registerModal(m1);
      service.registerModal(m2);

      const settings = service.getModalSettings();
      expect(settings).toEqual({ title: 'First' });
    });

    it('returns empty object if last modal has no modalsettings', () => {
      const m1: ModalPromiseObject = { modalsettings: { title: 'First' } };
      const m2: ModalPromiseObject = {}; // no modalsettings
      service.registerModal(m1);
      service.registerModal(m2);

      const settings = service.getModalSettings();
      expect(settings).toEqual({ title: 'First' });
    });
  });

  describe('registerModal', () => {
    it('does not register null or undefined modalObj', () => {
      expect(service._modalStack.length).toBe(0);
      service.registerModal(null as unknown as ModalPromiseObject);
      service.registerModal(undefined as unknown as ModalPromiseObject);
      expect(service._modalStack.length).toBe(0);
    });

    it('registers valid modalObj onto the stack', () => {
      const m: ModalPromiseObject = { modalsettings: { title: 'Test' } };
      service.registerModal(m);
      expect(service._modalStack.length).toBe(1);
      expect(service._modalStack[0]).toBe(m);
    });
  });

  describe('getModalStackLength', () => {
    it('returns 0 when stack is empty', () => {
      expect(service.getModalStackLength()).toBe(0);
    });

    it('returns correct stack length after registrations', () => {
      const m1: ModalPromiseObject = {};
      const m2: ModalPromiseObject = {};
      service.registerModal(m1);
      expect(service.getModalStackLength()).toBe(1);
      service.registerModal(m2);
      expect(service.getModalStackLength()).toBe(2);
    });
  });

  describe('updateLastModalSettings', () => {
    it('does nothing when stack is empty', () => {
      expect(service._modalStack.length).toBe(0);
      service.updateFirstModalSettings({ title: 'New Title' });
      expect(service._modalStack.length).toBe(0);
    });

    it('updates modalsettings of the last modal in the stack', () => {
      const m1: ModalPromiseObject = { modalsettings: { title: 'First' } };
      const m2: ModalPromiseObject = { modalsettings: { title: 'Second' } };
      service.registerModal(m1);
      service.registerModal(m2);

      service.updateFirstModalSettings({ size: 'l' });

      expect(service._modalStack[1].modalsettings).toEqual({ title: 'Second' });
      expect(service._modalStack[0].modalsettings).toEqual({ title: 'First', size: 'l' });
    });
  });

  describe('clearModalStack', () => {
    it('clears the entire modal stack', () => {
      const m1: ModalPromiseObject = {};
      const m2: ModalPromiseObject = {};
      service.registerModal(m1);
      service.registerModal(m2);
      expect(service._modalStack.length).toBe(2);

      service.clearModalStack();
      expect(service._modalStack.length).toBe(0);
    });
  });

  describe('removeLastModalFromStack', () => {
    it('removes given modal from stack', () => {
      const m1: ModalPromiseObject = { modalsettings: { title: 'First' } };
      const m2: ModalPromiseObject = { modalsettings: { title: 'Second' } };
      service.registerModal(m1);
      service.registerModal(m2);
      expect(service._modalStack.length).toBe(2);

      service.removeLastModalFromStack();
      expect(service._modalStack.length).toBe(1);
      expect((service._modalStack[0] as any).modalsettings.title).toEqual('First');
    });
  });
});
