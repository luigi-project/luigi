import type { Node } from "./navigation.service";

export class NodeDataManagementService {
  dataManagement: Map<any, any>;
  navPath!: string;

  constructor() {
    this.dataManagement = new Map();
  }

  /**
   * Stores node as key and value as value
   * @param {any} node
   * @param {any} value
   */
  setChildren(node: Node, value: any): void {
    this.dataManagement.set(node, value);
    this.navPath = '';
  }

  /**
   * Returns the map entry which belongs to the node, stored as key
   * @param {any} node
   * @returns {any} map entry
   */
  getChildren(node: Node): any {
    return node ? this.dataManagement.get(node) : {};
  }

  /**
   * Checks if there is an entry of given node
   * @param {any} node
   * @returns {boolean} true or false
   */
  hasChildren(node: Node): boolean {
    const data = this.getChildren(node);

    return !!(data && Object.prototype.hasOwnProperty.call(data, 'children'));
  }

  /**
   * Stores root node as object with key '_luigiRootNode'
   * @param {any} node
   */
  setRootNode(node: Node): void {
    this.dataManagement.set('_luigiRootNode', { node });
  }

  /**
   * Returns the root node
   * @returns {any} root node
   */
  getRootNode(): Node {
    return this.dataManagement.get('_luigiRootNode');
  }

  /**
   * Checks if root node exists
   * @returns {boolean} true or false
   */
  hasRootNode(): boolean {
    return !!this.getRootNode();
  }

  /*
    Clears the map and remove all key/values from map
  */
  deleteCache(): void {
    this.dataManagement.clear();
  }

  /**
   * Deletes node from cache and its children recursively
   * @param {any} node
   */
  deleteNodesRecursively(node: Node): void {
    if (this.hasChildren(node)) {
      const children = this.getChildren(node).children;

      for (let i = 0; i < children.length; i++) {
        this.deleteNodesRecursively(children[i]);
      }
    }

    this.dataManagement.delete(node);
  }
}
