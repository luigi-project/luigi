/* istanbul ignore file */
import { EventListenerHelpers } from './helpers';
let status = 'not_checked';

EventListenerHelpers.addEventListener(
  'message',
  function(e) {
    if (e.origin !== window.location.origin) {
      return;
    }
    if (e.data === 'luigi.tpcDisabled') {
      console.warn('Third party cookies are not supported! Silent token renewal might not work!');
      status = 'disabled';
    } else if (e.data === 'luigi.tpcEnabled') {
      status = 'enabled';
    }
  },
  false
);

export function thirdPartyCookiesStatus() {
  return status;
}
