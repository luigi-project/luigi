import { LuigiElement, html } from './node_modules/@luigi-project/client/luigi-element.js';

/**
 * Web component equivalent of customUserSettingsMf.html, built on LuigiElement.
 * Renders Red / Green / Yellow theming buttons, reflects the current theme from
 * the user settings context and publishes user settings updates back to Luigi core.
 */
export default class extends LuigiElement {
  constructor() {
    super({ openShadow: true });
    this.myUserSettings = {};
  }

  render() {
    return html`
      <style>
        .btnList button.active {
          font-size: 30px;
        }
      </style>
      <div>
        <ul class="btnList">
          <li>
            <button id="red" class="red" style="color: red">Red</button>
          </li>
          <br /><br />
          <li>
            <button id="green" class="green" style="color: green">Green</button>
          </li>
          <br /><br />
          <li>
            <button id="yellow" class="yellow" data-testid="yellowBtn">Yellow</button>
          </li>
        </ul>
      </div>
    `;
  }

  afterInit(ctx) {
    this.$red.addEventListener('click', () => this.changeTheming('red'));
    this.$green.addEventListener('click', () => this.changeTheming('green'));
    this.$yellow.addEventListener('click', () => this.setYellowTheme());
    this.renderData(ctx);
  }

  onContextUpdate(ctx) {
    console.log('ctx', ctx);
    this.renderData(ctx);
  }

  renderData(context) {
    this.myUserSettings = context.userSettingsData || {};
    if (this.myUserSettings && this.myUserSettings.theme) {
      const button = this._shadowRoot.querySelector('.' + this.myUserSettings.theme);
      if (button) {
        button.classList.add('active');
      }
    }
  }

  changeTheming(theme) {
    this._shadowRoot.querySelectorAll('.btnList button').forEach((button) => {
      button.classList.remove('active');
    });
    this._shadowRoot.querySelector('.' + theme).classList.add('active');
    this.myUserSettings.theme = theme;
    this.LuigiClient.publishEvent(
      new CustomEvent('luigi.updateUserSettings', { detail: this.myUserSettings })
    );
  }

  // just a context update example, has nothing to do with user settings dialog
  setYellowTheme() {
    this.LuigiClient.publishEvent(
      new CustomEvent('my-custom-message.update-user-settings', { detail: { theme: 'yellow' } })
    );
  }
}
