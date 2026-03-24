export class InternalLinksHandler {
  init(LuigiClient) {
    if (!window) {
      return;
    }
    LuigiClient.addInitListener(ctx => {
      if (this.initDone) {
        return;
      }
      this.initDone = true;

      // modify internal links to be valid links for users and still make sapper happy
      // since leaving them "wrong" (as local iframe links) in the first place
      let intvCount = 0;
      const intv = setInterval(() => {
        const links = document.querySelectorAll('a[data-linktype]');
        intvCount++;
        if (links.length) {
          this.prepareLinks(ctx, links);
        }
        if (links.length || intvCount >= 20) {
          clearInterval(intv);
        }
      }, 150);

      // register click handler
      window.navigateInternal = (evt, elem) => {
        evt.preventDefault();
        evt.stopPropagation();
        let url;
        try {
          url = new URL(elem.getAttribute('href'), window.location.origin);
        } catch (error) {
          console.debug('navigateInternal URL parse error', elem, elem.getAttribute('href'), error);
        }
        const urlWithPath = url.pathname
          .replace(ctx.coreBaseUrl, '')
          .replace('.md', '')
          .replace('/docu-microfrontend', '');

        // Links can be either with a ?section param or with hash, both should work.
        const sectionParam = this.getUrlParameter('section', url.search);
        const hashParam = url.hash ? url.hash.substring(1).toLowerCase() : false;
        if (sectionParam || hashParam) {
          LuigiClient.linkManager()
            .withParams({ section: sectionParam || hashParam })
            .navigate(urlWithPath);
        } else {
          LuigiClient.linkManager().navigate(urlWithPath);
        }
      };
    });
  }

  prepareLinks(ctx, links) {
    links.forEach(link => {
      if (link.getAttribute('data-linktype') === 'internal') {
        const url = new URL(link.href);
        let newHref =
          ctx.coreBaseUrl +
          url.pathname.replace('.md', '').replace('/docu-microfrontend', '') +
          url.hash.toLowerCase().replace('#', '?section=');
        link.setAttribute('href', newHref);
      }
    });
  }

  /**
   * Returns the value of a given url parameter name
   * Original source: Luigi Core GenericHelpers
   * @param {string} name
   */
  getUrlParameter(name, locationSearch = window.location.search) {
    return new URLSearchParams(locationSearch).get(name) || '';
  }
}
