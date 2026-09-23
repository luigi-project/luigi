/**
 * ElementStyleObserver
 * Observes changes to specific CSS properties of an element.
 * Works for inline styles and computed styles from CSS rules.
 */
export class ElementStyleObserver {
  private element: HTMLElement;
  private properties: string[];
  private callback: any;
  private interval: number;
  private lastValues: any;
  private mutationObserver: any;
  private pollingTimer: any;

  constructor(element: HTMLElement, properties: string[], callback: any, interval = 200) {
    if (!(element instanceof Element)) {
      throw new Error('element must be a DOM Element');
    }

    if (!Array.isArray(properties) || properties.length === 0) {
      throw new Error('properties must be a non-empty array of CSS property names');
    }

    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }

    this.element = element;
    this.properties = properties;
    this.callback = callback;
    this.interval = interval;
    this.lastValues = {};
    this.mutationObserver = null;
    this.pollingTimer = null;
  }

  start(): void {
    // Initialize lastValues
    this.lastValues = this._getCurrentValues();

    // Observe inline style changes
    this.mutationObserver = new MutationObserver(() => {
      this._checkChanges();
    });

    this.mutationObserver.observe(this.element, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Poll computed styles for external CSS changes
    this.pollingTimer = setInterval(() => {
      this._checkChanges();
    }, this.interval);
  }

  stop(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  _getCurrentValues(): any {
    const computed = window.getComputedStyle(this.element);
    const values: any = {};

    this.properties.forEach((prop: string) => {
      values[prop] = computed.getPropertyValue(prop);
    });

    return values;
  }

  _checkChanges(): void {
    const currentValues = this._getCurrentValues();
    const changes: any = {};

    this.properties.forEach((prop: string) => {
      if (currentValues[prop] !== this.lastValues[prop]) {
        changes[prop] = {
          oldValue: this.lastValues[prop],
          newValue: currentValues[prop]
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      this.lastValues = currentValues;
      this.callback(changes);
    }
  }
}
