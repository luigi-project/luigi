/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
export default class extends HTMLElement {
  constructor() {
    super();

    this.ctx = {};

    const template = document.createElement('template');
    template.innerHTML = `<section><p>Hello World!</p></section>`;

    const pageTitle = document.createElement('template');
    pageTitle.innerHTML = `<h1 id="title">WC based Container</h1>`;

    const templateBtn = document.createElement('template');
    templateBtn.innerHTML = '<button id="aButton">Click me!</button>';

    const showAlertBtn = document.createElement('template');
    showAlertBtn.innerHTML = '<button id="showAlert">showAlert</button>';

    const templateBtn2 = document.createElement('template');
    templateBtn2.innerHTML = '<button id="publishEvent">Publish event</button>';

    const addNodeParamsBtn = document.createElement('template');
    addNodeParamsBtn.innerHTML = '<button id="addNodeParams">add node params</button>';

    const getNodeParamsBtn = document.createElement('template');
    getNodeParamsBtn.innerHTML = '<button id="getNodeParams">get node params</button>';

    const setAnchorBtn = document.createElement('template');
    setAnchorBtn.innerHTML = '<button id="setAnchor">setAnchor</button>';

    const setLocaleBtn = document.createElement('template');
    setLocaleBtn.innerHTML = '<button id="setCurrentLocale">setCurrentLocale</button>';

    const getCoreSearchParamsBtn = document.createElement('template');
    getCoreSearchParamsBtn.innerHTML = '<button id="coreSearchParams">getCoreSearchParams</button>';

    const addCoreSearchParamsBtn = document.createElement('template');
    addCoreSearchParamsBtn.innerHTML = '<button id="addCoreSearchParams">addCoreSearchParams</button>';

    const getPathParamsBtn = document.createElement('template');
    getPathParamsBtn.innerHTML = '<button id="getPathParams">getPathParams</button>';

    const getClientPermissionsBtn = document.createElement('template');
    getClientPermissionsBtn.innerHTML = '<button id="getClientPermissions">getClientPermissions</button>';

    const empty = document.createElement('template');
    empty.innerHTML = `<section><p>Test-----!</p><br/><br/></section>`;

    const getUserSettingsBtn = document.createElement('template');
    getUserSettingsBtn.innerHTML = '<button id="getUserSettings">getUserSettings</button>';

    const getAnchorBtn = document.createElement('template');
    getAnchorBtn.innerHTML = '<button id="getAnchor">getAnchor</button>';

    const setViewGroupDataBtn = document.createElement('template');
    setViewGroupDataBtn.innerHTML = '<button id="setViewGroupData">setViewGroupData</button>';

    const getDirtyStatusBtn = document.createElement('template');
    getDirtyStatusBtn.innerHTML = '<button id="getDirtyStatus">getDirtyStatus</button>';

    const setDirtyStatusBtn = document.createElement('template');
    setDirtyStatusBtn.innerHTML = '<button id="setDirtyStatus">setDirtyStatus</button>';

    const updateContextBtn = document.createElement('template');
    updateContextBtn.innerHTML = '<button id="updateContext">updateContext</button>';

    const getCurrentRouteBtn = document.createElement('template');
    getCurrentRouteBtn.innerHTML = '<button id="getCurrentRoute">getCurrentRoute</button>';

    const uxManagerMultipleRequestsBtn = document.createElement('template');
    uxManagerMultipleRequestsBtn.innerHTML = `<button id="uxManagerManyRequests">uxManager().closeUserSettings,
    openUserSettings,
    collapseLeftSideNav,
    setDocumentTitle,
    getDocumentTitle,
    removeBackdrop,
    hideAppLoadingIndicator,
    </button>`;

    const linkManagerChainedFunctionsRequestsBtn = document.createElement('template');
    linkManagerChainedFunctionsRequestsBtn.innerHTML = `<button id="linkManagerChainRequests">
    linkManager().fromClosestContext,
    fromContext,
    fromVirtualTreeRoot,
    withParams().navigate()
    </button>`;

    const linkManagerUpdateTopPathExistsBackBtn = document.createElement('template');
    linkManagerUpdateTopPathExistsBackBtn.innerHTML = `<button id="linkManagerUpdateTopPathExistsBack">linkManager().
    hasBack(), updateTopNavigation(), goBack(), pathExists()
    </button>`;

    const updateModalPathBtn = document.createElement('template');
    updateModalPathBtn.innerHTML = '<button id="updateModalPathBtn">lm.updateModalPathInternalNavigation</button>';

    const openAsModalBtn = document.createElement('template');
    openAsModalBtn.innerHTML = '<button id="openAsModalBtn">lm.openAsModal</button>';

    const updateModalSettingsBtn = document.createElement('template');
    updateModalSettingsBtn.innerHTML = '<button id="updateModalSettingsBtn">lm.updateModalSettings</button>';

    const openAsDrawerBtn = document.createElement('template');
    openAsDrawerBtn.innerHTML = '<button id="openAsDrawerBtn">lm.openAsDrawer</button>';

    const openAsSplitviewBtn = document.createElement('template');
    openAsSplitviewBtn.innerHTML = '<button id="openAsSplitviewBtn">lm.openAsSplitview</button>';

    const navigateBtn = document.createElement('template');
    navigateBtn.innerHTML = '<button id="navigateBtn">navigate</button>';

    const alertBtn = document.createElement('template');
    alertBtn.innerHTML = '<button id="alertBtn">uxManager.showAlert()</button>';

    const navigateToIntentBtn = document.createElement('template');
    navigateToIntentBtn.innerHTML = '<button id="navigateToIntent">navigateToIntent</button>';

    const confirmationModalBtn = document.createElement('template');
    confirmationModalBtn.innerHTML = '<button id="confirmationModal">showConfirmationModal</button>';

    const showLoadingBtn = document.createElement('template');
    showLoadingBtn.innerHTML = '<button id="showLoadingBtn">uxManager.showLoadingIndicator()</button>';

    const hideLoadingBtn = document.createElement('template');
    hideLoadingBtn.innerHTML = '<button id="hideLoadingBtn">uxManager.hideLoadingIndicator()</button>';

    const customMessageDiv = document.createElement('template');
    customMessageDiv.innerHTML = '<div id="customMessageDiv">Received Custom Message: </div>';

    const closeAlertResponse = document.createElement('template');
    closeAlertResponse.innerHTML = '<span id="closeAlertResponse"></span>';

    this._shadowRoot = this.attachShadow({
      mode: 'open',
      delegatesFocus: false
    });

    this._shadowRoot.appendChild(pageTitle.content.cloneNode(true));
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._shadowRoot.appendChild(templateBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(templateBtn2.content.cloneNode(true));
    this._shadowRoot.appendChild(showAlertBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(addNodeParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getNodeParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(setAnchorBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(setLocaleBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getCoreSearchParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(addCoreSearchParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getPathParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getClientPermissionsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getUserSettingsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getAnchorBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getDirtyStatusBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(setDirtyStatusBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(updateContextBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(uxManagerMultipleRequestsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(linkManagerChainedFunctionsRequestsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(updateModalPathBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(openAsModalBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(updateModalSettingsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(openAsDrawerBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(openAsSplitviewBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(navigateBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(alertBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(linkManagerUpdateTopPathExistsBackBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(setViewGroupDataBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getCurrentRouteBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(navigateToIntentBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(confirmationModalBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(showLoadingBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(hideLoadingBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(customMessageDiv.content.cloneNode(true));
    this._shadowRoot.appendChild(empty.content.cloneNode(true));
    this._shadowRoot.appendChild(closeAlertResponse.content.cloneNode(true));

    this.$showAlert = this._shadowRoot.querySelector('#showAlert');
    this.$showAlert.addEventListener('click', () => {
      let dt = new Date();
      let time = dt.getMilliseconds() + '';
      time = time.substr(time.length - 3);
      const settings = {
        text: 'This is an alert message {goToHome} with a {relativePath}. You can go to {goToOtherProject}. {neverShowItAgain}',
        type: 'info',
        links: {
          goToHome: { text: 'homepage', url: '/overview' },
          goToOtherProject: { text: 'other project', url: '/projects/pr2' },
          relativePath: { text: 'relative hide side nav', url: 'hideSideNav' },
          neverShowItAgain: {
            text: "Don't show this again",
            dismissKey: 'neverShowItAgain'
          }
        },
        closeAfter: 300000
      };
      this.LuigiClient.uxManager()
        .showAlert(settings)
        .then((param) => {
          this._shadowRoot.querySelector('#closeAlertResponse').innerHTML = 'Callback called on wc ' + param;
          const span = document.createElement('span');
          span.setAttribute('id', 'callbackCloseAlert');
          span.innerHTML = 'Callback called on wc ' + param;
          document.body.appendChild(span);
        });
    });

    this.$paragraph = this._shadowRoot.querySelector('p');
    this.$button = this._shadowRoot.querySelector('#aButton');
    this.$button.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.uxManager().showAlert({
          text: 'LuigiClient.getCurrentLocale()=' + this.LuigiClient.getCurrentLocale(),
          type: 'info'
        });

        const featureToggles = this.LuigiClient.getActiveFeatureToggles();
        this.LuigiClient.uxManager().showAlert({
          text: 'LuigiClient.getActiveFeatureToggles()=' + featureToggles + ',' + featureToggles.length,
          type: 'info'
        });

        this.LuigiClient.uxManager().showAlert({
          text: 'LuigiClient.uxManager().getCurrentTheme()=' + this.LuigiClient.uxManager().getCurrentTheme(),
          type: 'info'
        });
      }
    });
    this._shadowRoot.querySelector('#publishEvent').addEventListener('click', () => {
      if (this.LuigiClient) {
        // send a custom event (similar to sendCustomMessage)
        this.LuigiClient.publishEvent(new CustomEvent('sendMSG', { detail: 'My Custom Message from Microfrontend' }));
      }
    });

    this.$addNodeParamsBtn = this._shadowRoot.querySelector('#addNodeParams');
    this.$addNodeParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.addNodeParams({ Luigi: 'rocks' }, true);
      }
    });
    this.$getNodeParamsBtn = this._shadowRoot.querySelector('#getNodeParams');
    this.$getNodeParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        let nodeParams = this.LuigiClient.getNodeParams(false);
        this.LuigiClient.uxManager().showAlert({
          text: 'LuigiClient.getNodeParams()=' + JSON.stringify(nodeParams),
          type: 'info'
        });
      }
    });
    this.$setAnchorBtn = this._shadowRoot.querySelector('#setAnchor');
    this.$setAnchorBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.setAnchor('#myAnchor');
      }
    });

    this.$setLocaleBtn = this._shadowRoot.querySelector('#setCurrentLocale');
    this.$setLocaleBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.uxManager().setCurrentLocale('de');
      }
    });

    this.$coreSearchParamsBtn = this._shadowRoot.querySelector('#coreSearchParams');
    this.$coreSearchParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getCoreSearchParams()));
      }
    });

    this.$addCoreSearchParamsBtn = this._shadowRoot.querySelector('#addCoreSearchParams');
    this.$addCoreSearchParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.addCoreSearchParams({ luigi: 'rocks' });
      }
    });

    this.$getPathParamsBtn = this._shadowRoot.querySelector('#getPathParams');
    this.$getPathParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getPathParams()));
      }
    });

    this.$getClientPermissionsBtn = this._shadowRoot.querySelector('#getClientPermissions');
    this.$getClientPermissionsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getClientPermissions()));
      }
    });

    this.$getUserSettingsBtn = this._shadowRoot.querySelector('#getUserSettings');
    this.$getUserSettingsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        let userSettings = this.LuigiClient.getUserSettings();
        this.LuigiClient.uxManager().showAlert({
          text: 'LuigiClient.getUserSettings()=' + JSON.stringify(userSettings),
          type: 'info'
        });
      }
    });
    this.$getAnchorBtn = this._shadowRoot.querySelector('#getAnchor');
    this.$getAnchorBtn.addEventListener('click', () => {
      let getAnchor = this.LuigiClient.getAnchor();
      this.LuigiClient.uxManager().showAlert({
        text: 'LuigiClient.getAnchor()=' + JSON.stringify(getAnchor),
        type: 'info'
      });
    });

    this.$getDirtyStatusBtn = this._shadowRoot.querySelector('#getDirtyStatus');
    this.$getDirtyStatusBtn.addEventListener('click', () => {
      let dirtyStatus = this.LuigiClient.uxManager().getDirtyStatus();
      console.log('getDirtyStatus', dirtyStatus);
      this.LuigiClient.uxManager().showAlert({
        text: 'LuigiClient.uxManager().getDirtyStatus()=' + dirtyStatus,
        type: 'info'
      });
    });

    this.$setDirtyStatusBtn = this._shadowRoot.querySelector('#setDirtyStatus');
    this.$setDirtyStatusBtn.addEventListener('click', () => {
      this.LuigiClient.uxManager().setDirtyStatus(true);
    });

    this.$updateContextBtn = this._shadowRoot.querySelector('#updateContext');
    this.$updateContextBtn.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        text: `WC.ctx=${JSON.stringify(this.ctx)}`,
        type: 'info'
      });
    });

    this.$uxManagerManyRequests = this._shadowRoot.querySelector('#uxManagerManyRequests');
    this.$uxManagerManyRequests.addEventListener('click', () => {
      this.LuigiClient.uxManager().openUserSettings();
      this.LuigiClient.uxManager().closeUserSettings();
      this.LuigiClient.uxManager().removeBackdrop();
      this.LuigiClient.uxManager().collapseLeftSideNav();
      this.LuigiClient.uxManager().hideAppLoadingIndicator();
      this.LuigiClient.uxManager().setDocumentTitle('my-title');
      this.LuigiClient.uxManager().showAlert({
        text: 'LuigiClient.uxManager().getDocumentTitle()=' + this.LuigiClient.uxManager().getDocumentTitle(),
        type: 'info'
      });
    });

    this.$linkManagerChainRequests = this._shadowRoot.querySelector('#linkManagerChainRequests');
    this.$linkManagerChainRequests.addEventListener('click', () => {
      const path = 'hello-world-wc';
      const ctx = { ctx: 123 };

      this.LuigiClient.linkManager().fromContext(ctx).navigate();
      this.LuigiClient.linkManager().fromClosestContext().navigate(path);
      this.LuigiClient.linkManager().fromVirtualTreeRoot().navigate(path);
      this.LuigiClient.linkManager().fromParent(ctx).navigate(path);
      this.LuigiClient.linkManager().withParams('my-params').navigate(path);
      this.LuigiClient.linkManager().navigate(path);
      this.LuigiClient.uxManager().showAlert({
        text: 'LuigiClient.linkManager().navigate()',
        type: 'info'
      });
    });

    this.$updateModalPathBtn = this._shadowRoot.querySelector('#updateModalPathBtn');
    this.$updateModalPathBtn.addEventListener('click', () => {
      const history = true;
      const link = '/test/route';
      const modal = { title: 'Some modal' };

      if (this.LuigiClient) {
        this.LuigiClient.linkManager().updateModalPathInternalNavigation(link, modal, history);
      }
    });

    this.$openAsModalBtn = this._shadowRoot.querySelector('#openAsModalBtn');
    this.$openAsModalBtn.addEventListener('click', () => {
      this.LuigiClient.linkManager().openAsModal('openAsModal-wc', {
        title: 'Modal Title',
        size: 'm'
      });
    });
    this.$updateModalSettingsBtn = this._shadowRoot.querySelector('#updateModalSettingsBtn');
    this.$updateModalSettingsBtn.addEventListener('click', () => {
      this.LuigiClient.linkManager().updateModalSettings({
        title: 'Updated Modal Title',
        size: 'l'
      });
    });

    this.$openAsDrawerBtn = this._shadowRoot.querySelector('#openAsDrawerBtn');
    this.$openAsDrawerBtn.addEventListener('click', () => {
      this.LuigiClient.linkManager().openAsDrawer('openAsDrawer-wc', {
        size: 's'
      });
    });
    this.$openAsSplitviewBtn = this._shadowRoot.querySelector('#openAsSplitviewBtn');
    this.$openAsSplitviewBtn.addEventListener('click', () => {
      this.LuigiClient.linkManager().openAsSplitView('openAsSplitview-wc', {
        size: 'l'
      });
    });

    this.$alertBtn = this._shadowRoot.querySelector('#alertBtn');
    this.$alertBtn.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        text: 'showAlert test',
        type: 'info'
      });
    });

    this.$navigateBtn = this._shadowRoot.querySelector('#navigateBtn');
    this.$navigateBtn.addEventListener('click', () => {
      const path = 'AAA.html';
      const modalSettings = {
        title: 'Modal Title',
        size: 'm'
      };
      this.LuigiClient.linkManager().navigate(path, 0, true, modalSettings);
    });

    this.$showLoadingBtn = this._shadowRoot.querySelector('#showLoadingBtn');
    this.$showLoadingBtn.addEventListener('click', () => {
      this.LuigiClient.uxManager().showLoadingIndicator();
    });

    this.$hideLoadingBtn = this._shadowRoot.querySelector('#hideLoadingBtn');
    this.$hideLoadingBtn.addEventListener('click', () => {
      this.LuigiClient.uxManager().hideLoadingIndicator();
    });

    this.$linkManagerUpdateTopPathExistsBack = this._shadowRoot.querySelector('#linkManagerUpdateTopPathExistsBack');
    this.$linkManagerUpdateTopPathExistsBack.addEventListener('click', () => {
      this.LuigiClient.linkManager().updateTopNavigation();
      this.LuigiClient.linkManager()
        .pathExists()
        .then((result) => {
          console.log('PATH EXISTS');
          this.LuigiClient.uxManager().showAlert({
            text:
              'LuigiClient.linkManager().pathExists()=' +
              result +
              '\nthis.LuigiClient.linkManager().hasBack()=' +
              this.LuigiClient.linkManager().hasBack(),
            type: 'info'
          });
        });
      this.LuigiClient.linkManager().goBack({ goBackValue: 'some goBackValue' });
    });

    this.$setViewGroupData = this._shadowRoot.querySelector('#setViewGroupData');
    this.$setViewGroupData.addEventListener('click', () => {
      this.LuigiClient.setViewGroupData({ vg: 'some data' });
    });

    this.$getCurrentRoute = this._shadowRoot.querySelector('#getCurrentRoute');
    this.$getCurrentRoute.addEventListener('click', () => {
      this.LuigiClient.linkManager()
        .getCurrentRoute()
        .then((result) => {
          console.log(result);
          alert('current route: ' + result);
        });
    });

    this.$navigateToIntent = this._shadowRoot.querySelector('#navigateToIntent');
    this.$navigateToIntent.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.linkManager().navigateToIntent('Sales-settings');
        alert('navigated to: #?intent=Sales-settings');
      }
    });

    this.addEventListener('custom-message-id', (event) => {
      console.log('custom message received: ', event.detail);
      const customMessageDiv = this._shadowRoot.querySelector('#customMessageDiv');
      customMessageDiv.textContent = `Received Custom Message: ${event.detail.dataToSend}`;
      customMessageDiv.style = 'color: red;';
    });

    this.$confirmationModalBtn = this._shadowRoot.querySelector('#confirmationModal');
    this.$confirmationModalBtn.addEventListener('click', () => {
      const settings = {
        type: 'confirmation',
        header: 'Confirmation',
        body: 'Are you sure you want to do this?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No'
      };

      this.LuigiClient.uxManager()
        .showConfirmationModal(settings)
        .then(() => {
          this.LuigiClient.uxManager().showAlert({
            text: 'LuigiClient.uxManager().showConfirmationModal() - confirmed',
            type: 'info'
          });
        })
        .catch(() => {
          this.LuigiClient.uxManager().showAlert({
            text: 'LuigiClient.uxManager().showConfirmationModal() - dissmissed',
            type: 'warning'
          });
        });
    });
  }

  get context() {
    return this.ctx;
  }

  set context(ctx) {
    this.ctx = ctx;
    this.$paragraph.innerHTML = ctx.title;
  }
}
