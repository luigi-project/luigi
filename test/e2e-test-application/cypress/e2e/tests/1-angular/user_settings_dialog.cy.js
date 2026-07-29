describe('Navigation', () => {
  const clearStorage = () => cy.clearLocalStorage('luigi.preferences.userSettings');

  const openSettingsDialogBox = () => {
    //Click on User Icon (top menu right)
    cy.get('[data-testid="luigi-topnav-profile-btn"]').click();

    //Click on Setting link and open Dialog Box
    cy.get('[data-testid="settings-link"]').click();

    //Check Dialog is open
    cy.get('.lui-usersettings-dialog').should('exist');

    //Check we have 6 left bar items
    cy.get('.lui-us-list').find('[data-testid="us-navigation-item"]').should('have.length', 7);
  };

  const saveSettings = () => {
    //Check save button and click
    cy.get('.lui-usersettings-dialog [data-testid="lui-us-saveBtn"]').click();

    //Check settings dialog box is closed...
    cy.get('.lui-usersettings-dialog').should('not.exist');
  };

  const closeSettings = () => {
    //Check cancel button and click
    cy.get('.lui-usersettings-dialog [data-testid="lui-us-dismissBtn"]').click();

    //Check settings dialog box is closed...
    cy.get('.lui-usersettings-dialog').should('not.exist');
  };

  beforeEach(() => {
    clearStorage();
    cy.visitLoggedIn('/');
    openSettingsDialogBox();
  });

  it('check iconClassAttribute', () => {
    cy.get('[data-testid="us-navigation-item"]')
      .eq(0) // User Account
      .get('span')
      .should('have.class', 'fd-avatar fd-avatar--s fd-avatar--circle fd-avatar--thumbnail lui-avatar-space');

    cy.get('[data-testid="us-navigation-item"]')
      .eq(1) // Language & Region
      .get('span')
      .should('have.class', 'fd-image--s fd-list__thumbnail'); // default value, no iconClassAttribute specified

    cy.get('[data-testid="us-navigation-item"]')
      .eq(2) // Privacy
      .get('span')
      .should('have.class', 'SAP-icon-iconClassAttribute-Test');

    cy.get('[data-testid="us-navigation-item"]')
      .eq(3) // Theming
      .get('span')
      .should('have.class', 'fd-list__thumbnail'); // default value, no iconClassAttribute specified
  });

  describe('User Account Configuration', () => {
    const setting_name = 'name_' + new Date().getTime();
    const setting_date_format = 'df_' + new Date().getTime();
    const setting_privacy_policy = 'privacy_policy_' + new Date().getTime();

    it('Fill Account, Language and Region, Privacy, should have placeholder', () => {
      //Click on User Account
      cy.get('[data-testid="us-navigation-item"]').eq(0).click();

      //Check User Account is selected
      cy.get('[data-testid="us-navigation-item"]').eq(0).should('have.class', 'is-selected');

      //Check Name Input has placeholder
      cy.get('[data-testid="lui-us-input0"]').invoke('attr', 'placeholder').should('contain', 'Name');

      //Click on Language & Region
      cy.get('[data-testid="us-navigation-item"]').eq(1).click();

      //Check Language & Region is selected
      cy.get('[data-testid="us-navigation-item"]').eq(1).should('have.class', 'is-selected');

      //Check Language and Region Dropdown wth arrow should exist
      cy.get('[data-testid="lui-us-enum-0"]').should('exist');
      cy.get('.lui-activate-dropdown').should('exist');

      //Check Date Format Input exist
      cy.get('[data-testid="lui-us-input1"]').should('exist');

      //Check Date Format Input has placeholder
      cy.get('[data-testid="lui-us-input1"]').invoke('attr', 'placeholder').should('contain', 'DD-MM-YYYY');

      //Click on Privacy
      cy.get('[data-testid="us-navigation-item"]').eq(2).click();

      //Click on Privacy
      cy.get('[data-testid="us-navigation-item"]').eq(2).should('have.class', 'is-selected');

      //Check Private Policy Input has placeholder
      cy.get('[data-testid="lui-us-input0"]').invoke('attr', 'placeholder').should('contain', '...');

      //Close settings
      closeSettings();
    });

    it('Fill Account and save; reopen and check saved value', () => {
      //Click on User Account
      cy.get('[data-testid="us-navigation-item"]').eq(0).click();

      //Check User Account is selected
      cy.get('[data-testid="us-navigation-item"]').eq(0).should('have.class', 'is-selected');

      //Check Name Input field and type a new name
      cy.get('[data-testid="lui-us-input0"]').type(setting_name);

      //Email Input field should be disabled and a usual text
      cy.get('[data-testid="lui-us-input1"]').should('have.class', 'fd-text').should('have.attr', 'disabled');

      cy.get('[data-testid="lui-us-label-switch_checkbox"]').click();

      //Check Checkbox is checked
      cy.get('[data-testid="lui-us-checkbox-switch_checkbox"]').should('be.checked');

      //Save Settings
      saveSettings();

      //Re-open Setting Dialog Box
      openSettingsDialogBox();

      //Check Name Input field and type a new name
      cy.get('[data-testid="lui-us-input0"]').should('have.value', setting_name);

      //Check Checkbox is checked
      cy.get('[data-testid="lui-us-checkbox-switch_checkbox"]').should('be.checked');

      //Close settings
      closeSettings();
    });

    it('Fill Language and Region and save; reopen and check saved values', () => {
      //Click on Language & Region
      cy.get('[data-testid="us-navigation-item"]').eq(1).click();

      //Check Language & Region is selected
      cy.get('[data-testid="us-navigation-item"]').eq(1).should('have.class', 'is-selected');

      //Check Language & Region Input field exist
      cy.get('[data-testid="lui-us-input0"]').should('exist');

      //Open button to show enumeration list options
      cy.get('.lui-usersettings-content .fd-page__content .fd-form-item').eq(0).find('.lui-activate-dropdown').click();

      //Check we should have 4 options
      cy.get('.lui-usersettings-content .fd-page__content .fd-form-item')
        .eq(0)
        .find('.fd-list--dropdown .fd-list__item')
        .children()
        .should('have.length', 4);

      //Click on Français list item
      cy.get('[data-testid="lui-us-option0_2"]').click();

      //Check Placeholder of input field is Français
      cy.get('[data-testid="lui-us-input0"]').should('contain', 'Français');

      //Open button to show enumeration list options
      cy.get('.lui-usersettings-content .fd-page__content .fd-form-item').eq(0).find('.lui-activate-dropdown').click();

      //Choose option one above French
      cy.get('[data-testid="lui-us-enum-0"]').type('{upArrow}').type('{enter}');

      //Check Placeholder of input field is English (en)
      cy.get('[data-testid="lui-us-input0"]').should('contain', 'English (en)');

      //Choose option one below English
      cy.get('[data-testid="lui-us-enum-0"]').type('{downArrow}').type('{enter}');

      //Confirm with keyboard: Enter
      cy.get('.fd-popover__body--dropdown-fill').type('{enter}');

      //Check Date Formant Input field and type a new format
      cy.get('[data-testid="lui-us-input1"]').type(setting_date_format);

      //Save Settings
      saveSettings();

      //Re-open Setting Dialog Box
      openSettingsDialogBox();

      //Click on Language & Region (left menu)
      cy.get('[data-testid="us-navigation-item"]').eq(1).click();

      //Check Placeholder of input field is Français
      cy.get('[data-testid="lui-us-input0"]').should('contain', 'Français');

      //Check Name Input field and type a new name
      cy.get('[data-testid="lui-us-input1"]').should('have.value', setting_date_format);

      //Close settings
      closeSettings();
    });

    it('Fill Privacy and save; reopen and check saved value', () => {
      //Click on Privacy
      cy.get('[data-testid="us-navigation-item"]').eq(2).click();

      //Check Private Policy Input field exist and placeholder is
      cy.get('[data-testid="lui-us-input0"]').type(setting_privacy_policy);

      //Check Time Format has two buttons with no selected class
      cy.get('.lui-usersettings-content .enum-buttons-container-time .lui-fd-enum-button')
        .eq(0)
        .should('not.have.class', 'fd-button--emphasized');
      cy.get('.lui-usersettings-content .enum-buttons-container-time .lui-fd-enum-button')
        .eq(1)
        .should('not.have.class', 'fd-button--emphasized');

      //Click Time Format 12h
      cy.get('.lui-usersettings-content .enum-buttons-container-time .lui-fd-enum-button').eq(0).click();

      //Check Time Format 12h is selected
      cy.get('.lui-usersettings-content .enum-buttons-container-time .lui-fd-enum-button')
        .eq(0)
        .should('have.class', 'is-selected');

      //Save Settings
      saveSettings();

      //Re-open Setting Dialog Box
      openSettingsDialogBox();

      //Click on Privacy
      cy.get('[data-testid="us-navigation-item"]').eq(2).click();

      //Check Private Policy Input field has saved value
      cy.get('[data-testid="lui-us-input0"]').should('have.value', setting_privacy_policy);

      //Check Time Format 12h is selected
      cy.get('.lui-usersettings-content .enum-buttons-container-time button').eq(0).should('have.class', 'is-selected');

      //Close settings
      closeSettings();
    });

    it('Fill Theming (which is custom mf) and save; reopen and check saved value', () => {
      let $iframeBody;
      //Click on theming
      cy.get('[data-testid="us-navigation-item"]').eq(3).click();
      //Check if iframe is loaded and have a red button
      cy.getIframeBody({}, 0, '.iframeUserSettingsCtn').then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('Red').should('have.class', 'red');
        cy.wrap($iframeBody).contains('Red').should('not.have.class', 'active');
        cy.wrap($iframeBody).contains('Red').click();
      });
      saveSettings();
      openSettingsDialogBox();
      //Click on theming
      cy.get('[data-testid="us-navigation-item"]').eq(3).click();
      //Check if iframe has a red button with a active class
      cy.getIframeBody({}, 0, '.iframeUserSettingsCtn').then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('Red').should('have.class', 'active');
      });
    });

    it('Check custom mf without meta data defined in schema', () => {
      let $iframeBody;
      //click on custom
      cy.get('[data-testid="us-navigation-item"]').eq(4).click();
      //check if iframe is rendered also there are no meta data set in config.
      cy.getIframeBody({}, 0, '.iframeUserSettingsCtn').then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('Red').should('have.class', 'red');
      });
    });

    it('Ctx update after storing user settings data using custom messages', () => {
      let $iframeBody;
      cy.get('[data-testid="us-navigation-item"]').eq(4).click();
      cy.getIframeBody({}, 0, '.iframeUserSettingsCtn').then((result) => {
        $iframeBody = result;
        cy.wrap($iframeBody).contains('Yellow').should('have.class', 'yellow');
        cy.wrap($iframeBody).contains('Yellow').should('not.have.class', 'active');
        cy.wrap($iframeBody).contains('Yellow').click();
        cy.wrap($iframeBody).contains('Yellow').should('have.class', 'active');
      });
    });

    it('Should hide iframe container and show WC container', () => {
      cy.get('[data-testid="us-navigation-item"]').eq(5).click();
      cy.get('.iframeUserSettingsCtn').should('not.be.visible');
      cy.get('.wcUserSettingsCtn')
        .should('be.visible')
        .then((ctn) => {
          cy.wrap(ctn).children().first().shadow().find('p').should('contain.text', 'WC says hello world!');
        })
    });

    it('Test custom usersettings webcomponent', () => {
      cy.get('[data-testid="us-navigation-item"]').eq(6).click();
      //Check custom3 webcomponent
      cy.get('[data-testid="us-navigation-item"]').eq(6).should('have.class', 'is-selected');
      cy.get('.wcUserSettingsCtn')
        .should('be.visible')
        .then((ctn) => {
          cy.wrap(ctn)
            .children()
            .first()
            .shadow()
            .then((shadow) => {
              cy.wrap(shadow).find('#green').should('not.have.class', 'active');
              cy.wrap(shadow).find('#red').should('not.have.class', 'active');
              cy.wrap(shadow).find('#green').click();
              cy.wrap(shadow).find('#green').should('have.class', 'active');
            });
        });

      //Save Settings
      saveSettings();

      //Re-open Setting Dialog Box
      openSettingsDialogBox();

      cy.get('[data-testid="us-navigation-item"]').eq(6).click();
      cy.get('.wcUserSettingsCtn')
        .should('be.visible')
        .then((ctn) => {
          cy.wrap(ctn)
            .children()
            .first()
            .shadow()
            .then((shadow) => {
              cy.wrap(shadow).find('#green').should('have.class', 'active');
              cy.wrap(shadow).find('#red').should('not.have.class', 'active');
              cy.wrap(shadow).find('#red').click();
              cy.wrap(shadow).find('#green').should('not.have.class', 'active');
              cy.wrap(shadow).find('#red').should('have.class', 'active');
            });
          });

      //Save Settings
      saveSettings();

      //Re-open Setting Dialog Box
      openSettingsDialogBox();

      cy.get('[data-testid="us-navigation-item"]').eq(6).click();
      cy.get('.wcUserSettingsCtn')
        .should('be.visible')
        .then((ctn) => {
          cy.wrap(ctn)
            .children()
            .first()
            .shadow()
            .then((shadow) => {
              cy.wrap(shadow).find('#red').should('have.class', 'active');
              cy.wrap(shadow).find('#green').should('not.have.class', 'active');
            });
          });
    });

    it('Test userSettingGroupKey', () => {
      cy.getAllLocalStorage().then((localStorage) => {
        var userSettingsString = localStorage["http://localhost:4200"]["luigi.preferences.userSettings"];
        expect(userSettingsString).to.be.undefined;

        // custom 3
        cy.get('[data-testid="us-navigation-item"]').eq(6).click();
        // click red button
        cy.get('.wcUserSettingsCtn')
          .should('be.visible')
          .then((ctn) => {
            cy.wrap(ctn).children().first().shadow().find('#red').click();

            // Save Settings
            saveSettings();

            cy.getAllLocalStorage().then((localStorage) => {
              var userSettingsString = localStorage["http://localhost:4200"]["luigi.preferences.userSettings"];
              expect(userSettingsString).to.include('"custom3":{"themeWC":"red"}');
            });
          })
      });
    });
  });
});
