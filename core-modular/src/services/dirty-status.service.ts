class DirtyStatusServiceClass {
    unsavedChanges: {
        isDirty?: boolean;
        persistUrl?: string | null;
        dirtySet?: Set<any>;
    }
    constructor() {
        this.unsavedChanges = {
            isDirty: false,
            persistUrl: null
        };
    }

    updateDirtyStatus(isDirty: boolean, source: any): void {
        if (!this.unsavedChanges.dirtySet || !(this.unsavedChanges.dirtySet instanceof Set)) {
            const dirtySet = new Set();

            dirtySet.add(source);
            this.unsavedChanges = {
                dirtySet: dirtySet,
            };
        }

        this.unsavedChanges.persistUrl = window.location.href;

        if (isDirty) {
            this.unsavedChanges.dirtySet?.add(source);
        } else {
            this.unsavedChanges.dirtySet?.delete(source);
        }
    }

    clearDirtyState(source: any): void {
        if (this.unsavedChanges && this.unsavedChanges.dirtySet) {
            if (source) {
                this.unsavedChanges.dirtySet.delete(source);
            } else {
                this.unsavedChanges.dirtySet.clear();
            }
        }
    };

    readDirtyStatus(): boolean {
        return this.unsavedChanges.dirtySet
            ? this.unsavedChanges.dirtySet.size > 0
            : !!this.unsavedChanges.isDirty;
    }
}

export const DirtyStatusService = new DirtyStatusServiceClass();
