/**
 * Public UX-related types: alert and confirmation modal settings, plus the handlers
 * a connector receives when rendering them.
 */

export interface AlertSettings {
  closeAfter?: number;
  id?: string;
  links?: Record<string, Link>;
  text?: string;
  ttl?: number;
  type?: string;
}

export interface Link {
  elemId: string;
  url?: string;
  dismissKey?: string;
}

/**
 * Imperative alert surface a connector receives when rendering an alert. The connector
 * invokes `close()` when the user dismisses the alert and `link(linkKey)` when a link
 * inside the alert is activated.
 */
export interface AlertHandler {
  openFromClient: boolean;
  close(): void;
  link(linkKey: string): boolean;
}

export interface ConfirmationModalSettings {
  icon?: string;
  type?: string;
  header?: string;
  body?: string;
  buttonConfirm?: string;
  buttonDismiss?: string;
}

/**
 * Imperative confirmation-modal surface a connector receives when rendering the modal.
 * The connector invokes `confirm()` or `dismiss()` based on the user's choice.
 */
export interface ConfirmationModalHandler {
  confirm(): void;
  dismiss(): void;
}
