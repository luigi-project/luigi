export interface TopNavData {
  appTitle: string;
  logo: string;
  topNodes: NavItem[];
  productSwitcher?: ProductSwitcher;
  profile?: ProfileSettings;
  appSwitcher?: AppSwitcher;
  navClick?: (item: NavItem) => void;
}

export interface AppSwitcher {
  showMainAppEntry?: boolean;
  items?: AppSwitcherItem[];
  itemRenderer?: (item: AppSwitcherItem, slot: HTMLElement, appSwitcherApiObj?: any) => void;
}

export interface AppSwitcherItem {
  title?: string;
  subtitle?: string;
  link?: string;
  selectionConditions?: selectionConditions;
}

export interface selectionConditions {
  route?: string;
  contextCriteria?: ContextCriteria[];
}

export interface ContextCriteria {
  key: string;
  value: string;
}

export interface ProfileSettings {
  authEnabled: boolean;
  signedIn: boolean;
  logout: ProfileLogout;
  items?: ProfileItem[];
  staticUserInfoFn?: () => Promise<UserInfo>;
  onUserInfoUpdate: (fn: (uInfo: UserInfo) => void) => void;
  itemClick: (item: ProfileItem) => void;
}

export interface ProfileLogout {
  label?: string;
  icon?: string;
  testId?: string;
  altText?: string;
  doLogout: () => void;
}

export interface ProfileItem {
  label?: string;
  link?: string;
  externalLink?: ExternalLink;
  icon?: string;
  testId?: string;
  altText?: string;
  openNodeInModal?: boolean | ModalSettings;
}

export interface UserInfo {
  name?: string;
  initials?: string;
  email?: string;
  picture?: string;
  description?: string;
}

export interface LeftNavData {
  selectedNode: Node;
  items: NavItem[];
  basePath: string;
  sideNavFooterText?: string;
  navClick?: (item: NavItem) => void;
}

export interface PathData {
  context?: Record<string, any>;
  selectedNode?: Node;
  selectedNodeChildren?: Node[];
  nodesInPath?: Node[];
  rootNodes: Node[];
  pathParams: Record<string, any>;
  matchedPath: string;
}

export interface RootNode {
  node: Node;
}

export interface Node {
  altText?: string;
  anonymousAccess?: any;
  badgeCounter?: {
    count?: () => number | Promise<number>;
    label?: string;
  };
  category?: any;
  children?: Node[];
  clientPermissions?: {
    changeCurrentLocale?: boolean;
    urlParameters?: Record<string, any>;
  };
  compound?: CompoundConfig;
  context?: Record<string, any>;
  drawer?: ModalSettings;
  decodeViewUrl?: boolean;
  externalLink?: ExternalLink;
  hideFromNav?: boolean;
  hideSideNav?: boolean;
  icon?: string;
  isRootNode?: boolean;
  keepSelectedForChildren?: boolean;
  label?: string;
  loadingIndicator?: {
    enabled: boolean;
  };
  navigationContext?: string;
  onNodeActivation?: (node: Node) => boolean | void;
  openNodeInModal?: boolean;
  pageErrorHandler?: PageErrorHandler;
  parent?: Node;
  pathSegment?: string;
  runTimeErrorHandler?: RunTimeErrorHandler;
  showBreadcrumbs?: boolean;
  tabNav?: boolean;
  tooltipText?: string;
  userSettingsGroup?: string;
  viewUrl?: string;
  visibleForFeatureToggles?: string[];
  virtualTree?: boolean;
  viewGroup?: string;
  webcomponent?:
    | boolean
    | {
        type?: string;
        selfRegistered?: boolean;
        tagName?: string;
      };
  _virtualTree?: Node;
  _virtualPathIndex?: number;
  _virtualViewUrl?: string;
}

export interface PageErrorHandler {
  timeout: number;
  viewUrl?: string;
  redirectPath?: string;
  errorFn?: (node?: Node) => void;
}

