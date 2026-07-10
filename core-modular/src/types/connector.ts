import type { CoreAPISupportedElements } from './dom-elements';
import type { GlobalSearchHandler } from './global-search';
import type { AlertHandler, AlertSettings, ConfirmationModalHandler, ConfirmationModalSettings } from './ux';
import type {
  ModalSettings,
  LeftNavData,
  Node,
  TopNavData,
  TabNavData,
  BreadcrumbData,
  DrawerSettings,
  UserSettingsDialogSettings
} from './navigation';

/**
 * Integration contract between Luigi's core and a head (shell) implementation.
 *
 * A connector adapts Luigi's framework-agnostic core to a concrete UI technology
 * (UI5 Web Components, Fiori, a custom design system, …). The head implements
 * this interface and hands an instance to `LuigiEngine.bootstrap(connector)`.
 *
 * Core never queries the DOM directly: it asks the connector to render shell
 * regions, mount micro-frontend containers, and surface alerts/modals/drawers.
 * In return, core hands the connector either callbacks to invoke (for modal /
 * drawer lifecycle) or handler objects (for alerts / confirmation modals) so
 * the connector can report user-driven outcomes back.
 */
export interface LuigiConnector {
  /**
   * Build the shell chrome (header / side nav / content area / overlays).
   *
   * Called once during `UIModule.init`, before any other `render*` method.
   * The connector should create the DOM slots that subsequent calls will
   * populate (top nav, left nav, tab nav, breadcrumbs, container wrapper,
   * alert and confirmation overlays) and should be idempotent — re-invoking
   * it must not duplicate the layout.
   */
  renderMainLayout(): void;

  /**
   * Render the top navigation (shellbar) from the supplied data.
   *
   * Called on initial route resolution and again whenever core's UI update
   * touches scopes affecting the header (`settings`, `settings.header`,
   * `navigation`, `navigation.profile`, `navigation.contextSwitcher`,
   * `navigation.productSwitcher`). Treat the call as a full replace, not an
   * append — the data describes the complete desired state.
   *
   * @param data complete top-nav state to render — title, logo, top-level
   *   nodes, profile, context/app/product switchers, optional global-search
   *   config. Any region present should be (re)rendered; absent fields mean
   *   "hide / remove that region".
   */
  renderTopNav(data: TopNavData): void;

  /**
   * Render the left (side) navigation from the supplied data.
   *
   * Called on initial route resolution and on updates touching `navigation`,
   * `navigation.nodes`, `navigation.viewgroupdata`, `settings`, or
   * `settings.footer`. Full replace semantics — render `data.items` and
   * highlight `data.selectedNode`; do not merge with previously rendered
   * state.
   *
   * @param data items to render, the currently selected node to highlight,
   *   the base path for relative links, an optional footer text, and an
   *   optional `navClick` handler the connector may invoke on item click in
   *   place of native navigation.
   */
  renderLeftNav(data: LeftNavData): void;

  /**
   * Return the element into which core appends micro-frontend containers
   * (`luigi-container` / `luigi-compound-container`).
   *
   * Called frequently — on every navigation, by the auth layer, by the
   * preloading service, and by container helpers. The element should already
   * exist after `renderMainLayout()`; returning `null`/`undefined` will
   * suppress mounting and is treated as "no container area available".
   *
   * @returns the content-area host element, or `null`/`undefined` if the
   *   shell has no mount point available yet.
   */
  getContainerWrapper(): HTMLElement;

  /**
   * Render `content` (a `luigi-container` / `luigi-compound-container`) inside
   * a modal dialog.
   *
   * `updateModalSettings` may be called between this method and close to
   * mutate title / size in place.
   *
   * @param content the micro-frontend container element to mount inside the
   *   dialog. Already constructed by core; the connector only needs to
   *   append it to its modal DOM.
   * @param modalSettings dialog presentation — size preset, explicit width /
   *   height, title, optional `keepPrevious` flag, test-id for the close
   *   button.
   * @param onCloseCallback invoked by the connector **once the modal is fully
   *   closed** (after any dirty-state confirmation has resolved). Drives
   *   core's modal-stack cleanup and URL bookkeeping.
   * @param onCloseRequest invoked by the connector **when the user requests
   *   close** (e.g. clicks the close button). Returns a `Promise<void>` that
   *   resolves once core has approved the close (dirty-state check passed,
   *   no unsaved-changes prompt outstanding). The connector should `await`
   *   this before tearing the modal down.
   */
  renderModal(
    content: HTMLElement,
    modalSettings: ModalSettings,
    onCloseCallback?: () => void,
    onCloseRequest?: () => void
  ): void;

