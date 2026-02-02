import { UserSettingsHelper } from '../../../src/utilities/helpers/usersetting-dialog-helpers';

describe('UserSettings-helpers', () => {
  const userSettingsSchema = {
    userSettingGroups: {
      userAccount: {
        label: 'User Account',
        sublabel: 'username',
        icon: 'account',
        title: 'User Account',
        settings: {
          name: { type: 'string', label: 'Name', isEditable: true },
          email: { type: 'string', label: 'E-Mail', isEditable: false },
          server: { type: 'string', label: 'Server', isEditable: false }
        }
      },
      language: {
        label: 'Language & Region',
        sublabel: 'EN | Time Format: 12h',
        icon: '/assets/github-logo.png',
        title: 'Language & Region',
        settings: {
          language: {
            type: 'enum',
            label: 'Language and Region',
            options: ['German', 'English', 'Spanish', 'French'],
            description: 'After you save your settings, the browser will refresh for the new language to take effect.'
          },
          date: { type: 'string', label: 'Date Format' },
          time: { type: 'enum', label: 'Time Format', options: ['12 h', '24 h'] }
        }
      },
      privacy: {
        label: 'Privacy',
        title: 'Privacy',
        icon: 'private',
        settings: {
          policy: {
            type: 'string',
            label: 'Privacy policy has not been defined.'
          },
          time: { type: 'enum', label: 'Time Format', options: ['12 h', '24 h'] }
        }
      },
      theming: {
        label: 'Theming',
        title: 'Theming',
        icon: 'private',
        viewUrl: 'https://url.to.mf',
        settings: {
          theme: { type: 'enum', label: 'Themes', options: ['red', 'green'] }
        }
      }
    }
  };

  beforeEach(() => {
    jest.spyOn(document, 'querySelector').mockClear().mockImplementation();
    jest.spyOn(document, 'querySelectorAll').mockClear().mockImplementation();
  });

  afterEach(() => {
    if (document.querySelector.restore) {
      document.querySelector.mockRestore();
    }
    jest.restoreAllMocks();
  });

  it('prepare user settings data from schema', () => {
    let processedUserSettingGroups = UserSettingsHelper.processUserSettingGroups(userSettingsSchema, null);
    expect(processedUserSettingGroups.length).toEqual(4);
    expect(processedUserSettingGroups[0]).toEqual({
      userAccount: {
        label: 'User Account',
        sublabel: 'username',
        icon: 'account',
        title: 'User Account',
        settings: {
          name: { type: 'string', label: 'Name', isEditable: true },
          email: { type: 'string', label: 'E-Mail', isEditable: false },
          server: { type: 'string', label: 'Server', isEditable: false }
        }
      }
    });
  });

  it('return empty array if no schema defined', () => {
    let processedUserSettingGroups = UserSettingsHelper.processUserSettingGroups({}, null);
    expect(processedUserSettingGroups.length).toEqual(0);
  });

  it('getUserSettingsIframesInDom', () => {
    document.querySelector.mockReturnValue({
      children: [
        {
          frame1: {}
        },
        {
          frame2: {}
        }
      ]
    });
    const iframeCtn = UserSettingsHelper.getUserSettingsIframesInDom();
    expect(iframeCtn.length).toEqual(2);
  });

  it('hideUserSettingsIframe', () => {
    let iframes = [{ style: { display: 'block' } }, { style: { display: 'block' } }];
    jest.spyOn(UserSettingsHelper, 'getUserSettingsIframesInDom').mockClear().mockImplementation();
    UserSettingsHelper.getUserSettingsIframesInDom.mockReturnValue(iframes);
    UserSettingsHelper.hideUserSettingsIframe();
    expect(iframes[0].style.display).toEqual('none');
    expect(iframes[1].style.display).toEqual('none');
  });

  it('findActiveCustomUserSettingsIframe', () => {
    let eventSource = { contentWindow2: 'contentWindow2' };
    let iframes = [{ contentWindow: { contentWindow1: 'contentWindow1' } }, { contentWindow: eventSource }];
    document.querySelectorAll.mockReturnValue(iframes);
    let activeCustomUserSettingsIframe = UserSettingsHelper.findActiveCustomUserSettingsIframe(eventSource);
    expect(activeCustomUserSettingsIframe.contentWindow).toEqual(eventSource);
    const eventSource2 = { contentWindow3: 'contentWindow3' };
    activeCustomUserSettingsIframe = UserSettingsHelper.findActiveCustomUserSettingsIframe(eventSource2);
    expect(activeCustomUserSettingsIframe).toEqual(null);
  });
});
