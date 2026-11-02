/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
class HelloWorldSelfRegistered extends HTMLElement {
  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = `
      <section>
        <p>Hello World (self registered)!</p>
        <button id="showAlert">showAlert</button><br>
        <button id="showAlertWithCallback">showAlert (with callback)</button><br>
        <button id="confirmationModal">showConfirmationModal</button>
        <button id="getUserSettings">getUserSettings</button>
      </section>
    `;

    this._shadowRoot = this.attachShadow({
      mode: 'open',
      delegatesFocus: false
    });
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$button = this._shadowRoot.querySelector('#showAlert');
    this.$button.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        text: 'Nested WC - alert message',
        type: 'info'
      });
    });
    this.$button2 = this._shadowRoot.querySelector('#showAlertWithCallback');
    this.$button2.addEventListener('click', () => {
      this.LuigiClient.uxManager().showAlert({
        callback: true,
        text: 'Nested WC - alert message',
        type: 'info'
      });
    });
    this.$button3 = this._shadowRoot.querySelector('#confirmationModal');
    this.$button3.addEventListener('click', () => {
      const settings = {
        type: 'confirmation',
        header: 'Nested confirmation',
        body: 'Are you sure you want to do this?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No'
      };

      this.LuigiClient.uxManager()
        .showConfirmationModal(settings)
        .then(() => console.info('Nested WC - modal confirmed'))
        .catch(() => console.info('Nested WC - modal dissmissed'));
    });
    this.$button4 = this._shadowRoot.querySelector('#getUserSettings');
    this.$button4.addEventListener('click', () => {
      const userSettings = this.LuigiClient.getUserSettings();
      console.info('Nested WC - user settings:', userSettings);
    });
  }
}
window.Luigi._registerWebcomponent(
  new URL(document.currentScript?.getAttribute('src'), location),
  HelloWorldSelfRegistered
);
