export default class extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open', delegatesFocus: false });

    this._shadowRoot.innerHTML = `
      <section>
        <p>Hello World!</p>
        <button id="getCurrentRouteFromClosestContextBtn">getCurrentRouteFromClosestContext</button>
        <button id="getCurrentRouteFromContextBtn">getCurrentRouteFromContext</button>
        <button id="getCurrentRouteFromParentBtn">getCurrentRouteFromParent</button>
        <button id="getCurrentRouteFromVirtualTreeBtn">getCurrentRouteFromVirtualTree</button>
        <button id="setAnchor">setAnchor</button>
        <button id="addNodeParams">addNodeParams</button>
        <button id="getNodeParams">getNodeParams</button>
        <button id="coreSearchParams">getCoreSearchParams</button>
        <button id="getClientPermissions">getClientPermissions</button>
        <span class="wc-result"></span>
      </section>
    `;

    this._shadowRoot.querySelector('#getCurrentRouteFromClosestContextBtn').addEventListener('click', async () => {
      if (this.LuigiClient) {
        const span = this._shadowRoot.querySelector('.wc-result');
        span.textContent = '';
        try {
          const route = await this.LuigiClient.linkManager().fromClosestContext().getCurrentRoute();
          span.textContent = route;
        } catch (err) {
          span.textContent = 'Error: ' + err.message;
        }
      }
    });

    this._shadowRoot.querySelector('#getCurrentRouteFromContextBtn').addEventListener('click', async () => {
      if (this.LuigiClient) {
        const span = this._shadowRoot.querySelector('.wc-result');
        span.textContent = '';
        try {
          const route = await this.LuigiClient.linkManager().fromContext('home').getCurrentRoute();
          span.textContent = route;
        } catch (err) {
          span.textContent = 'Error: ' + err.message;
        }
      }
    });

    this._shadowRoot.querySelector('#getCurrentRouteFromParentBtn').addEventListener('click', async () => {
      if (this.LuigiClient) {
        const span = this._shadowRoot.querySelector('.wc-result');
        span.textContent = '';
        try {
          const route = await this.LuigiClient.linkManager().fromParent().getCurrentRoute();
          span.textContent = route;
        } catch (err) {
          span.textContent = 'Error: ' + err.message;
        }
      }
    });

    this._shadowRoot.querySelector('#getCurrentRouteFromVirtualTreeBtn').addEventListener('click', async () => {
      if (this.LuigiClient) {
        const span = this._shadowRoot.querySelector('.wc-result');
        span.textContent = '';
        try {
          const route = await this.LuigiClient.linkManager().fromVirtualTreeRoot().getCurrentRoute();
          span.textContent = route;
        } catch (err) {
          span.textContent = 'Error: ' + err.message;
        }
      }
    });

    this._shadowRoot.querySelector('#setAnchor').addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.setAnchor('LuigiRocks');
      }
    });

    this._shadowRoot.querySelector('#addNodeParams').addEventListener('click', () => {
      if (this.LuigiClient) {
        this.LuigiClient.addNodeParams({ Luigi: 'rocks' });
      }
    });

    this._shadowRoot.querySelector('#getNodeParams').addEventListener('click', () => {
      if (this.LuigiClient) {
        let nodeParams = this.LuigiClient.getNodeParams();
        alert(JSON.stringify(nodeParams));
      }
    });

    this._shadowRoot.querySelector('#coreSearchParams').addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getCoreSearchParams()));
      }
    });

    this._shadowRoot.querySelector('#getClientPermissions').addEventListener('click', () => {
      if (this.LuigiClient) {
        alert(JSON.stringify(this.LuigiClient.getClientPermissions()));
      }
    });
  }

  set context(ctx) {
    this._shadowRoot.querySelector('p').innerHTML = ctx.title;
  }
}
