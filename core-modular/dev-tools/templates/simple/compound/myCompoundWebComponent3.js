/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
export default class extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `<section style="border:2px solid blue">
      <h2>Hello From Web Component 3</h2>
      <p id="paragraph">Current Theme: </p>
    </section>`;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.$paragraph = shadowRoot.getElementById('paragraph');
    this.$paragraph.innerHTML += Luigi?.theming()?.getCurrentTheme()?.toString() || '-';
  }
}
