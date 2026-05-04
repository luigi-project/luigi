import type { Luigi } from '../core-api/luigi';
import type { ViewGroupSettings } from '../types/navigation';
import { GenericHelpers } from '../utilities/helpers/generic-helpers';

export class PreloadingService {
  private preloadBatchSize: number = 1;
  shouldPreload: boolean = false;

  constructor(private luigi: Luigi) {}

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

  private getPreloadingContainers(containerWrapper: HTMLElement): HTMLElement[] {
    return [...containerWrapper.childNodes].filter(
      (el: any) => el.tagName?.startsWith('LUIGI-') && el._luigiPreloading
    ) as HTMLElement[];
  }
}
