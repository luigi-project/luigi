/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
export default class extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `<section style="border:2px solid blue">
      <h2>Hello From Web Component 4</h2>
      <p id="paragraph">Feature Toggles: </p>
      <p>Timer: <span class="timer">0</span></p>
    </section>`;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.$paragraph = shadowRoot.getElementById('paragraph');
    this.$paragraph.innerHTML += Luigi?.featureToggles()?.getActiveFeatureToggleList()?.length || 0;
    this.$timer = shadowRoot.querySelector('span.timer');
    this.addEventListener('update', ev => {
      this.$timer.innerHTML = ev.detail;
    });
  }
}
