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
