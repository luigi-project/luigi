import { get, writable } from '../../src/utilities/store';

describe('Luigi store', () => {
  it('Check helper functions', () => {
    const value = { some: 'object' };
    const store = writable(value);
    expect(get(store)).toEqual(value);
  });

  it('set', () => {
    const value = { some: 'object' };
    const store = writable('initialValue');
    store.set(value);
    expect(get(store)).toEqual(value);
  });

  it('update', () => {
    const value = { some: 'object' };
    const store = writable(value);
    store.update((val) => {
      val.some = 'updated value';
      return val;
    });
    expect(get(store)).toEqual({ some: 'updated value' });
  });

  it('subscribe and unsubscribe', () => {
    const value = { some: 'object' };
    const store = writable(value);

    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    const unsub1 = store.subscribe(subscriber1);
    const unsub2 = store.subscribe(subscriber2);

    expect(subscriber1).toHaveBeenCalledWith(value);
    expect(subscriber2).toHaveBeenCalledWith(value);

    unsub2();

    subscriber1.mockReset();
    subscriber2.mockReset();

    store.set('updated');

    expect(subscriber1).toHaveBeenCalledWith('updated');
    expect(subscriber2).not.toHaveBeenCalled();

    unsub1();

    subscriber1.mockReset();
    subscriber2.mockReset();

    store.set('updated2');

    expect(subscriber1).not.toHaveBeenCalled();
    expect(subscriber2).not.toHaveBeenCalled();
  });
});
