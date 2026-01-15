import type { Luigi } from '../core-api/luigi';
import { ConfigHelpers } from './helpers/config-helpers';
import { GenericHelpers } from './helpers/generic-helpers';

export const LifecycleHooks = {
  luigiAfterInit: async (luigi: Luigi): Promise<void> => {
    const shouldHideAppLoadingIndicator: boolean = GenericHelpers.getConfigBooleanValue(
      luigi.getConfig(),
      'settings.appLoadingIndicator.hideAutomatically'
    );

    if (shouldHideAppLoadingIndicator) {
      // Timeout needed, otherwise loading indicator might not be present yet and when displayed will not be hidden
      setTimeout(() => {
        luigi.ux().hideAppLoadingIndicator();
      }, 0);
    }

    await ConfigHelpers.executeConfigFnAsync('lifecycleHooks.luigiAfterInit');
  }
};
