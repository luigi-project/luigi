class DirtyStatusServiceClass {
  unsavedChanges: {
    isDirty?: boolean;
    persistUrl?: string | null;
    dirtySet?: Set<any>;
  };
  /**
   * Initializes the `unsavedChanges` property with default values.
   * Sets `isDirty` to `false` and `persistUrl` to `null`, indicating that there are no unsaved changes initially.
   */
  constructor() {
    this.unsavedChanges = {
      isDirty: false,
      persistUrl: null
    };
  }

  /**
   * Updates the dirty status of a given source and manages the set of unsaved changes.
   *
   * If the dirty set does not exist or is not a `Set`, it initializes a new `Set` and adds the source to it.
   * The current URL is persisted in the `unsavedChanges` object.
   * If `isDirty` is `true`, the source is added to the dirty set; otherwise, it is removed.
   *
   * @param isDirty - Indicates whether the source has unsaved changes.
   * @param source - The source object to be marked as dirty or clean.
   */
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
      this.unsavedChanges.dirtySet?.add(source);
    } else {
      this.unsavedChanges.dirtySet?.delete(source);
    }
  }

  /**
   * Clears the dirty state for a given source or all sources.
   *
   * If a source is provided, removes it from the set of unsaved changes.
   * If no source is provided, clears all unsaved changes.
   *
   * @param source - The source to clear from the dirty set. If omitted, all sources are cleared.
   */
  clearDirtyState(source?: any): void {
    if (this.unsavedChanges && this.unsavedChanges.dirtySet) {
      if (source) {
        this.unsavedChanges.dirtySet.delete(source);
      } else {
        this.unsavedChanges.dirtySet.clear();
      }
    }
  }

  /**
   * Determines whether there are unsaved changes.
   *
   * Checks if the `dirtySet` exists and contains any items, indicating unsaved changes.
   * If `dirtySet` is not present, falls back to the `isDirty` flag.
   *
   * @returns {boolean} `true` if there are unsaved changes, otherwise `false`.
   */
  readDirtyStatus(): boolean {
    return this.unsavedChanges.dirtySet ? this.unsavedChanges.dirtySet.size > 0 : !!this.unsavedChanges.isDirty;
  }
}

export const DirtyStatusService = new DirtyStatusServiceClass();
