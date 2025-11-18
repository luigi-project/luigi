import type { FeatureToggles } from '../core-api/feature-toggles';
import type { Luigi } from '../core-api/luigi';
import { EscapingHelpers } from '../utilities/helpers/escaping-helpers';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';

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
  logout: ProfileLogout;
  items?: ProfileItem[];
  staticUserInfoFn?: () => Promise<UserInfo>;
}

export interface ProfileLogout {
  label?: string;
  icon?: string;
  testId?: string;
  altText?: string;
}

export interface ProfileItem {
  label?: string;
  link?: string;
  externalLink?: ExternalLink;
  icon?: string;
  testId?: string;
  altText?: string;
  openNodeAsModal?: boolean | ModalSettings;
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
  keepSelectedForChildren?: boolean;
  label?: string;
  onNodeActivation?: (node: Node) => boolean | void;
  openNodeInModal?: boolean;
  pageErrorHandler?: PageErrorHandler;
  pathSegment?: string;
  tabNav?: boolean;
  tooltip?: string;
  viewUrl?: string;
  isRootNode?: boolean;
}

export interface PageErrorHandler {
  timeout: number;
  viewUrl?: string;
  redirectPath?: string;
  errorFn?: (node?: Node) => void;
}

export interface Category {
  collabsible?: boolean;
  icon?: string;
  id: string;
  isGroup?: boolean;
  label?: string;
  nodes?: NavItem[];
  tooltip?: string;
}

export interface NavItem {
  node?: Node;
  category?: Category;
  selected?: boolean;
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
    const rootNodes = this.prepareRootNodes(cfg.navigation?.nodes);
    let pathParams: Record<string, any> = {};
    const pathData: PathData = {
      selectedNodeChildren: rootNodes,
      nodesInPath: [{ children: rootNodes }],
      rootNodes,
      pathParams
    };
    let globalContext = cfg.navigation.globalContext || {};
    let currentContext = globalContext;
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
        pathData.selectedNodeChildren = node.children;
        if (node.pathSegment?.startsWith(':')) {
          pathParams[node.pathSegment.replace(':', '')] = EscapingHelpers.sanitizeParam(segment);
          substitutedContext = RoutingHelpers.substituteDynamicParamsInObject(mergedContext, pathParams);
        }
        currentContext = substitutedContext;
        node.context = substitutedContext;
        pathData.selectedNode = node;
        pathData.selectedNodeChildren = pathData.selectedNode?.children;
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

  buildNavItems(nodes: Node[], selectedNode?: Node, pathData?: PathData): NavItem[] {
    const featureToggles: FeatureToggles = this.luigi.featureToggles();
    const catMap: Record<string, NavItem> = {};
    let items: NavItem[] = [];

    nodes?.forEach((node) => {
      if (node.label) {
        node.label = this.luigi.i18n().getTranslation(node.label);
        node.tooltip = this.resolveTooltipText(node, node.label);
      }

      if (node.category) {
        const catId = node.category.id || node.category.label || node.category;
        const catLabel = this.luigi.i18n().getTranslation(node.category.label || node.category.id || node.category);
        let catNode: NavItem = catMap[catId];

        if (!catNode) {
          catNode = {
            category: {
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

        catNode.category?.nodes?.push({ node, selected: node === selectedNode });
      } else {
        items.push({ node, selected: node === selectedNode });
      }
    });

    if (items?.length) {
      items = items.filter((item: NavItem) => {
        if (!item.node || pathData?.selectedNode === undefined) {
          return true;
        }
        return NavigationHelpers.isNodeAccessPermitted(
          item.node,
          this.getParentNode(pathData.selectedNode, pathData) as Node,
          pathData?.selectedNode?.context || {},
          this.luigi
        );
      });
    }
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
    return this.getPathData(path).selectedNode;
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
      navClick: (node: Node) => this.navItemClick(node, parentPath)
    };
  }

  navItemClick(item: Node, parentPath: string): void {
    if (parentPath.trim() === '' && !item.isRootNode) {
      console.error('Navigation error: parentPath is empty while the node is not a root node');
      return;
    }
    if (!item.pathSegment) {
      console.error('Navigation error: pathSegment is not defined for the node.');
      return;
    }

    const fullPath = '/' + [parentPath, item.pathSegment].join('/').split('/').filter(Boolean).join('/');
    this.luigi.navigation().navigate(fullPath);
  }

  getTopNavData(path: string, pData?: PathData): TopNavData {
    const cfg = this.luigi.getConfig();

    const pathData: PathData = pData ?? this.getPathData(path);
    const rootNodes = this.prepareRootNodes(cfg.navigation?.nodes);
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
    return {
      appTitle: headerTitle || cfg.settings?.header?.title,
      logo: cfg.settings?.header?.logo,
      topNodes: this.buildNavItems(rootNodes),
      productSwitcher: cfg.navigation?.productSwitcher,
      profile: cfg.navigation?.profile,
      appSwitcher:
        cfg.navigation?.appSwitcher && this.getAppSwitcherData(cfg.navigation?.appSwitcher, cfg.settings?.header),
      navClick: (node: Node) => {
        this.navItemClick(node, '');
      }
    };
  }

  getParentNode(node: Node, pathData: PathData) {
    if (node === pathData.nodesInPath?.[pathData.nodesInPath.length - 1]) {
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

    const navItems = this.buildNavItems(pathDataTruncatedChildren, selectedNode);
    const parentPath = NavigationHelpers.buildPath(pathData.nodesInPath || [], pathData);
    return {
      selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/'),
      navClick: (node: Node) => this.navItemClick(node, parentPath)
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

  private resolveTooltipText(node: any, translation: string): string {
    return NavigationHelpers.generateTooltipText(node, translation, this.luigi);
  }

  private prepareRootNodes(navNodes: any[]): any[] {
    const rootNodes = JSON.parse(JSON.stringify(navNodes)) || [];
    if (!rootNodes.length) {
      return rootNodes;
    }
    rootNodes.forEach((rootNode: Node) => {
      rootNode.isRootNode = true;
    });

    navNodes.forEach((node: any) => {
      if (node?.badgeCounter?.count) {
        const badgeItem = rootNodes.find((item: any) => item.badgeCounter && item.viewUrl === node.viewUrl);

        if (badgeItem) {
          badgeItem.badgeCounter.count = node.badgeCounter.count;
        }
      }
    });

    return rootNodes;
  }
}
