/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
export default class extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `<section style="border:2px solid blue">
      <h2>Hello From Web Component 2</h2>
      <p id="ctx">Context: </p>
      <p id="paragraph">Current Locale: </p>
    </section>`;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.$ctx = shadowRoot.getElementById('ctx');
    this.$paragraph = shadowRoot.getElementById('paragraph');
    this.$paragraph.innerHTML += Luigi?.i18n()?.getCurrentLocale() || '-';
  }

  set context(ctx) {
    this.$ctx.innerHTML += ctx.content;
  }
}
