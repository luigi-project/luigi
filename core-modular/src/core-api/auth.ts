import type { Luigi } from './luigi';

export class Auth {
  luigi: Luigi;

  constructor(luigi: Luigi) {
    this.luigi = luigi;
  }

  /**
   * Detects if authorization is enabled via configuration
   * @returns {boolean} `true` if authorization is enabled - otherwise returns `false`
   */
  isAuthorizationEnabled(): boolean {
    return !!this.luigi.getConfigValue('auth.use');
  }
}
