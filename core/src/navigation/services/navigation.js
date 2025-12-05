// Main methods used to display and handle the navigation.
// Please consider adding any new methods to 'navigation-helpers' if they don't require anything from this file.

import {
  AsyncHelpers,
  EscapingHelpers,
  GenericHelpers,
  NavigationHelpers,
  RoutingHelpers
} from '../../utilities/helpers';

import { LuigiConfig } from '../../core-api';
import { NodeDataManagementStorage } from '../../services/node-data-management';

class NavigationClass {
  async getNavigationPath(rootNavProviderPromise, path = '') {
    try {
      const activePath = GenericHelpers.getTrimmedUrl(path);

      if (!rootNavProviderPromise) {
        console.error('No navigation nodes provided in the configuration.');
        return [{}];
      }
      let rootNode;
      if (NodeDataManagementStorage.hasRootNode()) {
        rootNode = NodeDataManagementStorage.getRootNode().node;
      }
      if (!rootNode) {
        const topNavNodes = await rootNavProviderPromise;
        if (GenericHelpers.isObject(topNavNodes)) {
          rootNode = topNavNodes;
          if (rootNode.pathSegment) {
            rootNode.pathSegment = '';
            console.warn('Root node must have an empty path segment. Provided path segment will be ignored.');
          }
        } else {
          rootNode = { children: topNavNodes };
        }
        rootNode.children = await this.getChildren(rootNode);
        NodeDataManagementStorage.setRootNode(rootNode);
      }
      const nodeNamesInCurrentPath = activePath.split('/');
      const globalContext = LuigiConfig.getConfigValue('navigation.globalContext');
      const rootContext = { ...(globalContext || {}), ...(rootNode.context || {}) };
      const navObj = await this.buildNode(nodeNamesInCurrentPath, [rootNode], rootNode.children, rootContext);
      const navPathSegments = navObj.navigationPath.filter(x => x.pathSegment).map(x => x.pathSegment);
      navObj.isExistingRoute = !activePath || nodeNamesInCurrentPath.length === navPathSegments.length;
      const pathSegments = activePath.split('/');
      navObj.matchedPath = pathSegments
        .filter((segment, index) => {
          return (
            (navPathSegments[index] && navPathSegments[index].startsWith(':')) || navPathSegments[index] === segment
          );
        })
        .join('/');

      return navObj;
    } catch (err) {
      console.error('Failed to load top navigation nodes.', err);
    }
  }

  async getChildren(node, context) {
    if (!node) {
      return [];
    }
    let children = [];
    if (!NodeDataManagementStorage.hasChildren(node)) {
      try {
        children = await AsyncHelpers.getConfigValueFromObjectAsync(node, 'children', context || node.context);
        if (children === undefined || children === null) {
          children = [];
        }
        children =
          children.map(n => this.getExpandStructuralPathSegment(n)).map(n => this.bindChildToParent(n, node)) || [];
      } catch (err) {
        console.error('Could not lazy-load children for node', err);
      }
    } else {
      let data = NodeDataManagementStorage.getChildren(node);
      if (data) children = data.children;
    }
    let filteredChildren = this.getAccessibleNodes(node, children, context);
    NodeDataManagementStorage.setChildren(node, { children, filteredChildren });
    return filteredChildren;
  }

  /**
   * returns filtered children from cache if present otherwise calculates them.
   * */
  async getFilteredChildren(node) {
    return NodeDataManagementStorage.hasChildren(node)
      ? Navigation.getChildrenFromCache(node)
      : await Navigation.getChildren(node);
  }

  /**
   * Returns the children from the passed node from Cache
   * @param {} node
   */
  getChildrenFromCache(node) {
    let data = NodeDataManagementStorage.getChildren(node);
    return data ? data.filteredChildren : [];
  }

  getAccessibleNodes(node, children, context) {
    return children ? children.filter(child => NavigationHelpers.isNodeAccessPermitted(child, node, context)) : [];
  }

  bindChildToParent(child, node) {
    // Checking for pathSegment to exclude virtual root node
    // node.pathSegment check is also required for virtual nodes like categories
    if (node && node.pathSegment) {
      child.parent = node;
    }
    return child;
  }

