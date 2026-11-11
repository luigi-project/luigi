// @ts-nocheck
// import pre-bundled docs.json to avoid bundling again on runtime
import docsJSON from '#lib/data/docs.json';

const docsArray = Array.from(docsJSON);

/** @type {import('./$types').PageLoad} */
// @ts-ignore
export function load({ params }) {
  const thisMfDocu = docsArray.find((item) => item.shortName === params.slug);
  if (thisMfDocu) {
    return {
      content: thisMfDocu.contents.value,
      slug: params.slug
    };
  }
}

/**
 * Custom functions used to prerender all pages in the slugs for static serving the site in Netlify.
 * This is helpful in automatically building newly added docu pages.
 * @returns list of all possible slugs
 */
export function entries() {
  const listOfSlugs = docsArray.map((item) => {
    return {
      slug: item.shortName
    };
  });
  console.info('List of Slugs dynamically loaded for production export', listOfSlugs);
  return listOfSlugs;
}

export const prerender = true;
