import type { Luigi } from './luigi';

/**
 * Authorization helpers
 */
export class Auth {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Detects if authorization is enabled via configuration.
   * Read more about [custom authorization providers](authorization-configuration.md).
   * @returns {boolean} - `true` if authorization is enabled. Otherwise returns `false`.
   * @example Luigi.auth().isAuthorizationEnabled();
   */
  isAuthorizationEnabled(): boolean {
    return !!this.luigi.getConfigValue('auth.use');
  }
}
