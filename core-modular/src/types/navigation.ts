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
  selectedNode: any;
  items: NavItem[];
  basePath: string;
  sideNavFooterText?: string;
  navClick?: (item: NavItem) => void;
}

export interface PathData {
  selectedNode?: Node;
  selectedNodeChildren?: Node[];
  nodesInPath?: Node[];
  rootNodes: Node[];
  pathParams: Record<string, any>;
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
  context?: Record<string, any>;
  drawer?: ModalSettings;
  externalLink?: ExternalLink;
  hideFromNav?: boolean;
  hideSideNav?: boolean;
  icon?: string;
  isRootNode?: boolean;
  keepSelectedForChildren?: boolean;
  label?: string;
  onNodeActivation?: (node: Node) => boolean | void;
  openNodeInModal?: boolean;
  pageErrorHandler?: PageErrorHandler;
  parent?: Node;
  pathSegment?: string;
  runTimeErrorHandler?: RunTimeErrorHandler;
  tabNav?: boolean;
  tooltipText?: string;
  viewUrl?: string;
  visibleForFeatureToggles?: string[];
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

export interface NavigationRequestBase {
  preventContextUpdate?: boolean;
  preventHistoryEntry?: boolean;
  withoutSync?: boolean;
}

export interface NavigationRequestParams extends NavigationRequestBase {
  modalSettings?: any;
  newTab?: boolean;
  path: string;
  preserveView?: string;
}

export interface NavigationRequestEvent {
  detail: NavigationRequestBase;
}
