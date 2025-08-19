import { serviceRegistry } from '../../src/services/service-registry';

class DummyService {
  value: number;
  constructor() {
    this.value = Math.random();
  }
}

class LuigiService {
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
    serviceRegistry.register(DummyService, () => new DummyService());
    const instance1 = serviceRegistry.get<DummyService>(DummyService);
    const instance2 = serviceRegistry.get<DummyService>(DummyService);
    expect(instance1).toBe(instance2);
    expect(instance1.value).toBe(instance2.value);
  });

  it('should register and retrieve a transient service', () => {
    serviceRegistry.register(LuigiService, () => new DummyService(), false);
    const instance1 = serviceRegistry.get<DummyService>(LuigiService);
    const instance2 = serviceRegistry.get<DummyService>(LuigiService);
    expect(instance1).not.toBe(instance2);
    expect(instance1.value).not.toBe(instance2.value);
  });

  it('should throw an error when getting an unregistered service', () => {
    expect(() => serviceRegistry.get(DummyService)).toThrow('');
  });

  it('should allow multiple different services to be registered and retrieved', () => {
    class ServiceA {
      a = 1;
    }
    class ServiceB {
      b = 2;
    }
    serviceRegistry.register(ServiceA, () => new ServiceA());
    serviceRegistry.register(ServiceB, () => new ServiceB());
    const a = serviceRegistry.get<ServiceA>(ServiceA);
    const b = serviceRegistry.get<ServiceB>(ServiceB);
    expect(a).toBeInstanceOf(ServiceA);
    expect(b).toBeInstanceOf(ServiceB);
    expect(a.a).toBe(1);
    expect(b.b).toBe(2);
  });

  it('should call the factory only once for singleton services', () => {
    const factory = jest.fn(() => new DummyService());
    serviceRegistry.register(DummyService, factory);
    serviceRegistry.get<DummyService>(DummyService);
    serviceRegistry.get<DummyService>(DummyService);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('should call the factory every time for transient services', () => {
    const factory = jest.fn(() => new DummyService());
    serviceRegistry.register(LuigiService, factory, false);
    serviceRegistry.get<DummyService>(LuigiService);
    serviceRegistry.get<DummyService>(LuigiService);
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
