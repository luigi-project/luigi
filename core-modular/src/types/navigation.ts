import type { GlobalSearch } from './global-search';

export interface TopNavData {
  appSwitcher?: AppSwitcher;
  appTitle: string;
  contextSwitcher?: ContextSwitcher;
  isHeaderDisabled?: boolean;
  globalSearch?: GlobalSearch;
  logo: string;
  navClick?: (item: NavItem) => Promise<void>;
  productSwitcher?: ProductSwitcher;
  profile?: ProfileSettings;
  topNodes: NavItem[];
  totalBadgeNode?: BadgeCounter;
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

export interface ContextSwitcher {
  actions?: any[];
  config?: any;
  options?: ContextSwitcherItem[];
  selectedLabel?: string;
  selectedNodePath?: any;
  selectedOption?: ContextSwitcherItem;
  switcherChange?: (selectedValue: string, selectedType?: string | undefined) => void;
}

export interface ContextSwitcherItem {
  clickHandler?: any;
  customRendererCategory?: any;
  id?: string;
  label?: string;
  link?: string;
  linkFromPath?: null | string;
  position?: 'bottom' | 'top';
  testId?: string;
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
  settings: UserSettingsProfileMenuEntry;
  itemClick: (item: ProfileItem) => void;
}

export interface UserSettingsProfileMenuEntry {
  label?: string;
  link?: string;
  openUserSettings?: () => void;
}

export interface ProfileLogout {
  label?: string;
  icon?: string;
  testId?: string;
  altText?: string;
  doLogout: () => void;
}

export interface ProfileItem {
  children?: ProfileItem[];
  label?: string;
  link?: string;
  externalLink?: ExternalLink;
  icon?: string;
  testId?: string;
  altText?: string;
  openNodeInModal?: boolean | ModalSettings;
}

export interface UserSettingsDialogSettings {
  dialogHeader?: string;
  saveBtn?: string;
  dismissBtn?: string;
  renderMicroFrontendContainer?: (viewUrl: string, groupKey: string) => Promise<any>;
  onCloseCallback?: (storedUserSettings: any, previousUserSettings: any) => void;
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
  totalBadgeNode?: BadgeCounter;
  navClick?: (item: NavItem) => Promise<void>;
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

export interface BadgeCounter {
  count?: () => number | Promise<number>;
  label?: string;
}

export interface Node {
  altText?: string;
  anonymousAccess?: any;
  badgeCounter?: BadgeCounter;
  category?: any;
  children?: Node[];
  clientPermissions?: {
    changeCurrentLocale?: boolean;
    urlParameters?: Record<string, any>;
  };
  compound?: CompoundConfig;
  context?: Record<string, any>;
  drawer?: DrawerSettings;
  decodeViewUrl?: boolean;
  externalLink?: ExternalLink;
  hideFromNav?: boolean;
  hideSideNav?: boolean;
  icon?: string;
  intendToHaveEmptyViewUrl?: boolean;
  isRootNode?: boolean;
  keepSelectedForChildren?: boolean;
  label?: string;
  link?: string;
  loadingIndicator?: {
    enabled: boolean;
  };
  navigationContext?: string;
  onNodeActivation?: (node: Node) => boolean | void;
  openNodeInModal?: boolean | ModalSettings;
  pageErrorHandler?: PageErrorHandler;
  parent?: Node;
  pathSegment?: string;
  runTimeErrorHandler?: RunTimeErrorHandler;
  showBreadcrumbs?: boolean;
  tabNav?: boolean;
  titleResolver?: TitleResolver;
  tooltipText?: string;
  userSettingsGroup?: string;
  isolateView?: boolean;
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
  _rawContext?: Record<string, any>;
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
  badgeCounter?: BadgeCounter;
  category?: Category;
  externalLink?: ExternalLink;
  href?: string;
  icon?: string;
  node?: Node;
  label?: string;
  selected?: boolean;
  tooltip?: string;
}

export interface TabNavData {
  basePath?: string;
  items?: NavItem[];
  navClick?: (item: NavItem) => Promise<void>;
  selectedNode?: any;
  totalBadgeNode?: BadgeCounter;
}

export interface BreadcrumbData {
  basePath?: string;
  clearBeforeRender?: boolean;
  items?: BreadcrumbItem[];
  renderer?: any;
  selectedNode?: Node;
}

export interface DrawerHeader {
  title: string;
}

export interface DrawerSettings {
  backdrop?: boolean;
  header?: DrawerHeader;
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
  productSwitcherItemClick?: (item: ProductSwitcherItem) => void;
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
  fromContext?: string | null;
  fromClosestContext?: boolean;
  fromVirtualTreeRoot?: boolean;
  fromParent?: boolean;
  relative?: boolean;
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
  intent?: boolean;
  modalSettings?: any;
  newTab?: boolean;
  path: string;
  preserveView?: string;
}

export interface NavigationRequestEvent {
  detail: NavigationRequestBase;
}

export interface NavigationRequestDetail {
  drawer: unknown;
  link: string;
  intent: boolean;
  preserveView: string;
  modal: unknown;
  newTab: boolean;
  withoutSync: boolean;
  preventContextUpdate: boolean;
  preventHistoryEntry: boolean;
  fromVirtualTreeRoot: boolean;
  fromContext: string | null;
  fromClosestContext: boolean;
  fromParent: boolean;
  relative: boolean;
  nodeParams: Record<string, string>;
}

/**
 * Configuration for compound web components in Luigi.
 * Compound allows you to layout multiple web components in one micro frontend.
 */
import type { CompoundConfig } from './compound-config';
export type { CompoundConfig, LayoutConfig, RendererConfig } from './compound-config';

export interface TitleResolverCache {
  key: string;
  value: {
    label: string;
    icon?: string;
  };
}

export interface TitleResolver {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  titlePropertyChain: string;
  titleDecorator?: string;
  iconPropertyChain?: string;
  prerenderFallback?: boolean;
  responsePath?: string;
  fallbackTitle?: string;
  fallbackIcon?: string;
  /** @internal runtime cache – not user-configured */
  _cache?: TitleResolverCache;
}

export interface ViewGroupSettings {
  preloadUrl?: string;
  loadOnStartup?: boolean;
}

export type HistoryMethod = 'pushState' | 'replaceState';
