import { LuigiElement } from './luigi-element.js';
export default class extends LuigiElement {
  constructor() {
    super({ openShadow: 'open', deferLuigiClientWCInit: false });
    const template = document.createElement('template');

    //remove buttons after review/AC
    template.innerHTML = `
        <section style="display: flex; height: 100%; flex-direction: column">
          <button id="addNodeParams">addNodeParams</button>
          <button id="getNodeParams">getNodeParams</button>
          <button id="showAlert">showAlert</button>
          <button id="showAlertWithCallback">showAlert (with callback)</button>
          <button id="confirmationModal">showConfirmationModal</button>
          <button id="getUserSettings">getUserSettings</button>
          <header><slot name="header">header</slot></header>
          <main style="flex: auto; overflow: auto">
            <slot name="content">content</slot>
            <slot name="helloWorldSelfRegistered"></slot>
          </main>
          <footer><slot name="footer">footer</slot></footer>
        </section>
      `;
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$button = this._shadowRoot.querySelector('#addNodeParams');
    this.$button.addEventListener('click', () => {
      this.LuigiClient.addNodeParams({ Luigi: 'rocks' }, true);
    });
    this.$button2 = this._shadowRoot.querySelector('#getNodeParams');
    this.$button2.addEventListener('click', () => {
      console.log('getNodeParams', this.LuigiClient.getNodeParams());
    });
    this.$button3 = this._shadowRoot.querySelector('#showAlert');
    this.$button3.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        text: 'Direct WC - alert message',
        type: 'info'
      });
    });
    this.$button4 = this._shadowRoot.querySelector('#showAlertWithCallback');
    this.$button4.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        callback: true,
        text: 'Direct WC - alert message',
        type: 'info'
      });
    });
    this.$button5 = this._shadowRoot.querySelector('#confirmationModal');
    this.$button5.addEventListener('click', () => {
      const settings = {
        type: 'confirmation',
        header: 'Confirmation',
        body: 'Are you sure you want to do this?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No'
      };

      this.LuigiClient.uxManager()
        .showConfirmationModal(settings)
        .then(() => console.info('Direct WC - modal confirmed'))
        .catch(() => console.info('Direct WC - modal dissmissed'));
    });
    this.$button6 = this._shadowRoot.querySelector('#getUserSettings');
    this.$button6.addEventListener('click', () => {
      console.log('getUserSettings', this.LuigiClient.getUserSettings());
    });
  }

  connectedCallback() {
    setTimeout(() => {
      this.LuigiClient.luigiClientInit();
      console.log('LuigiClient initialized for LuigiElement Compount WC');
    }, 8000);
  }

  set context(ctx) {
    console.log('context', ctx);
  }
}
