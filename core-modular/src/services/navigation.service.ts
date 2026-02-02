import { cloneDeep } from 'lodash';
import type { Luigi } from '../core-api/luigi';
import { AuthHelpers } from '../utilities/helpers/auth-helpers';
import { EscapingHelpers } from '../utilities/helpers/escaping-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';
import { TOP_NAV_DEFAULTS } from '../utilities/luigi-config-defaults';
import { AuthLayerSvc } from './auth-layer.service';
import { serviceRegistry } from './service-registry';
import { ModalService } from './modal.service';

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

export class NavigationService {
  constructor(private luigi: Luigi) {}

  getPathData(path: string): PathData {
    const cfg = this.luigi.getConfig();
    let pathSegments = path.split('/');
    if (pathSegments?.length > 0 && pathSegments[0] === '') {
      pathSegments = pathSegments.slice(1);
    }

    let globalContext = cfg.navigation.globalContext || {};
    let currentContext = globalContext;

    const rootNodes = this.prepareRootNodes(cfg.navigation?.nodes, currentContext);
    let pathParams: Record<string, any> = {};
    const pathData: PathData = {
      selectedNodeChildren: rootNodes,
      nodesInPath: [{ children: rootNodes }],
      rootNodes,
      pathParams
    };
    pathSegments.forEach((segment) => {
      if (pathData.selectedNodeChildren) {
        const node = this.findMatchingNode(segment, pathData.selectedNodeChildren || []);
        if (!node) {
          console.log('No matching node found for segment:', segment, 'in children:', pathData.selectedNodeChildren);
          return;
        }
        const nodeContext = node.context || {};
        const mergedContext = NavigationHelpers.mergeContext(currentContext, nodeContext);
        let substitutedContext = mergedContext;
        pathData.selectedNodeChildren = this.getAccessibleNodes(node, node.children || [], mergedContext);
        if (node.pathSegment?.startsWith(':')) {
          pathParams[node.pathSegment.replace(':', '')] = EscapingHelpers.sanitizeParam(segment);
          substitutedContext = RoutingHelpers.substituteDynamicParamsInObject(mergedContext, pathParams);
        }
        currentContext = substitutedContext;
        node.context = substitutedContext;
        pathData.selectedNode = node;
        pathData.selectedNodeChildren = pathData.selectedNode?.children
          ? this.getAccessibleNodes(pathData.selectedNode, pathData.selectedNode.children, currentContext)
          : undefined;
        if (pathData.selectedNode) {
          pathData.nodesInPath?.push(pathData.selectedNode);
        }
      }
    });
    return pathData;
  }

  findMatchingNode(urlPathElement: string, nodes: Node[]): Node | undefined {
    let result: Node | undefined = undefined;
    const segmentsLength = nodes.filter((n) => !!n.pathSegment).length;
    const dynamicSegmentsLength = nodes.filter((n) => n.pathSegment && n.pathSegment.startsWith(':')).length;

    if (segmentsLength > 1) {
      if (dynamicSegmentsLength === 1) {
        console.warn(
          'Invalid node setup detected. \nStatic and dynamic nodes cannot be used together on the same level. Static node gets cleaned up. \nRemove the static node from the configuration to resolve this warning. \nAffected pathSegment:',
          urlPathElement,
          'Children:',
          nodes
        );
        nodes = nodes.filter((n) => n.pathSegment && n.pathSegment.startsWith(':'));
      }
      if (dynamicSegmentsLength > 1) {
        console.error(
          'Invalid node setup detected. \nMultiple dynamic nodes are not allowed on the same level. Stopped navigation. \nInvalid Children:',
          nodes
        );
        return undefined;
      }
    }
    nodes.some((node) => {
      if (
        // Static nodes
        node.pathSegment === urlPathElement ||
        // Dynamic nodes
        (node.pathSegment && node.pathSegment.startsWith(':'))
      ) {
        // Return first matching node
        result = node;
        return true;
      }
    });
    return result;
  }

