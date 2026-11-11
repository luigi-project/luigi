import { registerWebComponent } from '../src/luigi-element';

describe('LuigiElement', () => {
  describe('registerWebComponent', () => {
    let consoleErrorSpy;
    const originalLuigi = window.Luigi;

    class MyComponent extends HTMLElement {}

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
      if (originalLuigi === undefined) {
        delete window.Luigi;
      } else {
        window.Luigi = originalLuigi;
      }
    });

    it('delegates to Luigi._registerWebcomponent when Luigi core is present', () => {
      const registerSpy = jest.fn();
      window.Luigi = { _registerWebcomponent: registerSpy };

      registerWebComponent('my-src-string', MyComponent);

      expect(registerSpy).toHaveBeenCalledTimes(1);
      expect(registerSpy).toHaveBeenCalledWith('my-src-string', MyComponent);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs an error and does not throw when Luigi core is not present', () => {
      delete window.Luigi;

      expect(() => registerWebComponent('my-src-string', MyComponent)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error registering web component, Luigi core app not present.');
    });

    it('returns undefined when Luigi core is not present', () => {
      delete window.Luigi;

      expect(registerWebComponent('my-src-string', MyComponent)).toBeUndefined();
    });

    it('does not call Luigi._registerWebcomponent when Luigi core is not present', () => {
      const registerSpy = jest.fn();
      delete window.Luigi;

      registerWebComponent('my-src-string', MyComponent);

      expect(registerSpy).not.toHaveBeenCalled();
    });
  });
});
