import { serviceRegistry } from '../../src/services/service-registry';

class DummyService {
  value: number;
  constructor() {
    this.value = Math.random();
  }
}

describe('ServiceRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    // @ts-ignore
    serviceRegistry['services'].clear();
  });

  it('should register and retrieve a singleton service', () => {
    serviceRegistry.register('dummy', () => new DummyService());
    const instance1 = serviceRegistry.get<DummyService>('dummy');
    const instance2 = serviceRegistry.get<DummyService>('dummy');
    expect(instance1).toBe(instance2);
    expect(instance1.value).toBe(instance2.value);
  });

  it('should register and retrieve a transient service', () => {
    serviceRegistry.register('transientDummy', () => new DummyService(), false);
    const instance1 = serviceRegistry.get<DummyService>('transientDummy');
    const instance2 = serviceRegistry.get<DummyService>('transientDummy');
    expect(instance1).not.toBe(instance2);
    expect(instance1.value).not.toBe(instance2.value);
  });

  it('should throw an error when getting an unregistered service', () => {
    expect(() => serviceRegistry.get('unknown')).toThrow("Service 'unknown' is not registered.");
  });

  it('should allow multiple different services to be registered and retrieved', () => {
    class ServiceA {
      a = 1;
    }
    class ServiceB {
      b = 2;
    }
    serviceRegistry.register('A', () => new ServiceA());
    serviceRegistry.register('B', () => new ServiceB());
    const a = serviceRegistry.get<ServiceA>('A');
    const b = serviceRegistry.get<ServiceB>('B');
    expect(a).toBeInstanceOf(ServiceA);
    expect(b).toBeInstanceOf(ServiceB);
    expect(a.a).toBe(1);
    expect(b.b).toBe(2);
  });

  it('should call the factory only once for singleton services', () => {
    const factory = jest.fn(() => new DummyService());
    serviceRegistry.register('singleton', factory);
    serviceRegistry.get<DummyService>('singleton');
    serviceRegistry.get<DummyService>('singleton');
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should call the factory every time for transient services', () => {
    const factory = jest.fn(() => new DummyService());
    serviceRegistry.register('transient', factory, false);
    serviceRegistry.get<DummyService>('transient');
    serviceRegistry.get<DummyService>('transient');
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
