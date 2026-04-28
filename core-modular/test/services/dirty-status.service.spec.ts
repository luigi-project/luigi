import { DirtyStatusService } from "../../src/services/dirty-status.service";

describe('Dirty Status Service', ()=>{
    let dirtyStatusService: DirtyStatusService;
    beforeEach(() => {
        dirtyStatusService = new DirtyStatusService();
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
});