import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { LuigiActivatedRouteSnapshotHelper } from './luigi-activated-route-snapshot-helper';

describe('NgLuigiActivatedRouteSnapshotService', () => {
  const mockedSnapshot: ActivatedRouteSnapshot = {data: {}} as ActivatedRouteSnapshot;
  let helper: LuigiActivatedRouteSnapshotHelper;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    helper = new LuigiActivatedRouteSnapshotHelper();
  });

  it('should be created', () => {
    expect(helper).toBeTruthy();
  });

  it('should get current snapshot when empty value is set', () => {
    LuigiActivatedRouteSnapshotHelper.setCurrent(null as unknown as ActivatedRouteSnapshot);
    expect(LuigiActivatedRouteSnapshotHelper.getCurrent()).toEqual(null as unknown as ActivatedRouteSnapshot);
  });

  it('should set current snapshot when no-empty value is set', () => {
    spyOn(LuigiActivatedRouteSnapshotHelper, 'setCurrent').and.callThrough();
    LuigiActivatedRouteSnapshotHelper.setCurrent(mockedSnapshot);
    expect(LuigiActivatedRouteSnapshotHelper.getCurrent()).toEqual(mockedSnapshot);
    expect(LuigiActivatedRouteSnapshotHelper.setCurrent).toHaveBeenCalled();
  });
});
