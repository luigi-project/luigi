import { LuigiContextServiceImpl } from './luigi-context.service.impl';

jest.mock('@luigi-project/client', () => ({
  addInitListener: jest.fn(),
  addContextUpdateListener: jest.fn()
}));

jest.mock('@angular/core', () => ({
  Injectable: () => (target: any) => target,
  inject: jest.fn().mockReturnValue({ run: (fn: Function) => fn() }),
  signal: (val: any) => ({
    set: jest.fn(),
    asReadonly: () => val
  }),
  WritableSignal: {},
  Signal: {},
  NgZone: class {}
}));

describe('LuigiContextService', () => {
  it('should be created', () => {
    const service = new LuigiContextServiceImpl();
    expect(service).toBeTruthy();
  });
});
