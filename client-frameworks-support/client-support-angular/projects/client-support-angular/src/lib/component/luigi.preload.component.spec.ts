jest.mock('@angular/core', () => ({
  Component: () => (target: any) => target
}));

import { LuigiPreloadComponent } from './luigi.preload.component';

describe('ClientSupportAngularComponent', () => {
  it('should create', () => {
    const component = new LuigiPreloadComponent();
    expect(component).toBeTruthy();
  });
});
