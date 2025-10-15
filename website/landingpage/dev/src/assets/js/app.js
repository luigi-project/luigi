import $ from 'jquery';
import DOMPurify from 'dompurify';
import 'what-input';

// Foundation JS relies on a global varaible. In ES6, all imports are hoisted
// to the top of the file so if we used`import` to import Foundation,
// it would execute earlier than we have assigned the global variable.
// This is why we have to use CommonJS require() here since it doesn't
// have the hoisting behavior.
window.jQuery = $;
require('foundation-sites');

// If you want to pick and choose which modules to include, comment out the above and uncomment
// the line below
//import './lib/foundation-explicit-pieces';

$(document).foundation();

$('#menuBtn, #closeMainNavigation').on('click', function () {
  $('#mainNavigation').toggleClass('is-active');
});

if (document.getElementById('num')) {
  let number = 10;
  let counter = setInterval(function () {
    if (number > 0) {
      document.getElementById('num').innerHTML = String(--number).padStart(2, '0');
    } else {
      clearInterval(counter);
    }
  }, 200);
}

// IE 11 doesn't support padStart function. Here is a workaround
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    'use strict';
    if (this == null) {
      throw new TypeError("can't convert " + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var maxCount = str.length * count;
    count = Math.floor(Math.log(count) / Math.log(2));
    while (count) {
      str += str;
      count--;
    }
    str += str.substring(0, maxCount - str.length);
    return str;
  };
}

// end of IE11 workaround for padStart function

let listCounter = 0;

if (document.getElementById('social-list')) {
  let listItems = document.getElementById('social-list').getElementsByTagName('a');

  setActiveLinkOnHover(listItems);
  setActiveLinkOnKeyboardClick(listItems);
}

function setActiveLinkOnHover(listItems) {
  for (let i = 0; i < listItems.length; i++) {
    listItems[i].index = i;
    listItems[i].addEventListener('mouseover', function (event) {
      removeActiveState(listItems);
      event.target.classList.add('is-active');
      listCounter = event.target.index;
    });

    listItems[i].addEventListener('mouseout', function (event) {
      removeActiveState(listItems);
      listItems[0].classList.add('is-active');
      listCounter = 0;
    });
  }
}

function setActiveLinkOnKeyboardClick(listItems) {
  document.addEventListener('keydown', function (e) {
    switch (e.which) {
      case 38: // up
        if (listCounter > 0) {
          removeActiveState(listItems);
          listCounter--;
          listItems[listCounter].classList.add('is-active');
        }
        break;

      case 40: // down
        if (listCounter < listItems.length - 1) {
          removeActiveState(listItems);
          listCounter++;
          listItems[listCounter].classList.add('is-active');
        }
        break;

      default:
        return; // exit this handler for other keys
    }
    e.preventDefault();
  });
}

function removeActiveState(arr) {
  [].forEach.call(arr, function (el) {
    el.classList.remove('is-active');
  });
}

// BLOG
var backToBlog = $('#back-to-blog');
//variables for load more blogs functionality
var loadMoreBlogsBtn = $('#load-more-blogs-btn');
var backToTopBtn = $('#back-to-top-btn');
var filesAmount = $('#blog-chunks-data').data('chunk-total'); //count amount of all blogs files
var chunksMinBlogLoadAmount = $('#blog-chunks-data').data('chunk-step'); //amount of blogs to be visible on first load
var chunkCounter = 0;

loadMoreBlogsBtn.on('click', function () {
  fetch('blog-chunks/blog-chunk' + chunkCounter + '.html', {
    method: 'GET'
  })
    .then((response) => {
      if (response.ok) {
        response.text().then((response) => {
          $('#blog-chunk').append(DOMPurify.sanitize(response));
          chunkCounter = chunkCounter + chunksMinBlogLoadAmount;
          let chunksWrapperDIV = $('#blog-chunk div.blog-entry:nth-child(' + chunkCounter + ')');

          //ids for a smooth scroll to particular new div
          chunksWrapperDIV.attr('id', 'chunk-number' + chunkCounter);
          loadMoreBlogsBtn.attr('href', '#chunk-number' + chunkCounter);

          let currentVisibleBlogs = chunkCounter + chunksMinBlogLoadAmount;
          if (currentVisibleBlogs >= filesAmount) {
            loadMoreBlogsBtn.addClass('hide');
            backToTopBtn.removeClass('hide');
          } else if (filesAmount === undefined) {
            loadMoreBlogsBtn.hide();
          }
        });
      } else {
        console.log('Can not fetch the chunk');
      }
    })
    .catch((error) => {
      console.log('No blog-chunks is available', error);
    });
});

// use history api back() instead of standard link if coming from overview page
if (backToBlog.length && document.referrer.indexOf('/blog/overview') !== -1 && window.history) {
  backToBlog.on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    history.back();
  });
}

// THEMING
function storeTheme(theme) {
  const domainData = location.hostname.split('.');
  let domain = location.hostname;
  if (domainData.length > 1) {
    domain = `${domainData[domainData.length - 2]}.${domainData[domainData.length - 1]}`;
  }
  document.cookie = `dark-mode=${theme === 'dark'}; Domain=${domain}; path=/; max-age=31536000 ; SameSite=lax`;
}

function readTheme() {
  const biscuit = document.cookie;
  if (biscuit && biscuit.length > 0) {
    const vals = biscuit.split(';');
    if (vals.length > 0) {
      for (let index = 0; index < vals.length; index++) {
        if (vals[index].trim() === 'dark-mode=false') {
          return 'light';
        } else if (vals[index].trim() === 'dark-mode=true') {
          return 'dark';
        }
      }
    } else if (biscuit === 'dark-mode=false') {
      return 'light';
    }
  }
  return 'dark';
}

if (readTheme() !== 'light') {
  document.body.classList.add('has-dark-bg');
}

if (cookieStore) {
  cookieStore.addEventListener('change', (ev) => {
    ev.changed.forEach((change) => {
      if (change.name === 'dark-mode') {
          document.body.classList.toggle('has-dark-bg', change.value !== 'false');
      }
    });
  });
}

document.getElementById('theme-switcher-btn').addEventListener('click', () => {
  document.body.classList.toggle('has-dark-bg');
  storeTheme(document.body.classList.contains('has-dark-bg') ? 'dark' : 'light');
});