  getExpandStructuralPathSegment(node) {
    // Checking for pathSegment to exclude virtual root node
    if (node && node.pathSegment && node.pathSegment.indexOf('/') !== -1) {
      const segs = node.pathSegment.split('/');
      const clonedNode = { ...node };
      const buildStructuralNode = (segs, node) => {
        const seg = segs.shift();
        let child = {};
        if (segs.length) {
          child.pathSegment = seg;
          if (node.hideFromNav) child.hideFromNav = node.hideFromNav;
          child.children = [buildStructuralNode(segs, node)];
        } else {
          // set original data to last child
          child = clonedNode;
          child.pathSegment = seg;
        }
        return child;
      };
      return buildStructuralNode(segs, node);
    }
    return node;
  }

  async buildNode(nodeNamesInCurrentPath, nodesInCurrentPath, childrenOfCurrentNode, context, pathParams = {}) {
    if (!context.parentNavigationContexts) {
      context.parentNavigationContexts = [];
    }
    let result = {
      navigationPath: nodesInCurrentPath,
      context: context,
      pathParams: pathParams
    };
    if (nodeNamesInCurrentPath.length > 0 && childrenOfCurrentNode && childrenOfCurrentNode.length > 0) {
      const urlPathElement = nodeNamesInCurrentPath[0];
      const node = this.findMatchingNode(urlPathElement, childrenOfCurrentNode);
      if (node) {
        nodesInCurrentPath.push(node);
        let newContext = NavigationHelpers.applyContext(context, node.context, node.navigationContext);
        if (node.pathSegment.startsWith(':')) {
          pathParams[node.pathSegment.replace(':', '')] = EscapingHelpers.sanitizeParam(urlPathElement);
        }
        newContext = RoutingHelpers.substituteDynamicParamsInObject(newContext, pathParams);
        try {
          /**
           * If its a virtual tree,
           * build static children
           */
          this.buildVirtualTree(node, nodeNamesInCurrentPath, pathParams);

          // STANDARD PROCEDURE
          let children = await this.getChildren(node, newContext);
          const newNodeNamesInCurrentPath = nodeNamesInCurrentPath.slice(1);
          result = this.buildNode(newNodeNamesInCurrentPath, nodesInCurrentPath, children, newContext, pathParams);
        } catch (err) {
          console.error('Error getting nodes children', err);
        }
      }
    }
    return result;
  }

  /**
   * Requires str to include :virtualPath
   * and pathParams consist of :virtualSegment_N
   * for deep nested virtual tree building
   *
   * @param {string} str
   * @param {Object} pathParams
   * @param {number} _virtualPathIndex
   */
  buildVirtualViewUrl(str, pathParams, _virtualPathIndex) {
    let newStr = '';
    for (const key in pathParams) {
      if (key.startsWith('virtualSegment')) {
        newStr += ':' + key + '/';
      }
    }
    if (!_virtualPathIndex) {
      return str;
    }
    newStr += ':virtualSegment_' + _virtualPathIndex + '/';
    return str + '/' + newStr;
  }

  buildVirtualTree(node, nodeNamesInCurrentPath, pathParams) {
    const virtualTreeRoot = node.virtualTree;
    // Temporary store values that will be cleaned up when creating a copy
    const virtualTreeChild = node._virtualTree;
    const _virtualViewUrl = node._virtualViewUrl || node.viewUrl;
    if ((virtualTreeRoot || virtualTreeChild) && nodeNamesInCurrentPath[0]) {
      let _virtualPathIndex = node._virtualPathIndex;
      if (virtualTreeRoot) {
        _virtualPathIndex = 0;
        node.keepSelectedForChildren = true;
      }

      // Allowing maximum of 50 path segments to avoid memory issues
      const maxPathDepth = 50;
      if (_virtualPathIndex > maxPathDepth) {
        return;
      }

      _virtualPathIndex++;
      const keysToClean = ['_*', 'virtualTree', 'parent', 'children', 'keepSelectedForChildren', 'navigationContext'];
      const newChild = GenericHelpers.removeProperties(node, keysToClean);
      Object.assign(newChild, {
        pathSegment: ':virtualSegment_' + _virtualPathIndex,
        label: ':virtualSegment_' + _virtualPathIndex,
        viewUrl: GenericHelpers.trimTrailingSlash(
          this.buildVirtualViewUrl(_virtualViewUrl, pathParams, _virtualPathIndex)
        ),
        _virtualTree: true,
        _virtualPathIndex,
        _virtualViewUrl
      });

      const isVirtualChildren =
        Array.isArray(node.children) && node.children.length > 0 ? node.children[0]._virtualTree : false;
      if (node.children && !isVirtualChildren) {
        console.warn(
          'Found both virtualTree and children nodes defined on a navigation node. \nChildren nodes are redundant and ignored when virtualTree is enabled. \nPlease refer to documentation'
        );
      }
      node.children = [newChild];
    }
  }

