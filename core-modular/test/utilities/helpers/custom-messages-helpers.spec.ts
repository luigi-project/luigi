import { CustomMessagesHelpers } from '../../../src/utilities/helpers/custom-messages-helpers';

describe('CustomMessagesHelpers', () => {
  describe('filterIdFromMessageObject', () => {
    it('extracts id and returns remaining properties', () => {
      const result = CustomMessagesHelpers.filterIdFromMessageObject({ id: 'myEvent', data: 'hello', count: 42 });

      expect(result.id).toEqual('myEvent');
      expect(result.messageWithoutId).toEqual({ data: 'hello', count: 42 });
    });

    it('returns undefined id when message has no id property', () => {
      const result = CustomMessagesHelpers.filterIdFromMessageObject({ data: 'hello' });

      expect(result.id).toBeUndefined();
      expect(result.messageWithoutId).toEqual({ data: 'hello' });
    });

    it('returns empty messageWithoutId when message only has id', () => {
      const result = CustomMessagesHelpers.filterIdFromMessageObject({ id: 'ping' });

      expect(result.id).toEqual('ping');
      expect(result.messageWithoutId).toEqual({});
    });

    it('returns undefined id and empty object for empty message', () => {
      const result = CustomMessagesHelpers.filterIdFromMessageObject({});

      expect(result.id).toBeUndefined();
      expect(result.messageWithoutId).toEqual({});
    });

    it('handles nested objects in message', () => {
      const result = CustomMessagesHelpers.filterIdFromMessageObject({
        id: 'update',
        nested: { a: 1, b: { c: 2 } }
      });

      expect(result.id).toEqual('update');
      expect(result.messageWithoutId).toEqual({ nested: { a: 1, b: { c: 2 } } });
    });
  });
});
