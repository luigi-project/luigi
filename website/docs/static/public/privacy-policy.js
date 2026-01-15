(function () {
  setTimeout(function () {
    try {
      let cr = document.createElement('div');
      cr.appendChild(document.createTextNode('Copyright © The Linux Foundation Europe.'));
      document.querySelector('.lui-side-nav__footer--text').appendChild(cr);
      let pol = document.createElement('div');
      pol.appendChild(document.createTextNode('For web site terms of use, trademark policy and other project policies please see https://linuxfoundation.eu/en/policies.'));
      document.querySelector('.lui-side-nav__footer--text').appendChild(pol);
    } catch (e) {
      console.error('Something went wrong!', e);
    }
  }, 1000);
})();