  findMatchingNode(urlPathElement, nodes) {
    let result = null;
    const segmentsLength = nodes.filter(n => !!n.pathSegment).length;
    const dynamicSegmentsLength = nodes.filter(n => n.pathSegment && n.pathSegment.startsWith(':')).length;
    urlPathElement = urlPathElement.includes('#') ? urlPathElement.split('#').shift() : urlPathElement;

    if (segmentsLength > 1) {
      if (dynamicSegmentsLength === 1) {
        console.warn(
          'Invalid node setup detected. \nStatic and dynamic nodes cannot be used together on the same level. Static node gets cleaned up. \nRemove the static node from the configuration to resolve this warning. \nAffected pathSegment:',
          urlPathElement,
          'Children:',
          nodes
        );
        nodes = nodes.filter(n => n.pathSegment && n.pathSegment.startsWith(':'));
      }
      if (dynamicSegmentsLength > 1) {
        console.error(
          'Invalid node setup detected. \nMultiple dynamic nodes are not allowed on the same level. Stopped navigation. \nInvalid Children:',
          nodes
        );
        return null;
      }
    }
    nodes.some(node => {
      if (
        // Static nodes
        node.pathSegment === urlPathElement ||
        // Dynamic nodes
        (node.pathSegment && node.pathSegment.startsWith(':'))
      ) {
        // Return last matching node
        result = node;
        return true;
      }
    });
    return result;
  }

  onNodeChange(prevNode, nextNode) {
    const invokedFunction = LuigiConfig.getConfigValue('navigation.nodeChangeHook');
    if (typeof invokedFunction === 'function') {
      invokedFunction(prevNode, nextNode);
    } else if (invokedFunction !== undefined) {
      console.warn('nodeChangeHook is not a function!');
    }
  }

  getNodesToDisplay(children, pathData) {
    if (children && children.length > 0) {
      return {
        children: children
      };
    }
    if (pathData.length > 1 && (pathData[0].topNav === false || pathData.length > 2)) {
      //try to get the children from parent node
      const parentNode = pathData[pathData.length - 2];
      if (NodeDataManagementStorage.hasChildren(parentNode)) {
        return {
          children: this.getChildrenFromCache(parentNode),
          parent: parentNode
        };
      }
    }

    return {
      children: []
    };
  }

  getGroupedChildren(children, current) {
    const nodes = this.getNodesToDisplay(children, current.pathData);
    if (Array.isArray(nodes)) {
      return NavigationHelpers.groupNodesBy(nodes, 'category', true);
    } else {
      return {
        children: NavigationHelpers.groupNodesBy(nodes.children, 'category', true),
        parent: nodes.parent
      };
    }
  }

  /**
   * getTruncatedChildren
   *
   * Returns an array of children without the childs below
   * last node that has keepSelectedForChildren or tabnav enabled
   * @param array children
   * @returns array children
   */
  getTruncatedChildren(children) {
    let childToKeepFound = false;
    let tabNavUnset = false;
    let res = [];

    children
      .slice()
      .reverse()
      .forEach(node => {
        if (!childToKeepFound || node.tabNav) {
          if (node.tabNav === false) {
            // explicitly set to false
            tabNavUnset = true;
          }
          if (node.keepSelectedForChildren === false) {
            // explicitly set to false
            childToKeepFound = true;
          } else if (
            node.keepSelectedForChildren ||
            (node.tabNav && !tabNavUnset && !RoutingHelpers.isDynamicNode(node))
          ) {
            childToKeepFound = true;
            res = [];
          }
        }
        res.push(node);
      });

    return res.reverse();
  }

