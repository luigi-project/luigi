/**
 * @jest-environment jsdom
 */

import * as ClientModule from '../src/esm-exports.js';

describe('ES Module export tests', () => {
  it('should export all expected functions', async () => {
    expect(ClientModule).toBeDefined();

    const LuigiClient = ClientModule.default;
    expect(LuigiClient).toBeDefined();

    const exportedFunctions = Object.keys(ClientModule).filter((fn) => fn !== 'default');
    const luigiClientFunctions = Object.getOwnPropertyNames(Object.getPrototypeOf(LuigiClient)).filter(
      (fn) => fn !== 'constructor'
    );

    expect(new Set(exportedFunctions)).toEqual(new Set(luigiClientFunctions));
  });
});
