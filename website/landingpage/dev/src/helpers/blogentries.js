const path = require('path');
const { writeFileSync } = require('fs');
const { getBlogEntries } = require('../services/blogprocessor.js');

module.exports = function blogentries() {
  debugger;
  const blogChunkPath = path.join(__dirname, '../../../public/blog', 'blog-chunks');
  const numberOfBlogsToBeVisibleOnLoad = 5;
  const blogsMapAll = getBlogEntries().map((entry) => entry.blogExcerpt);
  const blogsListLength = blogsMapAll.length;
  const showedBlogs = blogsMapAll.slice(0, numberOfBlogsToBeVisibleOnLoad);
  const showedBlogsHTML = showedBlogs.join(' ');
  const hiddenBlogsArray = blogsMapAll.slice(numberOfBlogsToBeVisibleOnLoad);
  const hiddenBlogsArrayLength = hiddenBlogsArray.length;

  const blogHTMLDataLength = `<div id="blog-chunks-data" 
    data-chunk-step="${numberOfBlogsToBeVisibleOnLoad}" 
    data-chunk-total="${blogsListLength}"></div>`;

  if (blogsListLength > numberOfBlogsToBeVisibleOnLoad) {
    for (
      let currentBlogNumber = 0;
      currentBlogNumber < hiddenBlogsArrayLength;
      currentBlogNumber += numberOfBlogsToBeVisibleOnLoad
    ) {
      const currentChunkOfBlogs = hiddenBlogsArray.slice(
        currentBlogNumber,
        currentBlogNumber + numberOfBlogsToBeVisibleOnLoad
      );
      const currentChunkOfBlogsHTML = currentChunkOfBlogs.join(' ');
      writeFileSync(`${blogChunkPath}/blog-chunk${currentBlogNumber}.html`, currentChunkOfBlogsHTML);
    }
    return `${showedBlogsHTML} ${blogHTMLDataLength}`;
  } else {
    return showedBlogsHTML;
  }
};
