import type { ComponentType } from 'svelte';
import LuigiContainer from './LuigiContainer.svelte';
import LuigiCompoundContainer from './LuigiCompoundContainer.svelte';
import { Events } from './constants/communication';
export { default as LuigiContainer } from './LuigiContainer.svelte';
export { default as LuigiCompoundContainer } from './LuigiCompoundContainer.svelte';
export type { PathExistsEvent } from './constants/event-type';
export { Events as LuigiEvents } from './constants/communication';
export default Events;

if (!customElements.get('luigi-container')) {
  customElements.define('luigi-container', (LuigiContainer as unknown as ComponentType).element);
}

if (!customElements.get('luigi-compound-container')) {
  customElements.define('luigi-compound-container', (LuigiCompoundContainer as unknown as ComponentType).element);
}
