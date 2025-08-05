import { DirtyStatusHelpers } from '../../../src/utilities/helpers/dirty-status-helpers';

const chai = require('chai');
const assert = chai.assert;

describe('DirtyStatus-helpers', () => {
  describe('readDirtyStatus', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('returns false when no status is set', () => {
      assert.isFalse(DirtyStatusHelpers.readDirtyStatus());
    });

    it('returns false when status is set to false', () => {
      DirtyStatusHelpers.updateDirtyStatus(false, 'some-source');
      assert.isFalse(DirtyStatusHelpers.readDirtyStatus());
    });

    it('returns true when status is set to true', () => {
      DirtyStatusHelpers.updateDirtyStatus(true, 'some-source');
      assert.isTrue(DirtyStatusHelpers.readDirtyStatus());
    });
  });

  describe('updateDirtyStatus', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('stores correct data when status is set to false', () => {
      DirtyStatusHelpers.clearDirtyState();
      DirtyStatusHelpers.updateDirtyStatus(false, 'some-source');
      assert.equal(window.localStorage.getItem('luigi.dirtyStore'), '{"dirtySet":[],"persistUrl":"http://localhost/"}');
    });

    it('stores correct data when status is set to true', () => {
      DirtyStatusHelpers.clearDirtyState();
      DirtyStatusHelpers.updateDirtyStatus(true, 'some-source');
      assert.equal(window.localStorage.getItem('luigi.dirtyStore'), '{"dirtySet":["some-source"],"persistUrl":"http://localhost/"}');
    });
  });
});
