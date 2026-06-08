jest.mock('@angular/core', () => ({
  Component: () => (target: any) => target,
  ChangeDetectionStrategy: () => ({
    'OnPush': 0,
    'Eager': 1,
    'Default': 1
  })
}));

import { LuigiPreloadComponent } from './luigi.preload.component';

describe('ClientSupportAngularComponent', () => {
  it('should create', () => {
    const component = new LuigiPreloadComponent();
    expect(component).toBeTruthy();
  });
});
