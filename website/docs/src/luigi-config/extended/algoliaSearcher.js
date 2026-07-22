import algoliasearch from "algoliasearch";
const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;

class AlgoliaSearcher {
  constructor() {
    this.client = algoliasearch(appId, apiKey);
    this.index = this.client.initIndex("luigi-project");
    this.searchResult = 8
    this.isDevelop = parseInt(window.location.port) === 4000;
    this.coreBaseUrl = window.location.origin;
  }
  executeSearch(query) {
    this.index.search(query, { hitsPerPage: this.searchResult, filters: 'type:content' })
      .then(({ hits }) => {
        hits = hits.map(this.transformUrls.bind(this)).map(this.transformContent);
        Luigi.globalSearch().showSearchResult([query].concat(hits));
      })
      .catch(err => {
        console.log('Error in executing the query ' + err);
      });
  }
  transformUrls(hit) {
    hit.url = hit.url.replace('https://docs.luigi-project.io', '');
    hit.url = hit.url.replace('/docu-microfrontend', '');
    return hit;
  }
  transformContent(hit) {
    let url = hit.url;
    let params = {};
    if (url.indexOf("#") != -1) {
      params = {
        section: url.substring(url.indexOf("#") + 1)
      }
      url = url.substring(0, url.indexOf("#"))
    }
    const title1 = hit.hierarchy['lvl0'];
    const title2 = hit.hierarchy['lvl1'] || hit.hierarchy['lvl0'];
    const title3 = hit.hierarchy['lvl2'] || hit.hierarchy['lvl0'];
    return {
      pathObject: {
        link: url,
        params
      },
      label: hit.hierarchy['lvl0'],
      description: hit.content ?? '',
      title1,
      title2,
      title3,
      hit
    }
  }
}

export const algoliaSearcher = new AlgoliaSearcher();
