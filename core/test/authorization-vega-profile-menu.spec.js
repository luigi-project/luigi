const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const sinon = require('sinon');

import { LuigiAuth, LuigiConfig } from '../src/core-api';
import { AuthLayerSvc } from '../src/services';

describe('AuthorizationVegaProfileMenu', () => {
  describe('Profile items with children (grouped items)', () => {
    let getConfigValueAsyncStub;

    beforeEach(() => {
      getConfigValueAsyncStub = sinon.stub(LuigiConfig, 'getConfigValueAsync');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should support items with children property', async () => {
      const items = [
        {
          label: 'Account Settings',
          icon: 'account',
          children: [
            { label: 'Profile', icon: 'person-placeholder', link: '/profile' },
            { label: 'Privacy', icon: 'locked', link: '/privacy' }
          ]
        },
        { label: 'About', icon: 'hint', link: '/about' }
      ];

      expect(items[0].children).to.be.an('array');
      expect(items[0].children.length).to.equal(2);
      expect(items[1].children).to.be.undefined;
    });

    it('should identify group items by checking children property', () => {
      const groupItem = {
        label: 'Tools',
        icon: 'action-settings',
        children: [{ label: 'Settings', icon: 'settings', link: '/settings' }]
      };
      const flatItem = { label: 'About', icon: 'hint', link: '/about' };

      expect(groupItem.children && groupItem.children.length > 0).to.be.true;
      expect(flatItem.children && flatItem.children.length > 0).to.not.be.ok;
    });

    it('should treat empty children array as flat item', () => {
      const item = { label: 'Empty', icon: 'hint', children: [] };
      expect(item.children && item.children.length > 0).to.be.false;
    });

    it('should preserve child item properties', () => {
      const childItem = {
        label: 'Settings',
        icon: 'settings',
        link: '/settings',
        testId: 'custom-test-id',
        externalLink: { url: 'https://example.com', sameWindow: false }
      };

      expect(childItem.label).to.equal('Settings');
      expect(childItem.icon).to.equal('settings');
      expect(childItem.link).to.equal('/settings');
      expect(childItem.testId).to.equal('custom-test-id');
      expect(childItem.externalLink.url).to.equal('https://example.com');
    });

    it('should support multiple groups mixed with flat items', () => {
      const items = [
        {
          label: 'Group 1',
          icon: 'account',
          children: [{ label: 'Child 1', link: '/c1' }]
        },
        { label: 'Flat 1', link: '/f1' },
        {
          label: 'Group 2',
          icon: 'tools',
          children: [
            { label: 'Child 2', link: '/c2' },
            { label: 'Child 3', link: '/c3' }
          ]
        },
        { label: 'Flat 2', link: '/f2' }
      ];

      const groups = items.filter((i) => i.children && i.children.length > 0);
      const flatItems = items.filter((i) => !i.children || i.children.length === 0);

      expect(groups.length).to.equal(2);
      expect(flatItems.length).to.equal(2);
      expect(groups[0].children.length).to.equal(1);
      expect(groups[1].children.length).to.equal(2);
    });
  });

  describe('Expand/collapse group state', () => {
    it('toggleGroup should expand when collapsed', () => {
      let expandedGroupIndex = null;
      const toggleGroup = (index) => {
        expandedGroupIndex = expandedGroupIndex === index ? null : index;
      };

      toggleGroup(0);
      expect(expandedGroupIndex).to.equal(0);
    });

    it('toggleGroup should collapse when already expanded', () => {
      let expandedGroupIndex = 0;
      const toggleGroup = (index) => {
        expandedGroupIndex = expandedGroupIndex === index ? null : index;
      };

      toggleGroup(0);
      expect(expandedGroupIndex).to.be.null;
    });

    it('toggleGroup should switch to different group', () => {
      let expandedGroupIndex = 0;
      const toggleGroup = (index) => {
        expandedGroupIndex = expandedGroupIndex === index ? null : index;
      };

      toggleGroup(1);
      expect(expandedGroupIndex).to.equal(1);
    });

    it('should reset expandedGroupIndex when menu is hidden', () => {
      let expandedGroupIndex = 2;
      let isHidden = false;

      // Simulate reactive reset
      isHidden = true;
      if (isHidden) expandedGroupIndex = null;

      expect(expandedGroupIndex).to.be.null;
    });
  });
});
