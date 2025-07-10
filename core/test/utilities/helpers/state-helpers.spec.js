import { assert } from 'chai';
import { StateHelpers } from '../../../src/utilities/helpers';

describe('State-helpers', () => {
  describe('expand scope', () => {
    it('expand scope with no scope', () => {
      const expanded = StateHelpers.expandScope([]);
      assert.deepEqual(expanded, []);
    });

    it('expand scope with simple scopes', () => {
      const expanded = StateHelpers.expandScope(['a', 'b']);
      assert.deepEqual(expanded, ['a', 'b']);
    });

    it('expand scope with distinct scopes', () => {
      const expanded = StateHelpers.expandScope(['a.x', 'b.y', 'z']);
      assert.deepEqual(expanded, ['a', 'a.x', 'b', 'b.y', 'z']);
    });

    it('expand scope with related scopes', () => {
      const expanded = StateHelpers.expandScope(['a.x', 'a.y', 'z']);
      assert.deepEqual(expanded, ['a', 'a.x', 'a.y', 'z']);
    });
  });

  describe('optimize scope', () => {
    it('optimize scope with no scope', () => {
      const expanded = StateHelpers.optimizeScope([]);
      assert.deepEqual(expanded, []);
    });

    it('optimize scope with simple scope', () => {
      const expanded = StateHelpers.optimizeScope(['a']);
      assert.deepEqual(expanded, ['a']);
    });

    it('optimize scope with distinct scopes', () => {
      const expanded = StateHelpers.optimizeScope(['a.x', 'b.y', 'z']);
      assert.deepEqual(expanded, ['a.x', 'b.y', 'z']);
    });

    it('optimize scope with sibling scopes', () => {
      const expanded = StateHelpers.optimizeScope(['a.x', 'a.y', 'z']);
      assert.deepEqual(expanded, ['a.x', 'a.y', 'z']);
    });

    it('optimize scope with parent and child scopes', () => {
      const expanded = StateHelpers.optimizeScope(['a.x', 'z', 'a', 'a.y']);
      assert.deepEqual(expanded, ['a', 'z']);
    });
  });

  describe('doOnStoreChange', () => {
    it('doOnStoreChange with no scope', () => {
      const store = {
        subscribe: () => {},
        subscribeToScope: () => {}
      };
      const fn = () => {};
      const unsubscribe = StateHelpers.doOnStoreChange(store, fn);
      assert.isFunction(unsubscribe);
    });

    it('doOnStoreChange with simple scope', () => {
      const store = {
        subscribe: () => {},
        subscribeToScope: () => {}
      };
      const fn = () => {};
      const unsubscribe = StateHelpers.doOnStoreChange(store, fn, ['a']);
      assert.isFunction(unsubscribe);
    });
    it('doOnStoreChange with multiple scopes', () => {
      const store = {
        subscribe: () => {},
        subscribeToScope: () => {}
      };
      const fn = () => {};
      const unsubscribe = StateHelpers.doOnStoreChange(store, fn, ['a', 'b']);
      assert.isFunction(unsubscribe);
    });
  });
});