  /**
   * Render `content` inside a drawer (slide-in panel).
   *
   * @param content the micro-frontend container element to mount inside the
   *   drawer.
   * @param drawerSettings drawer presentation — size, overlap mode, optional
   *   header, whether a backdrop is shown.
   * @param onCloseCallback invoked by the connector once the drawer has
   *   closed. See {@link LuigiConnector.renderModal} for the lifecycle
   *   contract — drawer mirrors modal exactly.
   * @param onCloseRequest invoked by the connector on user-driven close;
   *   awaiting the returned promise yields core's approval (dirty-status
   *   check).
   */
  renderDrawer(
    content: HTMLElement,
    drawerSettings: DrawerSettings,
    onCloseCallback?: () => void,
    onCloseRequest?: () => void
  ): void;

  /**
   * Render the tab navigation row for the current node.
   *
   * Called alongside `renderLeftNav` whenever the relevant navigation scopes
   * change. Full replace semantics.
   *
   * @param data tab items, the currently selected one, base path for
   *   relative links, and optional `navClick` handler.
   */
  renderTabNav(data: TabNavData): void;

  /**
   * Render the breadcrumb trail for the current path.
   *
   * Called on navigation updates. The `BreadcrumbData` passed in may contain
   * pending entries whose labels resolve asynchronously — in that case core
   * calls `renderBreadcrumbs` a second time with the resolved data, so the
   * connector should accept repeated invocations as a full replace.
   *
   * @param data breadcrumb items (each with optional `pending: true` until
   *   resolved), base path, selected node, and an optional custom renderer.
   *   `clearBeforeRender` indicates whether the connector should wipe
   *   existing breadcrumbs before rendering.
   */
  renderBreadcrumbs(data: BreadcrumbData): void;

  /**
   * Surface an alert (toast / message strip) to the user.
   *
   * @param alertSettings what to display — text (may contain link tokens
   *   resolved via `links`), severity `type`, optional auto-close timeout,
   *   id, and link map.
   * @param alertHandler connector → core channel for reporting the
   *   alert's outcome. Invoke `alertHandler.close()` when the alert is
   *   dismissed (auto-timeout or user action) and
   *   `alertHandler.link(linkKey)` when the user activates a link embedded
   *   in the text. `alertHandler.openFromClient` indicates whether the alert
   *   originated from a micro-frontend (used by core for routing of the
   *   outcome).
   */
  renderAlert(alertSettings: AlertSettings, alertHandler: AlertHandler): void;

  /**
   * Surface a confirmation modal (yes/no dialog).
   *
   * Used both for app-level confirmations (`Luigi.ux().showConfirmationModal`)
   * and for the dirty-state unsaved-changes flow — the connector does not
   * need to distinguish.
   *
   * @param confirmationModalSettings header, body text, button labels,
   *   optional icon and semantic `type`.
   * @param containerHandler connector → core channel. Invoke
   *   `containerHandler.confirm()` or `containerHandler.dismiss()` based on
   *   the user's choice; core handles the rest.
   */
  renderConfirmationModal(
    confirmationModalSettings: ConfirmationModalSettings,
    containerHandler: ConfirmationModalHandler
  ): void;

  /**
   * Set the browser document title.
   *
   * Called from `Luigi.ux().setDocumentTitle()` and on `SET_DOCUMENT_TITLE_REQUEST`
   * from a micro-frontend. The connector typically forwards to
   * `document.title`; it may additionally reflect the title in UI (e.g. an
   * acknowledgement toast).
   *
   * @param documentTitle new title string.
   */
  setDocumentTitle(documentTitle: string): void;

  /**
   * Show a loading indicator. Called during navigation, on
   * `SHOW_LOADING_INDICATOR_REQUEST` from a client, and around modal/drawer
   * open.
   *
   * @param container when provided, scope the indicator to this subtree
   *   (typically the parent of a micro-frontend container that is still
   *   handshaking). When omitted, fall back to a shell-wide busy indicator.
   */
  showLoadingIndicator(container?: HTMLElement): void;

  /**
   * Hide a previously shown loading indicator. Called once a micro-frontend
   * reports `INITIALIZED`, when navigation completes, and on
   * `HIDE_LOADING_INDICATOR_REQUEST` from a client.
   *
   * @param container scoping rules match {@link LuigiConnector.showLoadingIndicator}.
   */
  hideLoadingIndicator(container?: HTMLElement): void;

