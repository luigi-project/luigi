import { ModalService, type ModalPromiseObject } from '../../src/services/modal.service';

describe('ModalService.closeModals', () => {
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

  test('does nothing when modalStack is empty', async () => {
    expect(service.modalStack.length).toBe(0);
    await expect(service.closeModals()).resolves.toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(service.modalStack.length).toBe(0);
  });

  test('calls onInternalClose for each modal if it is a function', async () => {
    const onInternalClose1 = jest.fn();
    const onInternalClose2 = jest.fn();

    const m1: ModalPromiseObject = { onInternalClose: onInternalClose1, closePromise: Promise.resolve() };
    const m2: ModalPromiseObject = { onInternalClose: onInternalClose2, closePromise: Promise.resolve() };
    service.registerModal(m1);
    service.registerModal(m2);

    await service.closeModals();

    expect(onInternalClose1).toHaveBeenCalledTimes(1);
    expect(onInternalClose2).toHaveBeenCalledTimes(1);
    expect(service.modalStack.length).toBe(0);
  });

  test('skips onInternalClose if not a function', async () => {
    const badHandler = {} as unknown as Function;
    const m: ModalPromiseObject = { onInternalClose: badHandler, closePromise: Promise.resolve() };
    service.registerModal(m);

    await service.closeModals();

    // badHandler is not actually a function, typeof !== 'function' -> not called
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('onInternalClose threw an error'),
      expect.anything()
    );
    expect(service.modalStack.length).toBe(0);
  });

  test('catches and warns if onInternalClose throws', async () => {
    const throwingHandler = jest.fn(() => {
      throw new Error('boom');
    });
    const m: ModalPromiseObject = { onInternalClose: throwingHandler, closePromise: Promise.resolve() };
    service.registerModal(m);

    await service.closeModals();

    expect(throwingHandler).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('onInternalClose threw an error', expect.any(Error));
    expect(service.modalStack.length).toBe(0);
  });

  test('awaits each closePromise and clears stack', async () => {
    const resolveOrder: string[] = [];

    const p1 = new Promise<void>((resolve) =>
      setTimeout(() => {
        resolveOrder.push('p1');
        resolve();
      }, 10)
    );
    const p2 = new Promise<void>((resolve) =>
      setTimeout(() => {
        resolveOrder.push('p2');
        resolve();
      }, 1)
    );

    const m1: ModalPromiseObject = { closePromise: p1 };
    const m2: ModalPromiseObject = { closePromise: p2 };

    service.registerModal(m1);
    service.registerModal(m2);

    await service.closeModals();

    // Both promises should have resolved by the time closeModals returns
    expect(resolveOrder.sort()).toEqual(['p1', 'p2'].sort());
    expect(service.modalStack.length).toBe(0);
    expect(warnSpy).not.toHaveBeenCalledWith('closePromise rejected', expect.anything());
  });

  test('logs warning when closePromise rejects but continues processing others', async () => {
    const rejected = Promise.reject(new Error('reject'));
    const resolved = Promise.resolve();

    const m1: ModalPromiseObject = { closePromise: rejected };
    const m2: ModalPromiseObject = { closePromise: resolved };
    service.registerModal(m1);
    service.registerModal(m2);

    await service.closeModals();

    expect(warnSpy).toHaveBeenCalledWith('closePromise rejected', expect.any(Error));
    expect(service.modalStack.length).toBe(0);
  });

  test('processes snapshot of stack and then clears it', async () => {
    // Ensure it operates over a copy, not mutating during iteration
    const pA = Promise.resolve();
    const pB = Promise.resolve();

    const mA: ModalPromiseObject = { closePromise: pA };
    const mB: ModalPromiseObject = { closePromise: pB };
    service.registerModal(mA);
    service.registerModal(mB);

    await service.closeModals();

    expect(service.modalStack).toEqual([]);
  });
});
