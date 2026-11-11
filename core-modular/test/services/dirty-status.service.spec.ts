import { DirtyStatusService } from '../../src/services/dirty-status.service';

describe('Dirty Status Service', () => {
  let dirtyStatusService: DirtyStatusService;
  let luigiMock: any;
  let mockConfirmHandler: any;

  beforeEach(() => {
    mockConfirmHandler = { confirm: jest.fn(), dismiss: jest.fn() };
    luigiMock = {
      getConfigValue: jest.fn().mockReturnValue(null),
      i18n: jest.fn().mockReturnValue({
        getTranslation: (key: string) => key
      }),
      getEngine: jest.fn().mockReturnValue({
        _connector: {
          renderConfirmationModal: jest.fn((settings, handler) => {
            mockConfirmHandler = handler;
          })
        }
      })
    };
    dirtyStatusService = new DirtyStatusService(luigiMock);
    dirtyStatusService.clearDirtyState();
  });

  it('should update dirty status correctly', () => {
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
    dirtyStatusService.updateDirtyStatus(true, 'testSource');
    expect(dirtyStatusService.readDirtyStatus()).toBe(true);
  });

  it('should clear dirty status', () => {
    dirtyStatusService.updateDirtyStatus(true, 'testSource');
    dirtyStatusService.clearDirtyState('testSource');
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
  });

  it('should read dirty status correctly', () => {
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
    dirtyStatusService.updateDirtyStatus(true, 'testSource');
    expect(dirtyStatusService.readDirtyStatus()).toBe(true);
    dirtyStatusService.clearDirtyState('testSource');
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
  });

  it('should handle multiple sources in dirty set', () => {
    dirtyStatusService.updateDirtyStatus(true, 'source1');
    dirtyStatusService.updateDirtyStatus(true, 'source2');
    expect(dirtyStatusService.readDirtyStatus()).toBe(true);
    dirtyStatusService.updateDirtyStatus(false, 'source2');
    expect(dirtyStatusService.readDirtyStatus()).toBe(true);
    dirtyStatusService.updateDirtyStatus(false, 'source1');
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
  });

  it('should clear all sources when called without arguments', () => {
    dirtyStatusService.updateDirtyStatus(true, 'sourceA');
    dirtyStatusService.updateDirtyStatus(true, 'sourceB');
    expect(dirtyStatusService.readDirtyStatus()).toBe(true);
    dirtyStatusService.clearDirtyState();
    expect(dirtyStatusService.readDirtyStatus()).toBe(false);
  });

  describe('shouldShowUnsavedChangesModal', () => {
    it('should return false when no dirty state exists', () => {
      expect(dirtyStatusService.shouldShowUnsavedChangesModal()).toBe(false);
    });

    it('should return true when dirty state exists', () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      expect(dirtyStatusService.shouldShowUnsavedChangesModal()).toBe(true);
    });

    it('should return true when specific source is dirty', () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      expect(dirtyStatusService.shouldShowUnsavedChangesModal('source1')).toBe(true);
    });

    it('should return false when specific source is not dirty', () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      expect(dirtyStatusService.shouldShowUnsavedChangesModal('source2')).toBe(false);
    });
  });

  describe('getUnsavedChangesModalPromise', () => {
    it('should resolve immediately when no dirty state exists', async () => {
      await expect(dirtyStatusService.getUnsavedChangesModalPromise()).resolves.toBeUndefined();
    });

    it('should show confirmation modal when dirty state exists', async () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      const promise = dirtyStatusService.getUnsavedChangesModalPromise();

      expect(luigiMock.getEngine()._connector.renderConfirmationModal).toHaveBeenCalled();
      const settings = luigiMock.getEngine()._connector.renderConfirmationModal.mock.calls[0][0];
      expect(settings.header).toBe('luigi.unsavedChangesAlert.header');
      expect(settings.body).toBe('luigi.unsavedChangesAlert.body');
      expect(settings.buttonDismiss).toBe('luigi.button.dismiss');
      expect(settings.buttonConfirm).toBe('luigi.button.confirm');

      mockConfirmHandler.confirm();
      await expect(promise).resolves.toBeUndefined();
    });

    it('should clear dirty state on confirm', async () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      const promise = dirtyStatusService.getUnsavedChangesModalPromise();

      mockConfirmHandler.confirm();
      await promise;

      expect(dirtyStatusService.readDirtyStatus()).toBe(false);
    });

    it('should reject on dismiss without clearing dirty state', async () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');
      const promise = dirtyStatusService.getUnsavedChangesModalPromise();

      mockConfirmHandler.dismiss();
      await expect(promise).rejects.toBeUndefined();
      expect(dirtyStatusService.readDirtyStatus()).toBe(true);
    });

    it('should use custom handler when configured', async () => {
      const customHandler = jest.fn().mockResolvedValue(undefined);
      luigiMock.getConfigValue.mockReturnValue(customHandler);

      dirtyStatusService.updateDirtyStatus(true, 'source1');
      await dirtyStatusService.getUnsavedChangesModalPromise();

      expect(customHandler).toHaveBeenCalled();
      expect(dirtyStatusService.readDirtyStatus()).toBe(false);
    });

    it('should check specific source when provided', async () => {
      dirtyStatusService.updateDirtyStatus(true, 'source1');

      await expect(dirtyStatusService.getUnsavedChangesModalPromise('source2')).resolves.toBeUndefined();
      expect(luigiMock.getEngine()._connector.renderConfirmationModal).not.toHaveBeenCalled();
    });
  });
});
