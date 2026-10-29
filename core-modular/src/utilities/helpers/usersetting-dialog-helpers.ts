import { GenericHelpers } from './generic-helpers';

class UserSettingsHelperClass {
  processUserSettingGroups(userSettings: any, storedSettings: any): any[] {
    const userSettingGroups: any[] = [];
    const userSettingGroupsFromConfig = userSettings?.userSettingGroups;
    const userSettingGroupsFromOldConfig = storedSettings?.userSettings?.userSettingGroups;
    // regarding backwards compatibility
    const userSettingsSchema = userSettingGroupsFromConfig
      ? userSettingGroupsFromConfig
      : userSettingGroupsFromOldConfig;

    if (GenericHelpers.isObject(userSettingsSchema)) {
      for (const item in userSettingsSchema) {
        const innerObj: any = {};

        innerObj[item] = userSettingsSchema[item];
        userSettingGroups.push(innerObj);
      }

      return userSettingGroups;
    }

    return userSettingGroups;
  }

  /**
   * Builds the complete user-settings object that should be stored.
   *
   * Every setting defined in the configuration is prefilled with a default
   * (empty string), then overlaid with the persisted values. This guarantees
   * that the stored object always contains the full set of properties, not
   * only the ones that were changed in the dialog (mirrors Luigi core).
   *
   * @param userSettingData schema as returned by `processUserSettingGroups`
   * @param previousUserSettings persisted user-settings state, or `null`/`{}`
   * @returns a settings object keyed by group, each group prefilled with defaults
   */
  prepareUserSettingsObj(
    userSettingData: any[],
    previousUserSettings: Record<string, any> | null
  ): Record<string, any> {
    const result: Record<string, any> = {};
    const stored = previousUserSettings || {};
    (Array.isArray(userSettingData) ? userSettingData : []).forEach((groupObj: any) => {
      Object.keys(groupObj || {}).forEach((groupKey) => {
        const groupConfig = groupObj[groupKey] || {};
        const defaults: Record<string, any> = {};
        if (groupConfig.settings) {
          Object.keys(groupConfig.settings).forEach((settingKey) => {
            defaults[settingKey] = '';
          });
        }
        result[groupKey] = { ...defaults, ...(stored[groupKey] || {}) };
      });
    });

    return result;
  }

  getUserSettingsIframesInDom(): HTMLElement[] {
    const iframeCtn = document.querySelector('.iframeUserSettingsCtn');

    return (iframeCtn ? [...iframeCtn.children] : []) as HTMLElement[]; // convert htmlcollection to array because of foreach issue
  }

  hideUserSettingsIframe(): void {
    this.getUserSettingsIframesInDom().forEach((iframe: HTMLElement) => {
      iframe.style.display = 'none';
    });
  }

  findActiveCustomUserSettingsIframe(eventSource: any): any {
    const customUserSettingsIframes = document.querySelectorAll('[userSettingsGroup]');

    for (let i = 0; i < customUserSettingsIframes.length; i++) {
      if ((customUserSettingsIframes[i] as any).contentWindow === eventSource) {
        return customUserSettingsIframes[i];
      }
    }

    return null;
  }
}

export const UserSettingsHelper = new UserSettingsHelperClass();
