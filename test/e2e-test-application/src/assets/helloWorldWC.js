export default class extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = `<section><p>Hello World!</p></section>`;

    const templateBtn = document.createElement('template');
    templateBtn.innerHTML = '<button id="clickme">Click me!</button>';

    const empty = document.createElement('template');
    empty.innerHTML = `<section><p>Test!</p><br/><br/></section>`;

    const setAnchorBtn = document.createElement('template');
    setAnchorBtn.innerHTML = `<button id="setAnchor">setAnchor</button>`;
    const getNodeParamsBtn = document.createElement('template');
    getNodeParamsBtn.innerHTML = `<button id="getNodeParams">getNodeParams</button>`;

    const addNodeParamsBtn = document.createElement('template');
    addNodeParamsBtn.innerHTML = `<button id="addNodeParams">addNodeParams</button>`;

    const getCoreSearchParamsBtn = document.createElement('template');
    getCoreSearchParamsBtn.innerHTML = '<button id="coreSearchParams">getCoreSearchParams</button>';

    const getPathParamsBtn = document.createElement('template');
    getPathParamsBtn.innerHTML = '<button id="getPathParams">getPathParams</button>';

    const getClientPermissionsBtn = document.createElement('template');
    getClientPermissionsBtn.innerHTML = '<button id="getClientPermissions">getClientPermissions</button>';

    const showLoadingIndicatorBtn = document.createElement('template');
    showLoadingIndicatorBtn.innerHTML = '<button id="showLoadingIndicator">showLoadingIndicator</button>';

    this._shadowRoot = this.attachShadow({
      mode: 'open',
      delegatesFocus: false
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this._shadowRoot.appendChild(templateBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(setAnchorBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getNodeParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(addNodeParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getCoreSearchParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getPathParamsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(getClientPermissionsBtn.content.cloneNode(true));
    this._shadowRoot.appendChild(showLoadingIndicatorBtn.content.cloneNode(true));

    for (let index = 0; index < 20; index++) {
      this._shadowRoot.appendChild(empty.content.cloneNode(true));
    }

    this.$paragraph = this._shadowRoot.querySelector('p');
    this.$button = this._shadowRoot.querySelector('#clickme');
    this.$button.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.uxManager().showAlert({
          text: 'Hello from uxManager in Web Component, Language:' + this.LuigiClient.getCurrentLocale(),
          type: 'info'
        });

        window.Luigi.featureToggles().setFeatureToggle('ft1');

        this.LuigiClient.uxManager().showAlert({
          text: 'Active feature toggles list: ' + this.LuigiClient.getActiveFeatureToggleList(),
          type: 'info'
        });

        this.LuigiClient.uxManager().showAlert({
          text: 'Active feature toggles: ' + this.LuigiClient.getActiveFeatureToggles(),
          type: 'info'
        });
      }
    });

    this.$button2 = this._shadowRoot.querySelector('#setAnchor');
    this.$button2.addEventListener('click', () => {
      this.LuigiClient.setAnchor('LuigiRocks');
    });
    this.$button3 = this._shadowRoot.querySelector('#getNodeParams');
    this.$button3.addEventListener('click', () => {
      let nodeParams = this.LuigiClient.getNodeParams();
      alert(JSON.stringify(nodeParams));
    });
    this.$button4 = this._shadowRoot.querySelector('#addNodeParams');
    this.$button4.addEventListener('click', () => {
      this.LuigiClient.addNodeParams({ Luigi: 'rocks' });
    });

    this.$coreSearchParamsBtn = this._shadowRoot.querySelector('#coreSearchParams');
    this.$coreSearchParamsBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getCoreSearchParams()));
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

    this.$showLoadingIndicatorBtn = this._shadowRoot.querySelector('#showLoadingIndicator');
    this.$showLoadingIndicatorBtn.addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.uxManager().showLoadingIndicator();
        setTimeout(() => {
          this.LuigiClient.uxManager().hideLoadingIndicator();
        }, 2000);
      }
    });
  }

  set context(ctx) {
    this.$paragraph.innerHTML = ctx.title;
  }
}
