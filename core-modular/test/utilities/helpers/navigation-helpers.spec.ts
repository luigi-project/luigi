import { NavigationHelpers } from '../../../src/utilities/helpers/navigation-helpers';
import chai from 'chai';
const assert = chai.assert;

describe('Navigation-helpers', () => {
  it('should normalize path', () => {
    const rawPath = '#/some/path';
    const normalizedPath = NavigationHelpers.normalizePath(rawPath);
    assert.equal(normalizedPath, 'some/path');
  });

  it('should match segments correctly', () => {
    const linkSegment = 'test';
    const pathSegment = ':id';
    const pathParams = { id: 'test' };
    const matches = NavigationHelpers.segmentMatches(linkSegment, pathSegment, pathParams);
    assert.isTrue(matches);
  });

  it('should check route match w/o pathParams', () => {
    const route = '/some/test/path';
    const nodesInPath = [{}, { pathSegment: 'some' }, { pathSegment: 'test' }, { pathSegment: 'path' }];

    const result = NavigationHelpers.checkMatch(route, nodesInPath);
    expect(result).toBe(true);
  });

  it('should update header title based on app switcher data', () => {
    const appSwitcherData = {
      items: [
        { link: '/some/test/path', title: 'Test App' },
        { link: '/another/app', title: 'Another App' }
      ]
    };
    const pathData = {
      nodesInPath: [
        { pathSegment: 'some', children: [] },
        { pathSegment: 'test', children: [] },
        { pathSegment: 'path', children: [] }
      ],
      rootNodes: []
    };

    const result = NavigationHelpers.updateHeaderTitle(appSwitcherData, pathData);
    expect(result).toEqual('');
  });
});
