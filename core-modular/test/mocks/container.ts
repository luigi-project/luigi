// Minimal Jest-friendly stub of '@luigi-project/container'

export const LuigiEvents = {
  CLOSE_CURRENT_MODAL_REQUEST: 'close-current-modal-request'
} as const;

// Default export for `import Events from '@luigi-project/container'`
const Events = LuigiEvents;
export default Events;

// Named exports used by ui-module.ts
export class LuigiContainer extends HTMLElement {
  viewurl?: string;
  webcomponent?: any;
  context?: any;
  clientPermissions?: any;
  cssVariables?: any;
  nodeParams?: any;
  pathParams?: any;
  userSettings?: any;
  searchParams?: any;
  activeFeatureToggleList?: any;
  locale?: string;
  theme?: string;
  sandboxRules?: string[];
  allowRules?: string[];
  viewGroup?: string;

  updateContext(ctx: any) {
    this.context = ctx;
  }
}

export class LuigiCompoundContainer extends HTMLElement {
  viewurl?: string;
  webcomponent?: any;
  compoundConfig?: any;
  context?: any;
  clientPermissions?: any;
  nodeParams?: any;
  pathParams?: any;
  userSettings?: any;
  searchParams?: any;
  activeFeatureToggleList?: any;
  locale?: string;
  theme?: string;
  viewGroup?: string;

  updateContext(ctx: any) {
    this.context = ctx;
  }
}