export interface RunTimeErrorHandler {
  errorFn?: (error: object, node?: Node) => void;
}

export interface Category {
  altText?: string;
  collapsible?: boolean;
  icon?: string;
  id: string;
  isGroup?: boolean;
  label?: string;
  nodes?: NavItem[];
  tooltip?: string;
}

export interface BreadcrumbItem {
  label: string;
  last?: boolean;
  node: Node;
  pending?: boolean;
  route: string | undefined;
}

export interface NavItem {
  altText?: string;
  category?: Category;
  icon?: string;
  node?: Node;
  label?: string;
  selected?: boolean;
  tooltip?: string;
}

export interface TabNavData {
  selectedNode?: any;
  items?: NavItem[];
  basePath?: string;
  navClick?: (item: NavItem) => void;
}

export interface BreadcrumbData {
  basePath?: string;
  clearBeforeRender?: boolean;
  items?: BreadcrumbItem[];
  renderer?: any;
  selectedNode?: Node;
}

export interface DrawerSettings {
  backdrop?: boolean;
  header?: any;
  overlap?: boolean;
  size?: 'l' | 'm' | 's' | 'xs';
}

export interface ModalSettings {
  size?: 'fullscreen' | 'l' | 'm' | 's';
  width?: string;
  height?: string;
  title?: string;
  closebtn_data_testid?: string;
  keepPrevious?: boolean;
}

export interface ProductSwitcher {
  altText?: string;
  columns?: number;
  icon?: string;
  items?: [ProductSwitcherItem];
  label?: string;
  testId?: string;
}

export interface ProductSwitcherItem {
  altText?: string;
  externalLink?: ExternalLink;
  icon?: string;
  label?: string;
  link?: string;
  selected?: boolean;
  subTitle?: string;
  testId?: string;
}

export interface ExternalLink {
  url?: string;
  sameWindow?: boolean;
}

export interface NavigationOptions {
  fromContext?: any;
  fromClosestContext?: boolean;
  fromVirtualTreeRoot?: boolean;
  fromParent?: boolean;
  relative?: any;
  nodeParams?: Record<string, any>;
}

export interface NavigationRequestBase {
  preventContextUpdate?: boolean;
  preventHistoryEntry?: boolean;
  withoutSync?: boolean;
  options?: NavigationOptions;
}

export interface NavigationRequestParams extends NavigationRequestBase {
  drawerSettings?: any;
  modalSettings?: any;
  newTab?: boolean;
  path: string;
  preserveView?: string;
}

export interface NavigationRequestEvent {
  detail: NavigationRequestBase;
}

/**
 * Configuration for compound web components in Luigi.
 * Compound allows you to layout multiple web components in one micro frontend.
 */
export interface CompoundConfig {
  /**
   * Renderer configuration for the compound layout
   */
  renderer?: {
    /**
     * The renderer to use - can be 'grid', a custom renderer object, or undefined for default
     */
    use?:
      | 'grid'
      | string
      | {
          /**
           * Base renderer to extend (e.g., 'grid')
           */
          extends?: string;
          /**
           * Custom function to create the compound container
           * @param config - The renderer configuration
           * @param renderer - The parent/super renderer (if extending)
           */
          createCompoundContainer?: (config: RendererConfig, renderer?: any) => HTMLDivElement;
          /**
           * Custom function to create individual compound item containers
           * @param layoutConfig - Layout configuration for the item
           * @param config - The overall renderer configuration
           * @param renderer - The parent/super renderer (if extending)
           */
          createCompoundItemContainer?: (
            layoutConfig?: LayoutConfig,
            config?: RendererConfig,
            renderer?: any
          ) => HTMLDivElement;
          /**
           * Custom function to attach an item to the compound container
           * @param compoundCnt - The compound container element
           * @param compoundItemCnt - The item container to attach
           * @param renderer - The parent/super renderer (if extending)
           */
          attachCompoundItem?: (compoundCnt: HTMLElement, compoundItemCnt: HTMLElement, renderer?: any) => void;
        };
    /**
     * Configuration for the grid layout
     */
    config?: {
      /**
       * CSS grid-template-columns value (e.g., '1fr 2fr')
       */
      columns?: string;
      /**
       * CSS grid-template-rows value (e.g., '150px 150px')
       */
      rows?: string;
      /**
       * CSS grid-gap value (e.g., 'auto', '10px')
       */
      gap?: string;
      /**
       * Minimum height for the grid container
       */
      minHeight?: string;
      /**
       * Responsive layout configurations for different viewport sizes
       */
      layouts?: Array<{
        /**
         * CSS grid-template-columns for this breakpoint
         */
        columns?: string | number;
        /**
         * CSS grid-template-rows for this breakpoint
         */
        rows?: string | number;
        /**
         * CSS grid-gap for this breakpoint
         */
        gap?: string | number;
        /**
         * Minimum viewport width for this layout (in pixels)
         */
        minWidth?: number;
        /**
         * Maximum viewport width for this layout (in pixels)
         */
        maxWidth?: number;
      }>;
    };
  };