  buildNavItems(nodes: Node[], selectedNode: Node | undefined, pathData: PathData): NavItem[] {
    const catMap: Record<string, NavItem> = {};
    const items: NavItem[] = [];

    nodes?.forEach((node) => {
      if (
        !NavigationHelpers.isNodeAccessPermitted(
          node,
          this.getParentNode(pathData.selectedNode, pathData) as Node,
          pathData?.selectedNode?.context || {},
          this.luigi
        )
      ) {
        return;
      }

      if (node.category) {
        const catId = node.category.id || node.category.label || node.category;
        const catLabel = this.luigi.i18n().getTranslation(node.category.label || node.category.id || node.category);
        let catNode: NavItem = catMap[catId];

        if (!catNode) {
          catNode = {
            category: {
              altText: node.category.altText || '',
              icon: node.category.icon,
              id: catId,
              label: catLabel,
              nodes: [],
              tooltip: this.resolveTooltipText(node.category, catLabel)
            }
          };
          catMap[catId] = catNode;
          items.push(catNode);
        }

        catNode.category?.nodes?.push({
          node,
          selected: node === selectedNode,
          label: node.label ? this.luigi.i18n().getTranslation(node.label) : undefined,
          tooltip: node.label ? this.resolveTooltipText(node, node.label) : undefined,
          altText: node.altText,
          icon: node.icon
        });
      } else {
        items.push({
          altText: node.altText,
          icon: node.icon,
          label: node.label ? this.luigi.i18n().getTranslation(node.label) : undefined,
          tooltip: node.label ? this.resolveTooltipText(node, node.label) : undefined,
          node,
          selected: node === selectedNode
        });
      }
    });

    return items;
  }

  shouldRedirect(path: string, pData?: PathData): string | undefined {
    const pathData = pData ?? this.getPathData(path);
    if (path == '') {
      // poor mans implementation, full path resolution TBD
      return pathData.rootNodes[0].pathSegment;
    } else if (pathData.selectedNode && !pathData.selectedNode.viewUrl && pathData.selectedNode.children?.length) {
      return path + '/' + pathData.selectedNode.children[0].pathSegment;
    }
    return undefined;
  }

  getCurrentNode(path: string): any {
    const pathData = this.getPathData(path);
    const node = pathData.selectedNode;
    if (
      !node ||
      !NavigationHelpers.isNodeAccessPermitted(
        node,
        this.getParentNode(pathData.selectedNode, pathData) as Node,
        pathData?.selectedNode?.context || {},
        this.luigi
      )
    ) {
      return undefined;
    }
    return node;
  }

  getPathParams(path: string): Record<string, any> {
    return this.getPathData(path).pathParams;
  }

  /**
   * getTruncatedChildren
   *
   * Returns an array of children without the childs below
   * last node that has keepSelectedForChildren or tabnav enabled
   * @param array children
   * @returns array children
   */
  getTruncatedChildren(children: any): any[] {
    let childToKeepFound = false;
    let tabNavUnset = false;
    let res: any = [];

    children
      .slice()
      .reverse()
      .forEach((node: any) => {
        if (!childToKeepFound || node.tabNav) {
          if (node.tabNav === false) {
            // explicitly set to false
            tabNavUnset = true;
          }
          if (node.keepSelectedForChildren === false) {
            // explicitly set to false
            childToKeepFound = true;
          } else if (node.keepSelectedForChildren || (node.tabNav && !tabNavUnset)) {
            childToKeepFound = true;
            res = [];
          }
        }
        res.push(node);
      });

    return res.reverse();
  }

  applyNavGroups(items: NavItem[]): NavItem[] {
    const categoryById: Record<string, NavItem> = {};
    const subCatEntries: NavItem[] = [];
    const subCatDelim = '::';
    const converted: NavItem[] = [];

    items.forEach((entry) => {
      if (entry.node) {
        //single nodes
        converted.push(entry);
      } else if (entry.category) {
        // categories
        const catId = entry.category.id;
        if (catId && catId.indexOf(subCatDelim) > 0) {
          // subcat
          subCatEntries.push(entry);
        } else {
          // supercat
          const isGroup = entry.category.isGroup;
          categoryById[catId] = entry;
          converted.push(entry);
        }
      }
    });

    subCatEntries.forEach((entry) => {
      const superCatId = entry.category?.id.split(subCatDelim)[0] || '';
      const potentialSuperCat = categoryById[superCatId];
      if (!potentialSuperCat) {
        // dunno yet what to do in this case
      } else if (potentialSuperCat.category) {
        if (!potentialSuperCat.category.isGroup) {
          // convert to super cat
          potentialSuperCat.category.isGroup = true;
        }
        if (!potentialSuperCat.category.nodes) {
          potentialSuperCat.category.nodes = [];
        }
        potentialSuperCat.category.nodes.push(entry);
      }
    });

    return converted.filter((item) => {
      if (item.category?.isGroup && item.category?.nodes && item.category?.nodes.length > 0) {
        for (let index = 0; index < item.category?.nodes.length; index++) {
          const subitem = item.category?.nodes[index];
          if (
            (subitem.node && !subitem.node.hideFromNav && subitem.node.label) ||
            (subitem.category?.nodes &&
              subitem.category.nodes.filter((node) => !node.node?.hideFromNav && node.node?.label).length > 0)
          ) {
            return true;
          }
        }
        return false;
      }
      return true;
    });
  }

