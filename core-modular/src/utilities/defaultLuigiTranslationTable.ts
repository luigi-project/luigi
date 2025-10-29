const defaultLuigiInternalTranslationTable: Record<string, any> = {
  luigi: {
    button: {
      confirm: 'Yes',
      dismiss: 'No'
    },
    confirmationModal: {
      body: 'Are you sure you want to do this?',
      header: 'Confirmation'
    },
    navigation: {
      up: 'Up'
    },
    notExactTargetNode: 'Could not map the exact target node for the requested route {route}.',
    requestedRouteNotFound: 'Could not find the requested route {route}.',
    unsavedChangesAlert: {
      body: 'Unsaved changes will be lost. Do you want to continue?',
      header: 'Unsaved changes detected'
    }
  }
};

export const defaultLuigiTranslationTable = defaultLuigiInternalTranslationTable;