  /**
   * Show a page-level backdrop, typically dimming the main content while a
   * micro-frontend displays its own overlay.
   *
   * Core does not refcount calls — it mirrors client `ADD_BACKDROP_REQUEST`
   * events one-to-one. If a connector needs nesting semantics it must
   * implement them itself.
   */
  addBackdrop(): void;

  /**
   * Hide the page-level backdrop. Counterpart to `addBackdrop`; same
   * no-refcount caveat applies.
   */
  removeBackdrop(): void;

  /**
   * Set the collapsed state of the left side navigation.
   */
  collapseLeftSideNav(state: boolean): void;

  /**
   * Open the user-settings dialog.
   *
   * Core invokes `dialogSettings.renderMicroFrontendContainer(viewUrl, groupKey)`
   * (which it installs before calling this method) to mount per-group MFEs
   * inside the dialog, and `dialogSettings.onCloseCallback(stored, previous)`
   * when the dialog closes — the connector is responsible for calling both
   * at the appropriate moments.
   *
   * @param dialogSettings dialog header, save/dismiss button labels, plus
   *   the two core-installed hooks (`renderMicroFrontendContainer`,
   *   `onCloseCallback`) the connector must invoke.
   * @param userSettingData static schema describing the available
   *   user-settings groups (one entry per group).
   * @param previousUserSettings persisted user-settings state to prefill
   *   the dialog with, or `null` on first open.
   */
  openUserSettings(
    dialogSettings: UserSettingsDialogSettings,
    userSettingData: Record<string, any>[],
    previousUserSettings: Record<string, any> | null
  ): void;

  /**
   * Close a user-settings dialog opened via `openUserSettings`.
   * Called from `Luigi.ux().closeUserSettings()` and on
   * `CLOSE_USER_SETTINGS_REQUEST` from a client.
   */
  closeUserSettings(): void;

  /**
   * Notify the connector that Luigi's current locale changed.
   *
   * Push-only — heads typically use this to re-translate shell chrome or to
   * reflect the change in their own UI.
   *
   * @param locale BCP-47 locale tag (e.g. `'en'`, `'de-DE'`).
   */
  setCurrentLocale(locale: string): void;

  /**
   * Apply updated settings to the currently open modal (title, size, …).
   *
   * Called from `Luigi.ux().updateModalSettings()`, from client
   * `UPDATE_MODAL_SETTINGS_REQUEST`, and from the routing service when
   * modal-in-URL state changes. No-op if no modal is open (core guards
   * before forwarding).
   *
   * @param modalSettings the **merged** result (existing settings ⊕
   *   updates) — apply as-is, do not attempt to diff against previous
   *   state.
   */
  updateModalSettings(modalSettings: ModalSettings): void;

  /**
   * Display an unrecoverable error and halt further interaction.
   *
   * Currently invoked only for fatal config-loading failures
   * (`config-helpers.ts → setErrorMessage`). Not a general runtime-error
   * channel — those flow through `runTimeErrorHandler` on nodes.
   *
   * @param error human-readable error message to display.
   */
  showFatalError(error: string): void;

  /**
   * Return a bag of getters for shell-owned DOM regions that micro-frontends
   * can reach via `Luigi.elements()` (shellbar, shellbar actions, the Luigi
   * container, the side-nav footer area).
   *
   * Each getter is invoked lazily on access, so the connector may resolve
   * elements at call time rather than caching them at construction.
   *
   * @returns an object exposing one getter per supported shell region; each
   *   returns the element if present, or `null` if the region is not part
   *   of this head's layout.
   */
  getCoreAPISupportedElements(): CoreAPISupportedElements;

  /**
   * Tear down all shell DOM and listeners created by the connector.
   *
   * Called from `Luigi.unload()`. After this, core may later call
   * `renderMainLayout()` again on a fresh `Luigi.setConfig()` cycle, so the
   * connector must leave itself in a state where re-bootstrapping works.
   */
  unload(): void;

  /**
   * Return an imperative handle for driving the global-search UI, or omit
   * this method entirely if the head does not surface global search. Core
   * calls the returned handler in response to `Luigi.globalSearch().*` API
   * calls and search-related navigation.
   *
   * @returns the global-search handler, or `undefined` if the head exposes
   *   no search UI at this moment.
   */
  getGlobalSearchHandler?(): GlobalSearchHandler;
}

export type { Node };
