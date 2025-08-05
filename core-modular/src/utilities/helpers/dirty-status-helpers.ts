class DirtyStatusHelpersClass {
  private storageKey = 'luigi.dirtyStore';
  protected unsavedChanges!: Record<string, any>;

  constructor() {
    this.initChangesData();
  }

  initChangesData(): void {
    const dirtyStore = this.parseDirtyStore();

    if (dirtyStore) {
      this.unsavedChanges = dirtyStore;
      this.clearDirtyState();
    } else {
      this.unsavedChanges = {
        isDirty: false,
        persistUrl: null
      };
    }

    this.storeDirtyStatus();
  }

  parseDirtyStore(): Record<string, any> | null {
    const dirtyStore = window.localStorage.getItem(this.storageKey);
    let parsedStore = null;

    if (dirtyStore) {
      parsedStore = JSON.parse(dirtyStore);

      if (Array.isArray(parsedStore.dirtySet)) {
        parsedStore.dirtySet = new Set(parsedStore.dirtySet);
      }
    }

    return parsedStore;
  }

  storeDirtyStatus(): void {
    const storedChanges = Object.assign({}, this.unsavedChanges);

    if (storedChanges.dirtySet) {
      storedChanges.dirtySet = [...storedChanges.dirtySet];
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(storedChanges));
  }

  clearDirtyState(source?: any): void {
    if (!this.unsavedChanges?.dirtySet) {
      return;
    }

    if (source) {
      this.unsavedChanges.dirtySet.delete(source);
    } else {
      this.unsavedChanges.dirtySet.clear();
    }
  }

  updateDirtyStatus(isDirty: boolean, source: any): void {
    if (!this.unsavedChanges.dirtySet || !(this.unsavedChanges.dirtySet instanceof Set)) {
      const dirtySet = new Set();

      dirtySet.add(source);
      this.unsavedChanges = {
        dirtySet: dirtySet
      };
    }

    this.unsavedChanges.persistUrl = window.location.href;

    if (isDirty) {
      this.unsavedChanges.dirtySet.add(source);
    } else {
      this.unsavedChanges.dirtySet.delete(source);
    }

    this.storeDirtyStatus();
  }

  readDirtyStatus(): boolean {
    const dirtyStore = this.parseDirtyStore();

    if (dirtyStore) {
      this.unsavedChanges = dirtyStore;
    }

    return this.unsavedChanges.dirtySet ? this.unsavedChanges.dirtySet.size > 0 : this.unsavedChanges.isDirty;
  }
};

export const DirtyStatusHelpers = new DirtyStatusHelpersClass();
