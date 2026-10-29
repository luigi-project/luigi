let userSettingsPreset = `
Luigi.setConfig({
    navigation: {
        // The profile menu (where the user settings entry lives) only renders
        // when auth is enabled or navigation.profile is set.
        profile: {
            items: []
        },
        nodes: [{
            pathSegment: 'home',
            label: 'h',
            hideFromNav: true,
            children: [{
                pathSegment: 'overview',
                label: 'Overview',
                icon: 'home',
                viewUrl: '/examples/microfrontends/multipurpose.html',
                context: {
                    title: 'User Settings',
                    content: 'Open the profile menu at the top right and choose <b>User Settings</b>. Luigi saves the values in localStorage under <code>luigi.preferences.userSettings</code>.'
                }
            }]
        }]
    },
    routing: {
        useHashRouting: true
    },
    settings: {
        header: {
            logo: 'img/luigi.svg',
            title: 'Luigi Fiddle'
        }
    },
    userSettings: {
        userSettingsProfileMenuEntry: {
            label: 'User Settings',
            icon: 'user-settings'
        },
        userSettingsDialog: {
            dialogHeader: 'User Settings',
            saveBtn: 'Save',
            dismissBtn: 'Cancel'
        },
        userSettingGroups: {
            account: {
                label: 'Account',
                sublabel: 'account',
                icon: 'account',
                title: 'Account Settings',
                initials: 'AA',
                settings: {
                    name: {
                        type: 'string',
                        label: 'Name',
                        isEditable: true
                    },
                    checkbox: {
                        type: 'boolean',
                        label: 'Checkbox',
                        style: 'checkbox',
                        isEditable: true
                    },
                    enum: {
                        type: 'enum',
                        label: 'Label',
                        options: ['option1', 'option2', 'option3'],
                        description: 'Description'
                    },
                    enum2: {
                        type: 'enum',
                        label: 'Label',
                        options: ['value1', 'value2'],
                        style: 'button',
                        description: 'Description'
                    }
                }
            }
        }
    }
});
`;
export default userSettingsPreset;