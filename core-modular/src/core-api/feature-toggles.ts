import { get, writable, type Writable } from 'svelte/store';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

/**
 * Functions to use feature toggles in Luigi
 */
export class FeatureToggles {
  featureToggleList!: Writable<string[]>;

  constructor() {
    this.featureToggleList = writable([]);
  }

  /**
   * Add a feature toggle to an active feature toggles list
   * @param {string} featureToggleName name of the feature toggle
   */
  setFeatureToggle(featureToggleName: string, fromUrlQuery = false): void {
    if (!this.isValid(featureToggleName)) return;
    if (featureToggleName.startsWith('!') && !fromUrlQuery) return;
    if (this.isDuplicatedOrDisabled(featureToggleName)) return;

    get(this.featureToggleList).push(featureToggleName);
  }

  /**
   * Remove a feature toggle from the list
   * @param {string} featureToggleName name of the feature toggle
   */
  unsetFeatureToggle(featureToggleName: string): void {
    if (!this.isValid(featureToggleName)) return;

    const index = get(this.featureToggleList).indexOf(featureToggleName);

    if (index === -1) {
      console.warn('Feature toggle name is not in the list.');
      return;
    }

    get(this.featureToggleList).splice(index, 1);
  }

  /**
   * Get a list of active feature toggles
   * @return {Array} of active feature toggles
   */
  getActiveFeatureToggleList(): string[] {
    return [...get(this.featureToggleList)].filter((ft) => !ft.startsWith('!'));
  }

  /**
   * Check if it is a valid feature toggle
   * @private
   * @param {string} featureToggleName name of the feature toggle
   * @return {boolean} of valid feature toggle name
   */
  private isValid(featureToggleName: string): boolean {
    if (GenericHelpers.isString(featureToggleName)) return true;

    console.warn(`Feature toggle name is not valid or not of type 'string'`);
    return false;
  }

  /**
   * Check if feature toggle is duplicated or already disabled
   * @private
   * @param {string} featureToggleName name of the feature toggle
   * @return {boolean} of valid feature toggle name
   */
  private isDuplicatedOrDisabled(featureToggleName: string): boolean {
    if (get(this.featureToggleList).includes(featureToggleName)) {
      console.warn('Feature toggle name already exists');
      return true;
    }

    if (get(this.featureToggleList).includes(`!${featureToggleName}`)) {
      console.warn('Disabled feature toggle can not be activated');
      return true;
    }

    return false;
  }
}
