import { GenericHelpers } from '../utilities/helpers/generic-helpers';

export class FeatureToggles {
  featureToggleList!: Set<string>;

  constructor() {
    this.featureToggleList = new Set();
  }

  /**
   * Add a feature toggle to an active feature toggles list
   * @param {string} featureToggleName name of the feature toggle
   */
  setFeatureToggle(featureToggleName: string, fromUrlQuery = false): void {
    if (!this.isValid(featureToggleName)) return;
    if (featureToggleName.startsWith('!') && !fromUrlQuery) return;
    if (this.isDuplicatedOrDisabled(featureToggleName)) return;

    this.featureToggleList.add(featureToggleName);
  }

  /**
   * Remove a feature toggle from the list
   * @param {string} featureToggleName name of the feature toggle
   */
  unsetFeatureToggle(featureToggleName: string): void {
    if (!this.isValid(featureToggleName)) return;

    if (!this.featureToggleList.has(featureToggleName)) {
      console.warn('Feature toggle name is not in the list.');
      return;
    }

    this.featureToggleList.delete(featureToggleName);
  }

  /**
   * Get a list of active feature toggles
   * @return {Array} of active feature toggles
   */
  getActiveFeatureToggleList(): string[] {
    const featureToggles: string[] = Array.from(this.featureToggleList);

    return [...featureToggles].filter((ft) => !ft.startsWith('!'));
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
    if (this.featureToggleList.has(featureToggleName)) {
      console.warn('Feature toggle name already exists');
      return true;
    }

    if (this.featureToggleList.has(`!${featureToggleName}`)) {
      console.warn('Disabled feature toggle can not be activated');
      return true;
    }

    return false;
  }
}