  getLeftNavData(path: string, pData?: PathData): LeftNavData {
    const pathData = pData ?? this.getPathData(path);
    let navItems: NavItem[] = [];
    const pathToLeftNavParent: Node[] = [];
    let basePath = '';
    pathData.nodesInPath?.forEach((nip) => {
      if (nip.children) {
        if (!nip.tabNav) {
          basePath += '/' + (nip.pathSegment || '');
        }
        pathToLeftNavParent.push(nip);
      }
    });

    const pathDataTruncatedChildren = this.getTruncatedChildren(pathData.nodesInPath);
    let lastElement = [...pathDataTruncatedChildren].pop();
    let selectedNode = pathData.selectedNode;
    if (lastElement?.keepSelectedForChildren || lastElement?.tabNav) {
      selectedNode = lastElement;
      pathDataTruncatedChildren.pop();
      lastElement = [...pathDataTruncatedChildren].pop();
    }

    if (selectedNode && selectedNode.children && pathData.rootNodes.includes(selectedNode)) {
      navItems = this.buildNavItems(selectedNode.children, undefined, pathData);
    } else if (selectedNode && selectedNode.tabNav) {
      navItems = lastElement?.children ? this.buildNavItems(lastElement.children, selectedNode, pathData) : [];
    } else {
      navItems = this.buildNavItems([...pathToLeftNavParent].pop()?.children || [], selectedNode, pathData);
    }
    const parentPath = NavigationHelpers.buildPath(pathToLeftNavParent, pathData);
    // convert
    navItems = this.applyNavGroups(navItems);
    return {
      selectedNode: selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/'),
      sideNavFooterText: this.luigi.getConfig().settings?.sideNavFooterText,
      navClick: (item: NavItem) => item.node && this.navItemClick(item.node, parentPath)
    };
  }

  navItemClick(item: Node, parentPath: string): void {
    if (!item.pathSegment) {
      console.error('Navigation error: pathSegment is not defined for the node.');
      return;
    }
    let fullPath = '/';
    if (parentPath.trim() !== '') {
      fullPath += parentPath + '/';
    } else if (!item.isRootNode) {
      console.error('Navigation error: parentPath is empty while the node is not a root node');
      return;
    }
    fullPath += item.pathSegment;
    this.luigi.navigation().navigate(fullPath);
  }

