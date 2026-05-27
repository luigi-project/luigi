import { linkManager } from '../src/linkManager';
import { helpers } from '../src/helpers';

describe('LinkManager', () => {
  let lm;
  let sendPostMessageSpy;

  beforeEach(() => {
    lm = new linkManager({
      currentContext: {
        context: {
          parentNavigationContexts: ['project', 'environment']
        },
        internal: {
          modal: false,
          viewStackSize: 0
        }
      }
    });

    sendPostMessageSpy = jest.spyOn(helpers, 'sendPostMessageToLuigiCore').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes default options', () => {
      expect(lm.options).toEqual({
        preserveView: false,
        nodeParams: {},
        errorSkipNavigation: false,
        fromContext: null,
        fromClosestContext: false,
        fromVirtualTreeRoot: false,
        fromParent: false,
        relative: false,
        link: '',
        newTab: false,
        preserveQueryParams: false,
        anchor: '',
        preventContextUpdate: false,
        preventHistoryEntry: false
      });
    });
  });

  describe('navigate', () => {
    it('sends navigation message with absolute path', () => {
      lm.navigate('/overview');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.open',
          params: expect.objectContaining({
            link: '/overview',
            relative: false
          })
        })
      );
    });

    it('sends navigation message with relative path', () => {
      lm.navigate('users/groups');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.open',
          params: expect.objectContaining({
            link: 'users/groups',
            relative: true
          })
        })
      );
    });

    it('sets preserveView option', () => {
      lm.navigate('/overview', 'session123', true);

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.open',
          sessionId: 'session123',
          params: expect.objectContaining({
            preserveView: true
          })
        })
      );
    });

    it('passes modal settings', () => {
      const modalSettings = { title: 'My Modal', size: 'm' };
      lm.navigate('/modal-path', null, false, modalSettings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            modal: modalSettings
          })
        })
      );
    });

    it('passes split view settings', () => {
      const splitViewSettings = { title: 'Split', size: 40 };
      lm.navigate('/split-path', null, false, undefined, splitViewSettings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            splitView: splitViewSettings
          })
        })
      );
    });

    it('passes drawer settings', () => {
      const drawerSettings = { header: true, backdrop: true, size: 's' };
      lm.navigate('/drawer-path', null, false, undefined, undefined, drawerSettings);

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            drawer: drawerSettings
          })
        })
      );
    });

    it('warns when all three layout settings are used together', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lm.navigate('/path', null, false, { title: 'modal' }, { title: 'split' }, { header: true });

      expect(warnSpy).toHaveBeenCalledWith(
        'modalSettings, splitViewSettings and drawerSettings cannot be used together. Only modal setting will be taken into account.'
      );
    });

    it('prevents navigation to root with modal settings', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lm.navigate('/', null, false, { title: 'modal' });

      expect(warnSpy).toHaveBeenCalledWith('Navigation with an absolute path prevented.');
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('prevents navigation to root with split view settings', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lm.navigate('/', null, false, undefined, { title: 'split' });

      expect(warnSpy).toHaveBeenCalledWith('Navigation with an absolute path prevented.');
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('prevents navigation to root with drawer settings', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lm.navigate('/', null, false, undefined, undefined, { header: true });

      expect(warnSpy).toHaveBeenCalledWith('Navigation with an absolute path prevented.');
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('skips navigation if errorSkipNavigation is set', () => {
      lm.options.errorSkipNavigation = true;
      lm.navigate('/overview');

      expect(sendPostMessageSpy).not.toHaveBeenCalled();
      expect(lm.options.errorSkipNavigation).toBe(false);
    });

    it('detects intent navigation', () => {
      lm.navigate('#?Intent=Sales-order?id=13');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            intent: true
          })
        })
      );
    });
  });

  describe('updateModalPathInternalNavigation', () => {
    it('sends update modal data path message', () => {
      lm.updateModalPathInternalNavigation('microfrontend', { title: 'Updated' }, true);

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.updateModalDataPath',
          params: expect.objectContaining({
            link: 'microfrontend',
            modal: { title: 'Updated' },
            history: true
          })
        })
      );
    });

    it('warns and returns when no path is specified', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      lm.updateModalPathInternalNavigation('');

      expect(warnSpy).toHaveBeenCalledWith(
        'Updating path of the modal upon internal navigation prevented. No path specified.'
      );
      expect(sendPostMessageSpy).not.toHaveBeenCalled();
    });

    it('uses default values for optional parameters', () => {
      lm.updateModalPathInternalNavigation('some-path');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            modal: {},
            history: false
          })
        })
      );
    });
  });

  describe('navigateToIntent', () => {
    it('navigates with semantic slug and parameters', () => {
      lm.navigateToIntent('Sales-settings', { project: 'pr2', user: 'john' });

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            link: '#?intent=Sales-settings?project=pr2&user=john'
          })
        })
      );
    });

    it('navigates with semantic slug without parameters', () => {
      lm.navigateToIntent('Sales-settings');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            link: '#?intent=Sales-settings'
          })
        })
      );
    });

    it('navigates with empty params object', () => {
      lm.navigateToIntent('Sales-settings', {});

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            link: '#?intent=Sales-settings'
          })
        })
      );
    });
  });

  describe('openAsModal', () => {
    it('navigates with modal settings and returns a promise', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const result = lm.openAsModal('projects/pr1/users', { title: 'Users', size: 'm' });

      expect(result).toBeInstanceOf(Promise);
      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.open',
          params: expect.objectContaining({
            link: 'projects/pr1/users',
            modal: { title: 'Users', size: 'm' }
          })
        })
      );
    });

    it('uses default empty modal settings', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      lm.openAsModal('some/path');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            modal: {}
          })
        })
      );
    });
  });

  describe('updateModalSettings', () => {
    it('sends update modal settings message', () => {
      lm.updateModalSettings({ title: 'New Title', size: 'l' }, true);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.navigation.updateModalSettings',
        updatedModalSettings: { title: 'New Title', size: 'l' },
        addHistoryEntry: true
      });
    });

    it('uses default values', () => {
      lm.updateModalSettings();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.navigation.updateModalSettings',
        updatedModalSettings: {},
        addHistoryEntry: false
      });
    });
  });

  describe('openAsSplitView', () => {
    it('navigates with split view settings and returns a handle', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const handle = lm.openAsSplitView('projects/pr1/logs', { title: 'Logs', size: 40 });

      expect(handle).toBeDefined();
      expect(handle.exists()).toBe(true);
      expect(handle.getSize()).toBe(40);
    });
  });

  describe('openAsDrawer', () => {
    it('navigates with drawer settings', () => {
      lm.openAsDrawer('projects/pr1/drawer', { header: true, backdrop: true, size: 's' });

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            drawer: { header: true, backdrop: true, size: 's' }
          })
        })
      );
    });
  });

  describe('fromContext', () => {
    it('sets fromContext option when context exists', () => {
      const result = lm.fromContext('project');

      expect(result).toBe(lm);
      expect(lm.options.fromContext).toBe('project');
    });

    it('sets errorSkipNavigation when context does not exist', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      lm.fromContext('nonexistent');

      expect(lm.options.errorSkipNavigation).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(
        'Navigation not possible, navigationContext nonexistent not found.'
      );
    });

    it('returns the linkManager instance for chaining', () => {
      const result = lm.fromContext('project');
      expect(result).toBe(lm);
    });
  });

  describe('fromClosestContext', () => {
    it('sets fromClosestContext when parent contexts exist', () => {
      const result = lm.fromClosestContext();

      expect(result).toBe(lm);
      expect(lm.options.fromClosestContext).toBe(true);
      expect(lm.options.fromContext).toBeNull();
    });

    it('logs error when no parent navigation context exists', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      lm.currentContext.context.parentNavigationContexts = [];
      lm.fromClosestContext();

      expect(errorSpy).toHaveBeenCalledWith('Navigation not possible, no parent navigationContext found.');
    });

    it('returns the linkManager instance for chaining', () => {
      const result = lm.fromClosestContext();
      expect(result).toBe(lm);
    });
  });

  describe('fromVirtualTreeRoot', () => {
    it('sets fromVirtualTreeRoot and resets other context options', () => {
      lm.options.fromContext = 'project';
      lm.options.fromClosestContext = true;

      const result = lm.fromVirtualTreeRoot();

      expect(result).toBe(lm);
      expect(lm.options.fromVirtualTreeRoot).toBe(true);
      expect(lm.options.fromContext).toBeNull();
      expect(lm.options.fromClosestContext).toBe(false);
    });
  });

  describe('fromParent', () => {
    it('sets fromParent option', () => {
      const result = lm.fromParent();

      expect(result).toBe(lm);
      expect(lm.options.fromParent).toBe(true);
    });
  });

  describe('withParams', () => {
    it('merges node parameters', () => {
      const result = lm.withParams({ foo: 'bar', baz: 'qux' });

      expect(result).toBe(lm);
      expect(lm.options.nodeParams).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('does not overwrite existing params with null', () => {
      lm.withParams({ foo: 'bar' });
      lm.withParams(null);

      expect(lm.options.nodeParams).toEqual({ foo: 'bar' });
    });

    it('merges additional params with existing ones', () => {
      lm.withParams({ foo: 'bar' });
      lm.withParams({ baz: 'qux' });

      expect(lm.options.nodeParams).toEqual({ foo: 'bar', baz: 'qux' });
    });
  });

  describe('withOptions', () => {
    it('sets preventHistoryEntry', () => {
      const result = lm.withOptions({ preventHistoryEntry: true });

      expect(result).toBe(lm);
      expect(lm.options.preventHistoryEntry).toBe(true);
    });

    it('sets preventContextUpdate', () => {
      const result = lm.withOptions({ preventContextUpdate: true });

      expect(result).toBe(lm);
      expect(lm.options.preventContextUpdate).toBe(true);
    });

    it('sets both options together', () => {
      lm.withOptions({ preventHistoryEntry: true, preventContextUpdate: true });

      expect(lm.options.preventHistoryEntry).toBe(true);
      expect(lm.options.preventContextUpdate).toBe(true);
    });

    it('returns instance without modifying when non-object is passed', () => {
      const result = lm.withOptions('invalid');

      expect(result).toBe(lm);
      expect(lm.options.preventHistoryEntry).toBe(false);
    });

    it('returns instance without modifying when null is passed', () => {
      const result = lm.withOptions(null);

      expect(result).toBe(lm);
    });
  });

  describe('pathExists', () => {
    it('sends pathExists message with absolute path', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(12345);

      lm.pathExists('/projects/pr2');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.pathExists',
          data: expect.objectContaining({
            link: '/projects/pr2',
            relative: false,
            id: 12345
          })
        })
      );
    });

    it('sends pathExists message with relative path', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(67890);

      lm.pathExists('projects/pr2');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            link: 'projects/pr2',
            relative: true,
            id: 67890
          })
        })
      );
    });

    it('returns an object with then method', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const result = lm.pathExists('/projects/pr2');

      expect(result).toBeDefined();
      expect(typeof result.then).toBe('function');
    });

    it('detects intent in path', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(11111);

      lm.pathExists('#?intent=Sales-order?id=13');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            intent: true
          })
        })
      );
    });
  });

  describe('hasBack', () => {
    it('returns true when modal is active', () => {
      lm.currentContext.internal.modal = true;
      expect(lm.hasBack()).toBe(true);
    });

    it('returns true when viewStackSize is non-zero', () => {
      lm.currentContext.internal.viewStackSize = 2;
      expect(lm.hasBack()).toBe(true);
    });

    it('returns false when no modal and viewStackSize is 0', () => {
      expect(lm.hasBack()).toBe(false);
    });
  });

  describe('goBack', () => {
    it('sends goBack message with serialized context', () => {
      lm.goBack({ foo: 'bar' });

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.navigation.back',
        goBackContext: JSON.stringify({ foo: 'bar' })
      });
    });

    it('sends goBack message with boolean value', () => {
      lm.goBack(true);

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.navigation.back',
        goBackContext: 'true'
      });
    });

    it('sends goBack message without context when no value provided', () => {
      lm.goBack();

      expect(sendPostMessageSpy).toHaveBeenCalledWith({
        msg: 'luigi.navigation.back',
        goBackContext: undefined
      });
    });
  });

  describe('withoutSync', () => {
    it('sets withoutSync option and returns instance', () => {
      const result = lm.withoutSync();

      expect(result).toBe(lm);
      expect(lm.options.withoutSync).toBe(true);
    });
  });

  describe('newTab', () => {
    it('sets newTab option and returns instance', () => {
      const result = lm.newTab();

      expect(result).toBe(lm);
      expect(lm.options.newTab).toBe(true);
    });
  });

  describe('preserveQueryParams', () => {
    it('sets preserveQueryParams to true', () => {
      const result = lm.preserveQueryParams(true);

      expect(result).toBe(lm);
      expect(lm.options.preserveQueryParams).toBe(true);
    });

    it('sets preserveQueryParams to false by default', () => {
      const result = lm.preserveQueryParams();

      expect(result).toBe(lm);
      expect(lm.options.preserveQueryParams).toBe(false);
    });
  });

  describe('getCurrentRoute', () => {
    it('sends getCurrentRoute message', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      jest.spyOn(helpers, 'getRandomId').mockReturnValue(99999);

      lm.getCurrentRoute();

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          msg: 'luigi.navigation.currentRoute',
          data: expect.objectContaining({
            id: 99999
          })
        })
      );
    });

    it('returns an object with then method', () => {
      jest.spyOn(helpers, 'addEventListener').mockImplementation(() => 'listener-id');
      const result = lm.getCurrentRoute();

      expect(result).toBeDefined();
      expect(typeof result.then).toBe('function');
    });
  });

  describe('chaining', () => {
    it('chains fromContext with navigate', () => {
      lm.fromContext('project').navigate('/settings');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            fromContext: 'project',
            link: '/settings'
          })
        })
      );
    });

    it('chains fromParent with navigate', () => {
      lm.fromParent().navigate('/sibling');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            fromParent: true,
            link: '/sibling'
          })
        })
      );
    });

    it('chains withParams with navigate', () => {
      lm.withParams({ foo: 'bar' }).navigate('/path');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            nodeParams: { foo: 'bar' },
            link: '/path'
          })
        })
      );
    });

    it('chains withOptions with navigate', () => {
      lm.withOptions({ preventHistoryEntry: true }).navigate('/path');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            preventHistoryEntry: true,
            link: '/path'
          })
        })
      );
    });

    it('chains withoutSync with fromClosestContext and navigate', () => {
      lm.withoutSync().fromClosestContext().navigate('settings');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            withoutSync: true,
            fromClosestContext: true,
            link: 'settings'
          })
        })
      );
    });

    it('chains newTab with navigate', () => {
      lm.newTab().navigate('/projects/xy/foobar');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            newTab: true,
            link: '/projects/xy/foobar'
          })
        })
      );
    });

    it('chains preserveQueryParams with navigate', () => {
      lm.preserveQueryParams(true).navigate('/projects/xy');

      expect(sendPostMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            preserveQueryParams: true,
            link: '/projects/xy'
          })
        })
      );
    });
  });
});
