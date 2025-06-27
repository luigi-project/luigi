import type { Luigi } from '../core-api/luigi';

export interface TopNavData {
  appTitle: string;
  logo: string;
  topNodes: [any];
  productSwitcher?: ProductSwitcher;
  profile?: ProfileSettings;
}

export interface ProfileSettings {
  logout: ProfileLogout;
  items?: ProfileItems[];
  staticUserInfoFn?: () => Promise<UserInfo>;
}

export interface ProfileLogout {
  label?: string;
  icon?: string;
  testId?: string;
  altText?: string;
}

export interface ProfileItems {
  label?: string;
  link?: string;
  externalLink?: ExternalLinkItems;
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
}

export interface Category {
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
  items?: [ProductSwitcherItems];
  label?: string;
  testId?: string;
}

export interface ProductSwitcherItems {
  altText?: string;
  externalLink?: ExternalLinkItems;
  icon?: string;
  label?: string;
  link?: string;
  selected?: boolean;
  subTitle?: string;
  testId?: string;
}

export interface ExternalLinkItems {
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
    const rootNodes = cfg.navigation?.nodes || [];
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
      if (node.category) {
        let catId = node.category.id || node.category.label || node.category;
        let catNode: NavItem = catMap[catId];
        if (!catNode) {
          catNode = {
            category: {
              id: catId,
              label: node.category.label || node.category.id || node.category,
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
    } else if (pathData.selectedNode && !pathData.selectedNode.viewUrl && pathData.selectedNode.children?.length > 0) {
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
  getTruncatedChildren(children: any) {
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
    if (lastElement.keepSelectedForChildren || lastElement.tabNav) {
      selectedNode = lastElement;
      pathDataTruncatedChildren.pop();
      lastElement = [...pathDataTruncatedChildren].pop();
    }

    if (selectedNode && pathData.rootNodes.includes(selectedNode)) {
      navItems = this.buildNavItems(selectedNode.children);
    } else if (selectedNode && selectedNode.tabNav) {
      navItems = this.buildNavItems(lastElement.children, selectedNode);
    } else {
      navItems = this.buildNavItems(pathToLeftNavParent.pop()?.children || [], selectedNode);
    }

    console.log("NavigationService.getLeftNavData",  this.luigi.getConfig().navigation?.sideNavFooterText)
    return {
      selectedNode: selectedNode,
      items: navItems,
      basePath: basePath.replace(/\/\/+/g, '/'),
      sideNavFooterText: this.luigi.getConfig().settings?.sideNavFooterText
    };
  }

  getTopNavData(): TopNavData {
    const cfg = this.luigi.getConfig();
    return {
      appTitle: cfg.settings?.header?.title,
      logo: cfg.settings?.header?.logo,
      topNodes: this.buildNavItems(cfg.navigation?.nodes) as [any],
      productSwitcher: cfg.navigation?.productSwitcher,
      profile: cfg.navigation?.profile
    };
  }

  getParentNode(node: Node, pathData: PathData) {
    if (node === pathData.nodesInPath?.[pathData.nodesInPath.length - 1]) {
      return pathData.nodesInPath[pathData.nodesInPath.length - 2];
    }
    return undefined;
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
}