  getTopNavData(path: string, pData?: PathData): TopNavData {
    const cfg = this.luigi.getConfig();
    const pathData: PathData = pData ?? this.getPathData(path);
    const rootNodes = this.prepareRootNodes(cfg.navigation?.nodes, cfg.navigation?.globalContext || {});
    const profileItems = cfg.navigation?.profile?.items?.length
      ? JSON.parse(JSON.stringify(cfg.navigation.profile.items))
      : [];
    const appSwitcher =
      cfg.navigation?.appSwitcher && this.getAppSwitcherData(cfg.navigation?.appSwitcher, cfg.settings?.header);
    const headerTitle = NavigationHelpers.updateHeaderTitle(appSwitcher, pathData);

    if (profileItems?.length) {
      profileItems.map((item: ProfileItem) => ({
        ...item,
        label: this.luigi.i18n().getTranslation(item.label || '')
      }));
    }

    const logoutLabel =
      this.luigi.i18n().getTranslation(cfg.navigation?.profile?.logout?.label) || TOP_NAV_DEFAULTS.logout.label;
    const itemClick = (item: ProfileItem) => {
      if (item.openNodeInModal && !item.externalLink?.url) {
        this.luigi.navigation().openAsModal(item.link || '', item.openNodeInModal === true ? {} : item.openNodeInModal);
      } else if (item.link) {
        this.luigi.navigation().navigate(item.link);
      } else if (item.externalLink?.url) {
        if (item.externalLink.sameWindow) {
          window.location.href = item.externalLink.url;
        } else {
          const newWindow = window.open(item.externalLink.url, '_blank', 'noopener noreferrer');
          if (newWindow) {
            newWindow.opener = null;
            newWindow.focus();
          }
        }
      }
    };
    const profileSettings: ProfileSettings = {
      authEnabled: this.luigi.auth().isAuthorizationEnabled(),
      signedIn: this.luigi.auth().isAuthorizationEnabled() && AuthHelpers.isLoggedIn(),
      items: profileItems,
      itemClick,
      logout: {
        altText:
          this.luigi.i18n().getTranslation(cfg.navigation?.profile?.logout?.altText) || TOP_NAV_DEFAULTS.logout.label,
        label: logoutLabel,
        icon: cfg.navigation?.profile?.logout?.icon || TOP_NAV_DEFAULTS.logout.icon,
        testId: cfg.navigation?.profile?.logout?.testId || NavigationHelpers.prepareForTests(logoutLabel),
        doLogout: () => {
          AuthLayerSvc.logout();
        }
      },
      onUserInfoUpdate: (fn) => {
        if (cfg.navigation?.profile?.staticUserInfoFn) {
          const uifRes = cfg.navigation?.profile?.staticUserInfoFn();
          if (uifRes instanceof Promise) {
            uifRes.then((uInfo) => {
              fn(uInfo);
            });
          } else {
            fn(uifRes);
          }
        } else {
          AuthLayerSvc.getUserInfoStore().subscribe((uInfo: UserInfo) => {
            fn(uInfo);
          });
        }
      }
    };

    return {
      appTitle: headerTitle || cfg.settings?.header?.title,
      logo: cfg.settings?.header?.logo,
      topNodes: this.buildNavItems(rootNodes, undefined, pathData) as [any],
      productSwitcher: cfg.navigation?.productSwitcher,
      profile: profileSettings,
      appSwitcher:
        cfg.navigation?.appSwitcher && this.getAppSwitcherData(cfg.navigation?.appSwitcher, cfg.settings?.header),
      navClick: (item: NavItem) => item.node && this.navItemClick(item.node, '')
    };
  }

  getParentNode(node: Node | undefined, pathData: PathData): Node | undefined {
    if (node && node === pathData.nodesInPath?.[pathData.nodesInPath.length - 1]) {
      return pathData.nodesInPath[pathData.nodesInPath.length - 2];
    }

    return undefined;
  }

  getAppSwitcherData(appSwitcherData: AppSwitcher, headerSettings: any): AppSwitcher | undefined {
    const appSwitcher = appSwitcherData;
    const showMainAppEntry = appSwitcher?.showMainAppEntry;

    if (appSwitcher && appSwitcher.items && showMainAppEntry) {
      const mainAppEntry = {
        title: this.luigi.i18n().getTranslation(headerSettings.title || ''),
        subTitle: headerSettings.subTitle,
        link: '/'
      };

      appSwitcher.items?.map((item: AppSwitcherItem) => ({
        ...item,
        title: this.luigi.i18n().getTranslation(item.title || '')
      }));

      if (appSwitcher.items.some((item: AppSwitcherItem) => item.link === mainAppEntry.link)) {
        return appSwitcher;
      }

      appSwitcher.items.unshift(mainAppEntry);
    }

    return appSwitcher;
  }

  getTabNavData(path: string, pData?: PathData): TabNavData {
    const pathData = pData ?? this.getPathData(path);
    const selectedNode = pathData?.selectedNode;
    let parentNode: Node | undefined;
    if (!selectedNode) return {};
    if (!selectedNode.tabNav) {
      parentNode = this.getParentNode(selectedNode, pathData) as Node;
      if (parentNode && !parentNode.tabNav) return {};
    }
    let basePath = '';
    pathData.nodesInPath?.forEach((nip) => {
      if (nip.children) {
        basePath += '/' + (nip.pathSegment || '');
      }
    });

    const pathDataTruncatedChildren = parentNode
      ? this.getTruncatedChildren(parentNode.children)
      : this.getTruncatedChildren(selectedNode.children);

    const navItems = this.buildNavItems(pathDataTruncatedChildren, selectedNode, pathData);
    const parentPath = NavigationHelpers.buildPath(pathData.nodesInPath || [], pathData);
    return {
      selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/'),
      navClick: (item: NavItem) => item.node && this.navItemClick(item.node, parentPath)
    };
  }

