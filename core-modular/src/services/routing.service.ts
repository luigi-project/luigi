import type { Luigi } from '../core-api/luigi';

export class RoutingService {
  constructor(private luigi: Luigi) {}

  /**
   * If the current route matches any of the defined patterns, it will be skipped.
   * @returns {boolean} true if the current route matches any of the patterns, false otherwise
   */
  shouldSkipRoutingForUrlPatterns(): boolean {
    const defaultPattern: RegExp[] = [/access_token=/, /id_token=/];
    const patterns: any[] = this.luigi.getConfigValue('routing.skipRoutingForUrlPatterns') || defaultPattern;

    return patterns.filter((pattern) => location.href.match(pattern)).length !== 0;
  }
}
