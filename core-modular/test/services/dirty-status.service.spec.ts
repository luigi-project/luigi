import { DirtyStatusService } from "../../src/services/dirty-status.service";
import chai from 'chai';
const assert = chai.assert;

describe('Dirty Status Service', ()=>{

    beforeEach(() => {
        DirtyStatusService.clearDirtyState();
    });

    it('should update dirty status correctly', () => {
        assert.isFalse(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.updateDirtyStatus(true, 'testSource');
        assert.isTrue(DirtyStatusService.readDirtyStatus());
    });

    it('should clear dirty status', () => {
        DirtyStatusService.updateDirtyStatus(true, 'testSource');
        DirtyStatusService.clearDirtyState('testSource');
        assert.isFalse(DirtyStatusService.readDirtyStatus());
    });

    it('should read dirty status correctly', () => {
        assert.isFalse(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.updateDirtyStatus(true, 'testSource');
        assert.isTrue(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.clearDirtyState('testSource');
        assert.isFalse(DirtyStatusService.readDirtyStatus());
    });

    it('should handle multiple sources in dirty set', () => {
        DirtyStatusService.updateDirtyStatus(true, 'source1');
        DirtyStatusService.updateDirtyStatus(true, 'source2');
        assert.isTrue(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.updateDirtyStatus(false, 'source2');
        assert.isTrue(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.updateDirtyStatus(false, 'source1');
        assert.isFalse(DirtyStatusService.readDirtyStatus());
    });

    it('should clear all sources when called without arguments', () => {
        DirtyStatusService.updateDirtyStatus(true, 'sourceA');
        DirtyStatusService.updateDirtyStatus(true, 'sourceB');
        assert.isTrue(DirtyStatusService.readDirtyStatus());
        DirtyStatusService.clearDirtyState();
        assert.isFalse(DirtyStatusService.readDirtyStatus());
    });
});