  async getLeftNavData(current, componentData) {
    const updatedCompData = {};
    if (
      current.pathData &&
      current.pathData.length > 0 &&
      (current.pathData[0].topNav === false || current.pathData.length > 1)
    ) {
      const pathDataTruncatedChildren = this.getTruncatedChildren(componentData.pathData);
      let lastElement = [...pathDataTruncatedChildren].pop();
      let selectedNode;
      if (lastElement.keepSelectedForChildren || lastElement.tabNav) {
        selectedNode = lastElement;
        pathDataTruncatedChildren.pop();
        lastElement = [...pathDataTruncatedChildren].pop();
      }
      const children = await this.getChildren(lastElement, componentData.pathData?._context);
      const groupedChildrenData = this.getGroupedChildren(children, current);
      updatedCompData.navParent = groupedChildrenData.parent || lastElement;
      updatedCompData.context = current.pathData._context;
      updatedCompData.hasCategoriesWithIcon = false;
      const groupedChildren = groupedChildrenData.children;
      Object.values(groupedChildren).forEach(value => {
        if (!updatedCompData.hasCategoriesWithIcon && value && value.metaInfo && value.metaInfo.icon) {
          updatedCompData.hasCategoriesWithIcon = true;
        }
      });
      updatedCompData.selectedNode = selectedNode || lastElement;
      updatedCompData.children = groupedChildren;
      const isExpandCategoriesByNavigation = LuigiConfig.getConfigValue('settings.expandCategoryByNavigation');
      if (isExpandCategoriesByNavigation) {
        this.expandCategoriesByNavigationFn(
          updatedCompData.children,
          updatedCompData.selectedNode,
          NavigationHelpers.getSideNavAccordionMode(updatedCompData.selectedNode)
        );
      }
    }
    return updatedCompData;
  }

  /**
   * Checks if selectedNode has a category and if yes the categoryUid in metaInfo will be written to the browsers localstorage.
   * @param {*} sortedChildrenEntries - are sorted left nav node data
   * @param {*} selectedNode
   * @param {boolean} sideNavAccordionMode
   */
  expandCategoriesByNavigationFn(sortedChildrenEntries, selectedNode, sideNavAccordionMode) {
    if (sortedChildrenEntries) {
      for (const [key, categoryChildren] of Object.entries(sortedChildrenEntries)) {
        categoryChildren.forEach(node => {
          if (node === selectedNode && categoryChildren.metaInfo && categoryChildren.metaInfo.collapsible) {
            NavigationHelpers.storeExpandedState(categoryChildren.metaInfo.categoryUid, true, sideNavAccordionMode);
          }
        });
      }
    }
  }

  /**
   * Returns an array of the navigation path segments.
   * After tabNav is found on a node, the children of this node will added to the array.
   * @param {*} children
   */
  getTruncatedChildrenForTabNav(children) {
    const res = [];
    for (let i = children.length - 1; i >= 0; i--) {
      if (children[i].tabNav) {
        return children.slice(0, i + 2);
      }
    }
    return res;
  }

  async getTabNavData(current, componentData) {
    const updatedCompData = {};
    if (
      current.pathData &&
      current.pathData.length > 0 &&
      (current.pathData[0].topNav === false || current.pathData.length > 1)
    ) {
      const pathDataTruncatedChildren = this.getTruncatedChildrenForTabNav(componentData.pathData);
      const selectedNode = [...pathDataTruncatedChildren].pop();
      const children = await this.getChildren(
        selectedNode.tabNav ? selectedNode : NavigationHelpers.getParentNode(selectedNode, current.pathData),
        current.pathData?._context
      );
      const groupedChildren = this.getGroupedChildren(children, current).children;
      updatedCompData.selectedNode = selectedNode;
      updatedCompData.selectedNodeForTabNav = selectedNode;
      updatedCompData.children = groupedChildren;
    }
    return updatedCompData;
  }

  async extractDataFromPath(path) {
    const pathData = await this.getNavigationPath(LuigiConfig.getConfigValueAsync('navigation.nodes'), path);
    const nodeObject = RoutingHelpers.getLastNodeObject(pathData);
    return { nodeObject, pathData };
  }

  async shouldPreventNavigation(node) {
    if (
      node &&
      (GenericHelpers.isFunction(node.onNodeActivation) || GenericHelpers.isAsyncFunction(node.onNodeActivation)) &&
      (await node.onNodeActivation(node)) === false
    ) {
      return true;
    }
    return false;
  }
}

export const Navigation = new NavigationClass();
