import type { Luigi } from '../core-api/luigi';
import { GenericHelpers } from './helpers/generic-helpers';

export const LifecycleHooks = {
  luigiAfterInit: (luigi: Luigi): void => {
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
  }
};