  /**
   * Lazy loading configuration for compound children
   */
  lazyLoadingOptions?: {
    /**
     * Enable lazy loading using IntersectionObserver
     * @default false
     */
    enabled?: boolean;
    /**
     * IntersectionObserver rootMargin option
     * Controls when children are loaded relative to viewport visibility
     * @default "0px"
     */
    intersectionRootMargin?: string;
    /**
     * Default temporary height for child containers before they load
     * @default "500px"
     */
    temporaryContainerHeight?: string;
    /**
     * Disable automatic temporary container heights
     * Useful for custom renderers that manage heights themselves
     * @default false
     */
    noTemporaryContainerHeight?: boolean;
  };

  /**
   * Array of child web component configurations
   */
  children?: Array<{
    /**
     * Unique identifier for this child web component
     */
    id: string;
    /**
     * URL pointing to the web component JavaScript file
     * Supports {i18n.currentLocale} placeholder for localization
     */
    viewUrl: string;
    /**
     * Context object passed to the web component
     */
    context?: Record<string, any>;
    /**
     * Layout configuration for positioning this child
     */
    layoutConfig?: {
      /**
       * CSS grid-row value (e.g., '1 / 3', 'auto')
       * @default "auto"
       */
      row?: string;
      /**
       * CSS grid-column value (e.g., '1 / -1', 'auto')
       * @default "auto"
       */
      column?: string;
      /**
       * Slot name for nested web components
       * Use this instead of row/column to plug into a parent's slot
       */
      slot?: string;
      /**
       * Override the default temporary container height for this specific child
       * Only used when lazy loading is enabled
       * * @default undefined
       */
      temporaryContainerHeight?: string;
    };
    /**
     * Event listeners for cross-component communication via event bus
     */
    eventListeners?: Array<{
      /**
       * ID of the source web component (use '*' for any source)
       */
      source: string;
      /**
       * Name of the event to listen for
       */
      name: string;
      /**
       * Type of action to perform (e.g., 'update')
       */
      action: string;
      /**
       * Optional function to convert event data before passing to listener
       * @param data - The event data
       */
      dataConverter?: (data: any) => any;
    }>;
  }>;
}

/**
 * Supporting type for layout configuration
 */
export interface LayoutConfig {
  column?: string;
  row?: string;
  slot?: string;
  temporaryContainerHeight?: string;
}

/**
 * Supporting type for renderer configuration
 */
export interface RendererConfig {
  columns?: string;
  rows?: string;
  gap?: string;
  minHeight?: string;
  layouts?: Array<{
    columns?: string;
    rows?: string;
    gap?: string | number;
    minWidth?: number;
    maxWidth?: number;
  }>;
}

export type HistoryMethod = 'pushState' | 'replaceState';