  /**
   * Handles changes between navigation nodes by invoking a configured hook function.
   *
   * This method retrieves the `navigation.nodeChangeHook` function from the Luigi configuration.
   * If the hook is defined and is a function, it is called with the previous and next node as arguments.
   * If the hook is defined but not a function, a warning is logged to the console.
   *
   * @param prevNode - The previous navigation node, or `undefined` if there was no previous node.
   * @param nextNode - The new navigation node that is being navigated to.
   */
  onNodeChange(prevNode: Node | undefined, nextNode: Node): void {
    const invokedFunction = this.luigi.getConfigValue('navigation.nodeChangeHook');
    if (GenericHelpers.isFunction(invokedFunction)) {
      invokedFunction(prevNode, nextNode);
    } else if (invokedFunction !== undefined) {
      console.warn('nodeChangeHook is not a function!');
    }
  }

  /**
   * Extracts navigation data from the provided path string.
   *
   * This method parses the given path to retrieve structured path data and the last node object
   * in the navigation hierarchy. It utilizes internal helpers to process the path and extract
   * relevant navigation information.
   *
   * @param path - The navigation path string to extract data from.
   * @returns A promise that resolves to an object containing:
   *   - `nodeObject`: The last node object in the navigation path.
   *   - `pathData`: The structured data representation of the path.
   */
  async extractDataFromPath(path: string): Promise<{ nodeObject: Node; pathData: PathData }> {
    const pathData = this.getPathData(path);
    const nodeObject: any = RoutingHelpers.getLastNodeObject(pathData);
    return { nodeObject, pathData };
  }

  async shouldPreventNavigation(node: Node): Promise<boolean> {
    if (
      node?.onNodeActivation &&
      (GenericHelpers.isFunction(node.onNodeActivation) || GenericHelpers.isAsyncFunction(node.onNodeActivation)) &&
      (await node.onNodeActivation(node)) === false
    ) {
      return true;
    }

    return false;
  }

  async shouldPreventNavigationForPath(nodepath: string): Promise<boolean> {
    const { nodeObject } = await this.extractDataFromPath(nodepath);

    if (await this.shouldPreventNavigation(nodeObject)) {
      return true;
    }

    return false;
  }

  async openViewInNewTab(nodepath: string): Promise<void> {
    if (await this.shouldPreventNavigationForPath(nodepath)) {
      return;
    }

    const hashRouting = this.luigi.getConfigValue('routing.useHashRouting');

    if (hashRouting) {
      nodepath = '#' + nodepath;
    }

    /*'noopener,noreferrer' required to disable XSS injections*/
    window.open(nodepath, '_blank', 'noopener,noreferrer');
  }

  private resolveTooltipText(node: any, translation: string): string {
    return NavigationHelpers.generateTooltipText(node, translation, this.luigi);
  }

  private prepareRootNodes(navNodes: any[], context: Record<string, any>): Node[] {
    const rootNodes = cloneDeep(navNodes) || [];

    if (!rootNodes.length) {
      return rootNodes;
    }

    rootNodes.forEach((rootNode: Node) => {
      rootNode.isRootNode = true;
    });

    return this.getAccessibleNodes(undefined, rootNodes, context);
  }

  private getAccessibleNodes(node: Node | undefined, children: Node[], context: Record<string, any>): Node[] {
    return children
      ? children.filter((child) => NavigationHelpers.isNodeAccessPermitted(child, node, context, this.luigi))
      : [];
  }

  async handleNavigationRequest(
    path: string,
    preserveView?: string,
    modalSettings?: any,
    newTab?: boolean,
    withoutSync?: boolean,
    callbackFn?: any
  ): Promise<void> {
    const normalizedPath = path.replace(/\/\/+/g, '/');
    const preventContextUpdate = false; //TODO just added for popState eventDetails

    if (modalSettings) {
      this.luigi.navigation().openAsModal(path, modalSettings, callbackFn);
    } else {
      const eventDetail = {
        detail: {
          preventContextUpdate,
          withoutSync: !!withoutSync
        }
      };

      await serviceRegistry.get(ModalService).closeModals();

      if (newTab) {
        await this.openViewInNewTab(path);
        return;
      }

      if (this.luigi.getConfig().routing?.useHashRouting) {
        if (!withoutSync) {
          location.hash = normalizedPath;
        } else {
          const event = new CustomEvent('hashchange', eventDetail);

          window.history.pushState({ path: '/#' + normalizedPath }, '', '/#' + normalizedPath);
          window.dispatchEvent(event);
        }
      } else {
        const event = new CustomEvent('popstate', eventDetail);

        window.history.pushState({ path: normalizedPath }, '', normalizedPath);
        window.dispatchEvent(event);
      }
    }
  }
}
