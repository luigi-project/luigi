export interface IframeHandle {
  data?: string;
  iframe: HTMLIFrameElement;
}

export interface ContainerElement extends HTMLElement {
  iframeHandle?: IframeHandle;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface LayoutConfig {
  column?: string;
  row?: string;
  slot?: string;
}

export interface RendererLayout {
  columns?: string;
  gap?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  rows?: string;
}

export interface RendererConfig extends RendererLayout {
  layouts?: RendererLayout[];
}

/* eslint-disable */
export interface NavNodeListener {
  action?: any;
  dataConverter?: any;
  name?: any;
  source?: any;
}

export interface RendererUseProps {
  attachCompoundItem?: (compoundCnt: any, compoundItemCnt: any, renderer: any) => void;
  createCompoundContainer?: (config: any, renderer: any) => HTMLDivElement;
  createCompoundItemContainer?: (layoutConfig: any, config?: any, renderer?: any) => HTMLDivElement;
  extends?: string;
}
/* eslint-enable */

export interface RendererObject {
  config?: RendererConfig;
  use?: RendererUseProps | string;
}

export interface WebComponentNode {
  compound?: {
    renderer?: RendererObject;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  webcomponent?: {
    selfRegistered?: boolean;
    tagName?: string;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  viewUrl?: string;
}

export interface WebComponentRenderer {
  createCompoundContainer?: () => HTMLDivElement;
  viewUrl?: string;
}
