/* istanbul ignore file */
let status = 'not_checked';

window.addEventListener(
  'message',
  function (e) {
    // Validate origin - should be parent frame origin or same origin
    // For third-party cookie check, accept if origin is set and not 'null'
    const expectedOrigin = window.location.ancestorOrigins?.[0] || document.referrer || window.location.origin;
    if (e.origin && e.origin !== 'null' && e.origin !== expectedOrigin && e.origin !== window.location.origin) {
      console.warn('[Luigi Auth] Rejected third-party cookie check message from untrusted origin:', e.origin);
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
