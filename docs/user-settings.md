<!-- meta
{
  "node": {
    "label": "User settings",
    "category": {
      "label": "Navigation",
      "collapsible": true
    },
    "metaData": {
      "categoryPosition": 3,
      "position": 3
    }
  }
}
meta -->

# User Settings

<!-- add-attribute:class:warning -->

> **NOTE:** User Settings functionality was first introduced in Luigi 1.8.0, so it is not available for older versions.

This document explains how to configure a User Settings dialog in the top navigation of Luigi.

  - [Overview](#overview)
  - [Example](#example)
  - [Parameters](#parameters)
  - [Write a custom editor](#write-a-custom-editor)
  - [Customize the user settings dialog](#customize-the-user-settings-dialog)
  - [Override default read and store functionality](#override-default-read-and-store-functionality)

## Overview

![User settings dialog](/assets/usersettingsdialog.png)

Luigi allows you to display a user settings dialog and to manage user data, through defining a user settings schema. The schema is defined in a `userSettingGroups` object.

<!-- add-attribute:class:warning -->

**NOTE:** The user settings dialog can not be opened from the profile menu if the profile section in the top navigation bar is not configured. For more information see the [profile configuration](navigation-advanced.md#profile).

![User settings in profile menu](/assets/usersettings-in-profile.png)

## Example

The following example describes how user settings and a corresponding userSettingGroups configuration could look like:

<!-- fiddle-preset:userSettings -->
```javascript
settings:{
...
},
navigation:{
...
},
userSettings:{
  userSettingGroups:{
    account: {
      label: 'Account',
      sublabel: 'account',
      icon: 'account',
      title: 'Account Settings',
      initials: 'AA',
      settings: {
        name: { type: 'string', label: 'Name' , isEditable: true},
        checkbox: { type: 'boolean', label: 'Checkbox', isEditable: true },
        enum:
          {
            type: 'enum',
            label: 'Label',
            options: ['option1', 'option2', 'option3', 'option3'],
            description: 'Description'
          },
          enum2:
          {
            type: 'enum',
            label: 'Label',
            options: ['value1' 'value2'],
            style: 'button',
            description: 'Description'
          }
      }
    }
  }
}
```

## Parameters

These parameters used in the example above allow you to configure the items in the user settings menu:

#### label

- **type** string (optional)
- **description** defines the label for the left-side navigation entry.

#### sublabel

- **type** string (optional)
- **description** defines the sublabel for the left-side navigation entry.

#### icon

- **type** string (optional)
- **description** name of the icon, without the `sap-icon--` prefix. It is also possible to use an image instead of an icon by specifying its path.  

#### initials

- **type** string (optional)
- **description** the initials are displayed in the account section in case the `icon:` attribute is not defined, or if the icon link is broken or unreachable. 

#### iconClassAttribute

- **type** string (optional)
- **description** adds specified class(es) to the icon container. Custom classes help to style the image which can be set under the **icon** attribute above. 

#### title

- **type** string (optional)
- **description** title of the user settings group. It will be displayed as a header in the editor area.

#### viewURL

- **type** string (optional)
- **description** points to a custom micro frontend. It is possible to not use Luigi's user settings editor. Instead, you can [write your own](#write-a-custom-editor) editor micro frontend.
  In that case, the micro frontend will be displayed in the editor area.

#### settings

- **type** object (optional)
- **description** has objects of settings for the corresponding user group.
  `Key` of each setting object will be the key in the stored user settings with the corresponding value.
  The attributes to define a setting objects are:
- **attributes**

  - **type** (mandatory) is a string and defines the data type of this setting. It could be `string`, `boolean` or `enum`. If data type `string` is defined, an input field will be rendered in the editor area. If this property is set to `boolean`, a switcher will be rendered. If `enum` type is set, it will be rendered as a dropdown by default.
    It is possible to define the style of how `boolean` and `enum` are generated, see `style` attribute.

  - **label** (optional) is a string and the label of the setting.
  - **isEditable** (optional) is a boolean and by default `true`. If it is set to `false` the setting is not editable.
  - **placeholder** (optional) is a string and by default `null`. If it is set to `value` the placeholder is displaying the `value` the other hand no data.
  - **style** (optional) is a string and can be defined for the data types `boolean` and `enum`. Boolean will be rendered as switcher by default and it can be changed to `checkbox`. Enum will be rendered as dropdown by default and it can be changed to `button`, which means it will be rendered as a `segmented button`.
  - **options** is an array of options. It is mandatory and necessary if the data type is `enum`. It can be entries of primitive data types like string or integer or entries of objects.
    In this case the objects need `value` and `label` as key.

```javascript
language: {
  type: 'enum',
  label: 'Language and Region',
  options: [
    { value: 'de', label: 'German' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'es', label: 'Spanish' }
  ]
}
```

#### webcomponent

- **type** boolean/object (optional)
- **description** enables usage of webcomponent instead of a custom micro frontend. It is possible to use both local and external webcomponents what needs to be specified in [`viewURL`](#viewurl) parameter.
  In case of external URL, the `validWebcomponentUrls` parameter has to be added to [navigation configuration](https://docs.luigi-project.io/docs/navigation-parameters-reference?section=validwebcomponenturls).

```javascript
webcomponent: {
  selfRegistered: false
}
```

## Write a custom editor

This user setting group will be displayed by the default editor, under the form of a user setting dialog.
It is possible to write a custom editor using a custom micro frontend. In that case, the `userSettingGroup` needs a `viewUrl` property with an URL to the micro frontend.
The micro frontend has to register the `addInitListener` from the Luigi Client. The stored user settings data object is part of the context object which comes with the init and update listener (`context.userSettingsData`).
The micro frontend gets only the stored data object which belongs to its `userSettingGroup`.
To update the user settings data (not store!) a special custom message has to be send to the Luigi Core.
The custom message sends the `userSettingsData` object with the reserved `id: 'luigi.updateUserSettings'`, for example:

```javascript
let luigiContext={};
window.LuigiClient.addInitListener((context, origin) => {
    luigiContext=context;
)};
function onThemeChange(value){
    luigiContext.userSettingsData.theme = value;
    window.LuigiClient.sendCustomMessage({ id: 'luigi.updateUserSettings', data: luigiContext.userSettingsData });
};
```

> **NOTE:** This is a very simple example to get the user settings data from the context and update the changed user settings data via a custom message.

## Customize the user settings dialog

These parameters can be used to configure the appearance of the user settings menu in Luigi. You may also want to take a look at the [Luigi Core API](luigi-core-api.md) for additional options.

- **userSettingsProfileMenuEntry.label** defines the profile navigation entry. By default it is `Settings`.
- **userSettingsProfileMenuEntry.icon** defines the profile navigation entry icon. By default it is SAP icon `settings`.

- **userSettingsDialog.dialogHeader** defines user settings dialog header. By default it is `User Settings`.
- **userSettingsDialog.saveBtn** defines user settings dialog save button. By default it is `Save`.
- **userSettingsDialog.dismissBtn** defines user settings dialog dismiss button. By default it is `Dismiss`.

## Override default read and store functionality

By implementing the `storeUserSettings` and `readUserSettings` the default mechanism can be overriden.

- **storeUserSettings** if this function is implemented, the default mechanism will be overridden and you can choose a custom storage to store the user settings object (for example, using a custom third party Rest API). The function should return a promise and takes two parameters. The first one is the user settings which will be stored. The second one is the previous stored user settings. On resolve, the user settings dialog will be closed.
  If an error appears, you have the possibility to close the user settings dialog by adding a `closeDialog` boolean flag to the error object. In addition, you can implement a `message` to display the error on the browser console log.

- **readUserSettings** if this function is implemented, the default mechanism will be overridden and you can choose a custom storage to read the user settings object: the function should return a promise. The resolve function gets the user settings object as parameter.
  If an error appears, you have the possibility to close the user settings dialog by adding a `closeDialog` boolean flag to the error object to close it. In addition, you can implement a `message` to display the error on the browser console log.

```javascript
userSettings:{
  userSettingGroups:{
    ...
  },
  storeUserSettings: (obj, previous) => {
    return new Promise((resolve, reject) => {
      if (JSON.stringify(obj) !== JSON.stringify(previous)) {
        const settings = {
          header: "Confirmation",
          body: "Are you sure you want to do this?",
          buttonConfirm: "Yes",
          buttonDismiss: "No"
        }
        Luigi
          .ux()
          .showConfirmationModal(settings).then(() => {
            sessionStorage.setItem('myUserSettings', JSON.stringify(obj));
            resolve();
          }).catch(() => {
            reject({ closeDialog: true, message: 'error ' });
          });
      } else {
        resolve();
      }
    });
  },
  readUserSettings: () => {
    return new Promise((resolve, reject) => {
      try {
        if (sessionStorage.getItem('myUserSettings')) {
          resolve(JSON.parse(sessionStorage.getItem('myUserSettings')));
        } else {
          resolve(JSON.parse(sessionStorage.getItem('myUserSettings')));
        }
      } catch {
        reject({ closeDialog: true, message: 'some error' });
      }
    })
  }
}
```

<!-- document the schema-->
