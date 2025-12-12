// Methods related to view group preloading.
import { Iframe } from './iframe';
import { LuigiConfig } from '../core-api';
import { IframeHelpers, NavigationHelpers } from '../utilities/helpers';

class ViewGroupPreloadingClass {
  constructor() {
    this.preloadBatchSize = 1;
    this.shouldPreload = false;
  }

  preloadViewGroups(batchSize = 3, backgroundMfeOnly) {
    const preloadViewGroupsSetting = LuigiConfig.getConfigValue('navigation.preloadViewGroups');
    if (preloadViewGroupsSetting === false) {
      return;
    }
    const vgSettings = NavigationHelpers.getAllViewGroupSettings();
    if (!vgSettings) {
      return;
    }
    const iframeContainer = IframeHelpers.getIframeContainer();
    const iframes = IframeHelpers.getMainIframes();
    const now = new Date().getTime();
    const preloadingIframes = iframes.filter(
      (iframe) => iframe.luigi && iframe.luigi.preloading && now - iframe.luigi.createdAt < 30000
    );
    if (preloadingIframes.length > 0) {
      console.debug('skipping view group preloading (busy)');
      return;
    }
    const existingVGs = iframes.map((iframe) => iframe.vg).filter(Boolean);

    const settingsWithPreload = Object.entries(vgSettings)
      .filter(([name, _]) => !existingVGs.includes(name))
      .filter(([_, settings]) => settings && settings.preloadUrl);

    backgroundMfeOnly &&
      settingsWithPreload.forEach(([name, settings]) => {
        if (settings.loadOnStartup) {
          this.preloadIframeOnBackground(settings, name, iframeContainer);
        }
      });

    !backgroundMfeOnly &&
      settingsWithPreload
        .filter((_, index) => index < batchSize)
        .forEach(([name, settings]) => {
          console.debug('preloading view group ' + name + ' - ' + settings.preloadUrl);
          this.preloadIframeOnBackground(settings, name, iframeContainer);
        });
  }

  /**
   * Loads an iframe on the background by keeping the display to none.
   * @param {*} settings - the viewgroup settings
   * @param {*} name - the property name of the viewgroup
   * @param {*} iframeContainer - the container to attach the iframe to
   */
  preloadIframeOnBackground(settings, name, iframeContainer) {
    const iframe = IframeHelpers.createIframe(settings.preloadUrl, name, null, 'main');
    iframe.style.display = 'none';
    iframe.luigi.preloading = true;
    iframeContainer.appendChild(iframe);
  }

  preload(backgroundMfeOnly) {
    if (this.shouldPreload) {
      setTimeout(() => {
        this.preloadViewGroups(this.preloadBatchSize, backgroundMfeOnly);
      }, backgroundMfeOnly);
    }
    this.shouldPreload = true;
  }

  viewGroupLoaded(iframe) {
    if (iframe.luigi.preloading) {
      // adapt batch size
      const preloadTime = new Date().getTime() - iframe.luigi.createdAt;
      let batchSize = 1;
      if (preloadTime < 500) {
        batchSize = 3;
      } else if (preloadTime < 1000) {
        batchSize = 2;
      }
      this.preloadBatchSize = batchSize;
      console.debug('preload batch size: ' + this.preloadBatchSize);

      // set iframe free after a delay
      setTimeout(
        () => {
          iframe.luigi.preloading = false;
        },
        this.preloadBatchSize > 2 ? 500 : 1000
      );
    }
  }
}

export const ViewGroupPreloading = new ViewGroupPreloadingClass();
