import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { writeFileSync } from 'fs';
import { Feed } from 'feed';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
class BlogFeedsService {
  constructor() {
    this.feedPath = path.join(path.resolve(__dirname), '..', '..', '..', 'public', 'blog', 'feeds');
  }

  generate(blogEntries) {
    this.feed = new Feed({
      title: 'Luigi Blog',
      description: 'The Enterprise-Ready Micro Frontend Framework',
      id: 'https://luigi-project.io/blog',
      link: 'https://luigi-project.io/blog/overview',
      language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
      image: 'https://luigi-project.io/assets/img/luigi_diagramm.png',
      favicon: 'https://luigi-project.io/assets/img/favicon.png',
      copyright: 'Copyright 2021. The Luigi project authors',
      updated: new Date(), // optional, default = today
      generator: 'Luigi Project', // optional, default = 'Feed for Node.js'
      feedLinks: {
        json: 'https://luigi-project.io/blog/feeds/json',
        atom: 'https://luigi-project.io/blog/feeds/atom'
      },
      author: {
        name: 'Luigi project authors',
        email: 'luigi-project@sap.com',
        link: 'https://luigi-project.io'
      }
    });

    this.feed.addCategory('Technology');

    blogEntries.forEach((post) => {
      const blog = post;
      this.feed.addItem({
        title: post.title,
        id: `https://luigi-project.io/blog/${post.slug}`,
        link: `https://luigi-project.io/blog/${post.slug}`,
        description: post.seoMetaDescription,
        content: post.htmlContent, // or htmlExcerpt?
        author: post.author.map((name) => ({ name })),
        // contributor: [{name, email, link}],
        date: new Date(post.date)
        // image: post.image
      });
    });

    // Output: RSS 2.0
    // console.log(this.feed.rss2());
    writeFileSync(`${this.feedPath}/rss.xml`, this.feed.rss2());

    // Output: Atom 1.0
    // console.log(this.feed.atom1());
    writeFileSync(`${this.feedPath}/atom.xml`, this.feed.atom1());

    // Output: JSON Feed 1.0
    // console.log(this.feed.json1());
    writeFileSync(`${this.feedPath}/feed.json`, this.feed.json1());
  }
}

export const BlogFeeds = new BlogFeedsService();
