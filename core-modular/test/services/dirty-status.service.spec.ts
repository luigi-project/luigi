import { DirtyStatusService } from "../../src/services/dirty-status.service";
import { assert } from 'chai';

describe('Dirty Status Service', ()=>{
    let dirtyStatusService: DirtyStatusService;
    beforeEach(() => {
        dirtyStatusService = new DirtyStatusService();
        dirtyStatusService.clearDirtyState();
    });

    it('should update dirty status correctly', () => {
        assert.isFalse(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.updateDirtyStatus(true, 'testSource');
        assert.isTrue(dirtyStatusService.readDirtyStatus());
    });

    it('should clear dirty status', () => {
        dirtyStatusService.updateDirtyStatus(true, 'testSource');
        dirtyStatusService.clearDirtyState('testSource');
        assert.isFalse(dirtyStatusService.readDirtyStatus());
    });

    it('should read dirty status correctly', () => {
        assert.isFalse(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.updateDirtyStatus(true, 'testSource');
        assert.isTrue(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.clearDirtyState('testSource');
        assert.isFalse(dirtyStatusService.readDirtyStatus());
    });

    it('should handle multiple sources in dirty set', () => {
        dirtyStatusService.updateDirtyStatus(true, 'source1');
        dirtyStatusService.updateDirtyStatus(true, 'source2');
        assert.isTrue(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.updateDirtyStatus(false, 'source2');
        assert.isTrue(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.updateDirtyStatus(false, 'source1');
        assert.isFalse(dirtyStatusService.readDirtyStatus());
    });

    it('should clear all sources when called without arguments', () => {
        dirtyStatusService.updateDirtyStatus(true, 'sourceA');
        dirtyStatusService.updateDirtyStatus(true, 'sourceB');
        assert.isTrue(dirtyStatusService.readDirtyStatus());
        dirtyStatusService.clearDirtyState();
        assert.isFalse(dirtyStatusService.readDirtyStatus());
    });
});