type ServiceFactory<T> = (...args: any[]) => T;
type ServiceId<T> = string & { __type?: T };

interface ServiceEntry<T> {
  factory: ServiceFactory<T>;
  singleton: boolean;
  instance?: T;
}

/**
 * Manages the registration and retrieval of services within the application.
 *
 * The `ServiceRegistry` allows services to be registered with a unique identifier and a factory function.
 * Services can be registered as singletons (default) or as transient instances.
 *
 * - Use `register` to add a service to the registry.
 * - Use `get` to retrieve an instance of a registered service.
 *
 * @example
 * ```typescript
 * registry.register('myService', () => new MyService(), true);
 * const service = registry.get<T>('myService');
 * ```
 */
class ServiceRegistry {
  private services = new Map<any, ServiceEntry<any>>();

  /**
   * Registers a service with the service registry.
   *
   * @template T - The type of the service.
   * @param name - The unique identifier for the service.
   * @param factory - A factory function that creates an instance of the service.
   * @param singleton - If true, the service will be treated as a singleton. Defaults to true.
   */
  register<T>(param: typeof T, factory: ServiceFactory<T>, singleton = true): void {
    this.services.set(param, { factory, singleton });
  }

  /**
   * Retrieves an instance of the requested service by its identifier.
   *
   * If the service is registered as a singleton, returns the existing instance or creates one if it doesn't exist.
   * If the service is not a singleton, returns a new instance each time.
   *
   * @typeParam T - The type of the service to retrieve.
   * @param name - The identifier of the service to retrieve.
   * @returns The instance of the requested service.
   * @throws {Error} If the service is not registered.
   */
  get<T>(param: typeof T): T {
    const entry = this.services.get(param);

    if (!entry) {
      throw new Error(`Service '${param}' is not registered.`);
    }

    if (entry.singleton) {
      if (!entry.instance) {
        entry.instance = entry.factory();
      }
      return entry.instance;
    }
    return entry.factory();
  }
}

export const serviceRegistry = new ServiceRegistry();
