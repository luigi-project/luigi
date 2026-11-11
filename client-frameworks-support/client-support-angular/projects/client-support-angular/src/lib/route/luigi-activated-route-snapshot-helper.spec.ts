import { LuigiActivatedRouteSnapshotHelper } from './luigi-activated-route-snapshot-helper';

describe('NgLuigiActivatedRouteSnapshotService', () => {
  it('should be created', () => {
    const helper = new LuigiActivatedRouteSnapshotHelper();
    expect(helper).toBeTruthy();
  });

  it('should get current snapshot when empty value is set', () => {
    LuigiActivatedRouteSnapshotHelper.setCurrent(null as any);
    expect(LuigiActivatedRouteSnapshotHelper.getCurrent()).toEqual(null);
  });

  it('should set current snapshot when no-empty value is set', () => {
    const mockedSnapshot = { data: {} } as any;
    const spy = jest.spyOn(LuigiActivatedRouteSnapshotHelper, 'setCurrent');
    LuigiActivatedRouteSnapshotHelper.setCurrent(mockedSnapshot);
    expect(LuigiActivatedRouteSnapshotHelper.getCurrent()).toEqual(mockedSnapshot);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
