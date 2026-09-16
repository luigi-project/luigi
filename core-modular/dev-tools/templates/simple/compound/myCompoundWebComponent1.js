/**
 * This class is used to test LuigiClient webcomponent based functionality
 */
export default class extends HTMLElement {
  constructor() {
    super();
    let count = 0;
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `<section style="border:2px solid blue">
      <h2>Hello From Web Component 1</h2>
      <p id="ctx">Context: </p>
      <button>Timer</button>
    </section>`;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.$ctx = shadowRoot.getElementById('ctx');
    this.$button = shadowRoot.querySelector('button');
    this.$button.addEventListener('click', () => {
      count++;
      this.LuigiClient.publishEvent(new CustomEvent('sendBtn', { detail: count }));
    });
  }

  set context(ctx) {
    this.$ctx.innerHTML += ctx.content;
  }
}
