import type { Luigi } from '../core-api/luigi';
import type { ViewGroupSettings } from '../types/navigation';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

/**
 * Service responsible for preloading view group containers in the background.
 *
 * Preloading creates hidden luigi-container elements for configured view groups
 * so that navigating to those groups later is near-instant (the MFE is already initialized).
 * The service adapts its batch size dynamically based on observed MFE load times.
 */
export class PreloadingService {
  private preloadBatchSize: number = 1;
  shouldPreload: boolean = false;

  constructor(private luigi: Luigi) {}

  /**
   * Preloads view group containers based on the `navigation.viewGroupSettings` configuration.
   * Skips view groups that already have a container in the DOM or are currently being preloaded.
   *
   * @param batchSize - Maximum number of view groups to preload in this cycle (default: 3).
   * @param backgroundMfeOnly - If true, only preloads view groups with `loadOnStartup: true`.
   *   Used during application init to load critical MFEs without competing with the main navigation.
   */
  preloadViewGroups(batchSize: number = 3, backgroundMfeOnly?: boolean): void {
    const preloadViewGroupsSetting = this.luigi.getConfigValue('navigation.preloadViewGroups');
    if (preloadViewGroupsSetting === false) {
      return;
    }

    const vgSettings: Record<string, ViewGroupSettings> | undefined =
      this.luigi.getConfigValue('navigation.viewGroupSettings');
    if (!vgSettings) {
      return;
    }

    const containerWrapper = this.luigi.getEngine()._connector?.getContainerWrapper();
    if (!containerWrapper) {
      return;
    }

    const now = Date.now();

    const preloadingContainers = this.getPreloadingContainers(containerWrapper).filter(
      (el: any) => now - (el._luigiPreloadCreatedAt || 0) < 30000
    );
    if (preloadingContainers.length > 0) {
      return;
    }

    const existingVGs = [...containerWrapper.childNodes]
      .filter((el: any) => el.tagName?.startsWith('LUIGI-') && el.viewGroup)
      .map((el: any) => el.viewGroup);

    const settingsWithPreload = Object.entries(vgSettings)
      .filter(([name]) => !existingVGs.includes(name))
      .filter(([_, settings]) => settings && settings.preloadUrl);

    if (backgroundMfeOnly) {
      settingsWithPreload.forEach(([name, settings]) => {
        if (settings.loadOnStartup) {
          this.preloadContainerOnBackground(settings, name, containerWrapper);
        }
      });
    } else {
      settingsWithPreload
        .filter((_, index) => index < batchSize)
        .forEach(([name, settings]) => {
          this.preloadContainerOnBackground(settings, name, containerWrapper);
        });
    }
  }

  /**
   * Creates a hidden luigi-container for the given view group and appends it to the DOM.
   * The container loads the `preloadUrl` MFE in the background with `display: none`.
   *
   * @param settings - The view group settings containing the preloadUrl.
   * @param name - The view group name (used as identifier on the container).
   * @param containerWrapper - The DOM element to append the hidden container to.
   */
  preloadContainerOnBackground(settings: ViewGroupSettings, name: string, containerWrapper: HTMLElement): void {
    const lc = document.createElement('luigi-container') as any;
    lc.setAttribute('lui_container', 'true');
    lc.viewurl = settings.preloadUrl;
    lc.viewGroup = name;
    lc.style.display = 'none';
    lc._luigiPreloading = true;
    lc._luigiPreloadCreatedAt = Date.now();
    lc.luigiMfId = GenericHelpers.getRandomId();
    this.luigi.getEngine()._comm.addListeners(lc, this.luigi);
    containerWrapper.appendChild(lc);
  }

  /**
   * Schedules a preload cycle. Uses a flag-based mechanism to skip the very first invocation
   * and only trigger preloading from the second call onwards.
   *
   * @param backgroundMfeOnly - If true, only `loadOnStartup` view groups are preloaded.
   *   Passed through to `preloadViewGroups`.
   */
  preload(backgroundMfeOnly?: boolean): void {
    if (this.shouldPreload) {
      setTimeout(
        () => {
          this.preloadViewGroups(this.preloadBatchSize, !!backgroundMfeOnly);
        },
        backgroundMfeOnly ? 1 : 0
      );
    }
    this.shouldPreload = true;
  }

  /**
   * Called when a preloaded container has finished initializing (INITIALIZED event).
   * Measures load time and adapts the batch size for subsequent preload cycles:
   * - < 500ms  → batchSize 3 (fast connection)
   * - 500–1000ms → batchSize 2
   * - > 1000ms → batchSize 1 (slow, be conservative)
   *
   * Also schedules clearing the `_luigiPreloading` flag after a short delay,
   * freeing the container for the next preload cycle.
   *
   * @param container - The container element that finished loading.
   */
  viewGroupLoaded(container: any): void {
    if (container._luigiPreloading) {
      const preloadTime = Date.now() - (container._luigiPreloadCreatedAt || 0);
      let batchSize = 1;
      if (preloadTime < 500) {
        batchSize = 3;
      } else if (preloadTime < 1000) {
        batchSize = 2;
      }
      this.preloadBatchSize = batchSize;

      setTimeout(
        () => {
          container._luigiPreloading = false;
        },
        this.preloadBatchSize > 2 ? 500 : 1000
      );
    }
  }

  /**
   * Returns all containers in the wrapper that are currently in a preloading state.
   */
  private getPreloadingContainers(containerWrapper: HTMLElement): HTMLElement[] {
    return [...containerWrapper.childNodes].filter(
      (el: any) => el.tagName?.startsWith('LUIGI-') && el._luigiPreloading
    ) as HTMLElement[];
  }
}
