declare module 'EventPayloads' {
  type ModalSettings = {
    height?: 'px' | '%' | 'rem' | 'em' | 'vh' | 'vw';
    size?: 'fullscreen' | 'l' | 'm' | 's';
    title?: string;
    width?: 'px' | '%' | 'rem' | 'em' | 'vh' | 'vw';
  };

  export interface AlertRequestPayload {
    closeAfter?: number;
    links?: {
      [key: string]: {
        dismissKey?: string;
        text: string;
        url?: string;
      };
    };
    text?: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }

  export interface ConfirmationModalRequestPayload {
    body?: string;
    buttonConfirm?: string | boolean;
    buttonDismiss?: string;
    header?: string;
    type?: 'confirmation' | 'info' | 'success' | 'warning' | 'error' | 'information';
  }

  export interface ModalSettingsRequestPayload {
    addHistoryEntry: boolean;
    updatedModalSettings: ModalSettings;
  }

  export interface CurrentRouteRequestPayload {
    fromClosestContext?: boolean;
    fromContext?: string | null;
    fromParent?: boolean;
    fromVirtualTreeRoot?: boolean;
    nodeParams?: {
      [key: string]: string;
    };
  }

  export interface CurrentRoutePostMessageData {
    correlationId: number;
    route: string;
  }

  export interface CheckPathPostMessageData {
    correlationId: number;
    pathExists: boolean;
  }

  export interface NavigationRequestPayload extends CurrentRouteRequestPayload {
    link?: string;
  }

  export interface ModalPathDataRequestPayload extends CurrentRouteRequestPayload {
    history?: boolean;
    link?: string;
    modal?: ModalSettings;
  }

  export interface ParamsRequestPayload {
    data?: {
      [key: string]: any;
    };
    keepBrowserHistory?: boolean;
  }
}
