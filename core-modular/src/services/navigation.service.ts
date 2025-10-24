import type { Luigi } from '../core-api/luigi';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';
import { NavigationHelpers } from '../utilities/helpers/navigation-helpers';
import { RoutingHelpers } from '../utilities/helpers/routing-helpers';

export interface TopNavData {
  appTitle: string;
  logo: string;
  topNodes: [any];
  productSwitcher?: ProductSwitcher;
  profile?: ProfileSettings;
  appSwitcher?: AppSwitcher;
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
}

export interface PathData {
  selectedNode?: Node;
  selectedNodeChildren?: Node[];
  nodesInPath?: Node[];
  rootNodes: Node[];
}

export interface Node {
  pathSegment?: string;
  label?: string;
  icon?: string;
  children: Node[];
  category?: any;
  tabNav?: boolean;
  viewUrl?: string;
  openNodeInModal?: boolean;
  drawer?: ModalSettings;
  keepSelectedForChildren?: boolean;
  hideFromNav?: boolean;
  onNodeActivation?: (node: Node) => boolean | void;
  pageErrorHandler?: PageErrorHandler;
  externalLink?: ExternalLink;
  hideSideNav?: boolean;
  clientPermissions?: {
    urlParameters?: Record<string, any>;
  };
}

export interface PageErrorHandler {
  timeout: number;
  viewUrl?: string;
  redirectPath?: string;
  errorFn?: (node?: Node) => void;
}

export interface Category {
  isGroup?: boolean;
  id: string;
  label?: string;
  icon?: string;
  nodes?: NavItem[];
  collabsible?: boolean;
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
    const pathData: PathData = {
      selectedNodeChildren: rootNodes,
      nodesInPath: [{ children: rootNodes }],
      rootNodes
    };

    pathSegments.forEach((segment) => {
      if (pathData.selectedNodeChildren) {
        pathData.selectedNode = pathData.selectedNodeChildren.filter((n: Node) => n.pathSegment === segment)[0];
        pathData.selectedNodeChildren = pathData.selectedNode?.children;
        if (pathData.selectedNode) {
          pathData.nodesInPath?.push(pathData.selectedNode);
        }
      }
    });
    return pathData;
  }

  buildNavItems(nodes: Node[], selectedNode?: Node): NavItem[] {
    const items: NavItem[] = [];
    const catMap: Record<string, NavItem> = {};

    nodes?.forEach((node) => {
      if (node.label) {
        node.label = this.luigi.i18n().getTranslation(node.label);
      }

      if (node.category) {
        const catId = node.category.id || node.category.label || node.category;
        let catNode: NavItem = catMap[catId];

        if (!catNode) {
          catNode = {
            category: {
              id: catId,
              label: this.luigi.i18n().getTranslation(node.category.label || node.category.id || node.category),
              icon: node.category.icon,
              nodes: []
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

    return items;
  }

  shouldRedirect(path: string): string | undefined {
    const pathData = this.getPathData(path);
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

  getLeftNavData(path: string): LeftNavData {
    const pathData = this.getPathData(path);

    let navItems: NavItem[] = [];
    let pathToLeftNavParent: Node[] = [];
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
      navItems = this.buildNavItems(selectedNode.children);
    } else if (selectedNode && selectedNode.tabNav) {
      navItems = lastElement?.children ? this.buildNavItems(lastElement.children, selectedNode) : [];
    } else {
      navItems = this.buildNavItems(pathToLeftNavParent.pop()?.children || [], selectedNode);
    }

    // convert
    navItems = this.applyNavGroups(navItems);

    return {
      selectedNode: selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/'),
      sideNavFooterText: this.luigi.getConfig().settings?.sideNavFooterText
    };
  }

  getTopNavData(path: string): TopNavData {
    const cfg = this.luigi.getConfig();
    const pathData = this.getPathData(path);
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
      topNodes: this.buildNavItems(rootNodes) as [any],
      productSwitcher: cfg.navigation?.productSwitcher,
      profile: cfg.navigation?.profile,
      appSwitcher:
        cfg.navigation?.appSwitcher && this.getAppSwitcherData(cfg.navigation?.appSwitcher, cfg.settings?.header)
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

  getTabNavData(path: string): TabNavData {
    const pathData = this.getPathData(path);
    let selectedNode = pathData?.selectedNode;
    let parentNode: Node | undefined;
    const items: NavItem[] = [];
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

    const tabNavData = {
      selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/')
    };
    return tabNavData;
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

  private prepareRootNodes(navNodes: any[]): any[] {
    const rootNodes = JSON.parse(JSON.stringify(navNodes)) || [];

    if (!rootNodes.length) {
      return rootNodes;
    }

    navNodes.forEach((node: any) => {
      if (node?.badgeCounter?.count) {
        const badgeIitem = rootNodes.find((item: any) => item.badgeCounter && item.viewUrl === node.viewUrl);

        if (badgeIitem) {
          badgeIitem.badgeCounter.count = node.badgeCounter.count;
        }
      }
    });

    return rootNodes;
  }
}
