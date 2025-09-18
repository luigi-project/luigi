import { assert } from 'chai';
import { EventListenerHelpers } from '../../../src/utilities/helpers/event-listener-helpers';

describe('EventListenerHelpers', () => {
  beforeEach(() => {
    EventListenerHelpers.listeners = [];
  });

  it('add an event listener and store it', () => {
    const listenerFn = () => {};
    EventListenerHelpers.addEventListener('click', listenerFn);

    assert.deepEqual(EventListenerHelpers.listeners, [{ type: 'click', listenerFn: listenerFn }]);
  });

  it('add and then remove an event listener', () => {
    const listenerFn = () => {};
    EventListenerHelpers.addEventListener('click', listenerFn);
    EventListenerHelpers.removeEventListener('click', listenerFn);

    assert.deepEqual(EventListenerHelpers.listeners, []);
  });

  it('add and remove all event listeners', () => {
    const listenerFn1 = () => {};
    const listenerFn2 = () => {};
    EventListenerHelpers.addEventListener('click', listenerFn1);
    EventListenerHelpers.addEventListener('keydown', listenerFn2);

    EventListenerHelpers.removeAllEventListeners();

    assert.deepEqual(EventListenerHelpers.listeners, []);
  });
});
