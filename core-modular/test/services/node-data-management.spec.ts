import { NodeDataManagementService } from '../../src/services/node-data-management.service';

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

describe('NodeDataManagementService', function() {
  const getNodeMock = () => ({
    pathSegment: 'myNode',
    children: [
      {
        pathSegment: 'children1'
      },
      {
        pathSegment: 'children2'
      }
    ]
  });
  let nodeDataManagementService: NodeDataManagementService;

  beforeEach(() => {
    nodeDataManagementService = new NodeDataManagementService();
  });

  afterEach(() => {
    // reset
    nodeDataManagementService.deleteCache();
  });

  it('constructor values', () => {
    assert.exists(nodeDataManagementService.dataManagement);
  });

  describe('setChildren', function() {
    it('fill the cache with an node as key and an object as value using setChildren', () => {
      nodeDataManagementService.setChildren(getNodeMock(), {
        children: getNodeMock().children
      });
      expect(nodeDataManagementService.dataManagement.size).to.equal(1);
    });

    it('extend node in cache with another children', () => {
      nodeDataManagementService.setChildren(getNodeMock(), {
        children: getNodeMock().children
      });
      expect(nodeDataManagementService.dataManagement.size).to.equal(1);
      let nodeMock = getNodeMock();
      nodeMock.children.push({ pathSegment: 'children3' });
      nodeDataManagementService.setChildren(nodeMock, {
        children: nodeMock.children
      });
      expect(nodeDataManagementService.dataManagement.size).to.equal(2);
    });
  });

  describe('getChildren', function() {
    afterEach(() => {
      nodeDataManagementService.deleteCache();
    });

    it('get children from cache', () => {
      const nodeMock = getNodeMock();
      expect(nodeDataManagementService.getChildren(nodeMock)).to.be.undefined;
      nodeDataManagementService.setChildren(nodeMock, {
        children: nodeMock.children
      });
      const children = nodeDataManagementService.getChildren(nodeMock).children;
      expect(children.length).to.equal(2);
      expect(children[0]).to.deep.equal({
        pathSegment: 'children1'
      });
    });
  });

  describe('hasChildren', () => {
    afterEach(() => {
      nodeDataManagementService.deleteCache();
    });

    it('check if children for node is stored in cache', () => {
      const nodeMock = getNodeMock();
      expect(nodeDataManagementService.hasChildren(nodeMock)).to.be.false;
      nodeDataManagementService.setChildren(nodeMock, {
        children: nodeMock.children
      });
      expect(nodeDataManagementService.hasChildren(nodeMock)).to.be.true;
    });
  });

  describe('set, get and has rootNode', () => {
    let rootNode = {
      children: [{ pathSegment: 'Overview' }, { pathSegment: 'projects', children: [{ pathSegment: 'pr1' }] }]
    };

    afterEach(() => {
      nodeDataManagementService.deleteCache();
    });

    it('store rootNode in cache', () => {
      expect(nodeDataManagementService.dataManagement.size).to.equal(0);
      nodeDataManagementService.setRootNode(rootNode);
      expect(nodeDataManagementService.dataManagement.size).to.equal(1);
      let rootNodeFromCache = nodeDataManagementService.dataManagement.get('_luigiRootNode').node;
      expect(rootNodeFromCache).to.deep.equal(rootNode);
    });

    it('get stored rootNode from cache using getRootNode', () => {
      expect(nodeDataManagementService.getRootNode()).to.be.undefined;
      nodeDataManagementService.setRootNode(rootNode);
      const rootNodeFromCache = nodeDataManagementService.getRootNode().node;
      expect(rootNodeFromCache).to.deep.equal(rootNode);
    });

    it('check if rootNode is set', () => {
      expect(nodeDataManagementService.hasRootNode()).to.be.false;
      nodeDataManagementService.setRootNode(rootNode);
      expect(nodeDataManagementService.hasRootNode()).to.be.true;
      nodeDataManagementService.deleteCache();
      expect(nodeDataManagementService.hasRootNode()).to.be.false;
    });
  });

  describe('delete Cache', () => {
    it('remove all entries from map', () => {
      expect(nodeDataManagementService.dataManagement.size).to.equal(0);
      const nodeMock = getNodeMock();
      nodeDataManagementService.setChildren(nodeMock, {
        children: nodeMock.children
      });
      expect(nodeDataManagementService.dataManagement.size).to.equal(1);
      nodeDataManagementService.deleteCache();
      expect(nodeDataManagementService.dataManagement.size).to.equal(0);
    });

    it('remove node and its children recursivly', () => {
      expect(nodeDataManagementService.dataManagement.size).to.equal(0);
      let children1 = { pathSegment: 'child1' };
      let children4 = { pathSegment: 'child4' };
      let children3 = { pathSegment: 'child3', children: [children4] };
      let children2 = { pathSegment: 'child2', children: [children3] };
      let rootNode = {
        children: [children1, children2]
      };
      nodeDataManagementService.setChildren(rootNode, {
        children: rootNode.children
      });
      nodeDataManagementService.setChildren(children1, {
        children: children1.children
      });
      nodeDataManagementService.setChildren(children2, {
        children: children2.children
      });
      nodeDataManagementService.setChildren(children3, {
        children: children3.children
      });
      expect(nodeDataManagementService.dataManagement.size).to.equal(4);
      nodeDataManagementService.deleteNodesRecursively(children2);
      expect(nodeDataManagementService.dataManagement.size).to.equal(2);
    });
  });
});
