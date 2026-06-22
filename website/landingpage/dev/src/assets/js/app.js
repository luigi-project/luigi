// Vanilla-JS replacement for the legacy jQuery+Foundation app.js.
// Original: landingpage/dev/src/assets/js/app.js (~245 lines).

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initCountdown();
  initBackToBlog();
  initSocialLinkKeyboard();
  initLoadMoreBlogs();
});

// THEMING — runs synchronously so the page paints with the correct theme on first frame.
// Defaults to dark; the cookie persists across the luigi-project.io subdomains.
//
// Note: the error-pages layout hardcodes `<body class="has-dark-bg">` (so the
// page paints dark even if JS is disabled). We unconditionally apply the
// cookie's value here, which means a light-themed user lands on /404 in dark
// mode for ~one frame before this script removes the class. That's fine — the
// alternative is to omit the hardcoded class and accept a white flash on slow
// connections.
(function applyInitialTheme() {
  document.body.classList.toggle('has-dark-bg', readTheme() !== 'light');
})();

function initMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('closeMainNavigation');
  const nav = document.getElementById('mainNavigation');
  const toggle = () => nav?.classList.toggle('is-active');
  menuBtn?.addEventListener('click', toggle);
  closeBtn?.addEventListener('click', toggle);

  const themeBtn = document.getElementById('theme-switcher-btn');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('has-dark-bg');
    storeTheme(document.body.classList.contains('has-dark-bg') ? 'dark' : 'light');
  });

  // Keep the toggle in sync if the cookie changes in another tab.
  if ('cookieStore' in window) {
    cookieStore.addEventListener('change', (ev) => {
      ev.changed.forEach((change) => {
        if (change.name === 'dark-mode') {
          document.body.classList.toggle('has-dark-bg', change.value !== 'false');
        }
      });
    });
  }
}

function initCountdown() {
  const numEl = document.getElementById('num');
  if (!numEl) return;
  let n = 10;
  const tick = setInterval(() => {
    if (n > 0) {
      numEl.textContent = String(--n).padStart(2, '0');
    } else {
      clearInterval(tick);
    }
  }, 200);
}

function initBackToBlog() {
  // If the user came from the overview page, prefer history.back() so their
  // scroll position is restored.
  const link = document.getElementById('back-to-blog');
  if (!link || !document.referrer.includes('/blog/overview') || !window.history) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    history.back();
  });
}

function initSocialLinkKeyboard() {
  const list = document.getElementById('social-list');
  if (!list) return;
  const items = Array.from(list.getElementsByTagName('a'));
  if (!items.length) return;

  let activeIndex = 0;

  const setActive = (i) => {
    items.forEach((el) => el.classList.remove('is-active'));
    items[i]?.classList.add('is-active');
    activeIndex = i;
  };

  items.forEach((el, i) => {
    el.addEventListener('mouseover', () => setActive(i));
    el.addEventListener('mouseout', () => setActive(0));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && activeIndex > 0) {
      setActive(activeIndex - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowDown' && activeIndex < items.length - 1) {
      setActive(activeIndex + 1);
      e.preventDefault();
    }
  });
}

// On the blog overview, load more entries in chunks of 5 from a hidden <template>.
// The legacy build wrote each chunk to /blog/blog-chunks/blog-chunkN.html and
// fetched them on click; we inline the remainder into the page instead, which
// removes the network round-trip and the chunk-files-on-disk artifact.
function initLoadMoreBlogs() {
  const btn = document.getElementById('load-more-blogs-btn');
  const target = document.getElementById('blog-chunk');
  const back = document.getElementById('back-to-top-btn');
  const data = document.getElementById('blog-chunks-data');
  const tpl = document.getElementById('blog-remaining-entries');
  if (!btn || !target || !data || !tpl) return;

  const step = parseInt(data.getAttribute('data-chunk-step'), 10) || 5;
  const total = parseInt(data.getAttribute('data-chunk-total'), 10) || 0;
  // Already-rendered inline = step. Remaining is what's in the template.
  const remaining = Array.from(tpl.content.querySelectorAll('.blog-entry'));
  let cursor = 0;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const slice = remaining.slice(cursor, cursor + step);
    slice.forEach((node) => target.appendChild(node.cloneNode(true)));
    cursor += step;

    // Anchor for smooth-scroll behaviour: the legacy uses href="#chunk-numberN".
    const visible = step + cursor;
    const lastAdded = target.querySelector(`.blog-entry:nth-child(${cursor})`);
    if (lastAdded) {
      lastAdded.id = `chunk-number${cursor}`;
      btn.setAttribute('href', `#chunk-number${cursor}`);
    }

    if (visible >= total) {
      btn.classList.add('hide');
      back?.classList.remove('hide');
    }
  });
}

// --- theme cookie ----------------------------------------------------------

function storeTheme(theme) {
  // Pin the cookie to the eTLD+1 (luigi-project.io) so the choice carries to
  // docs / fiddle subdomains too.
  const parts = location.hostname.split('.');
  const domain = parts.length > 1 ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}` : location.hostname;
  document.cookie = `dark-mode=${theme === 'dark'}; Domain=${domain}; path=/; max-age=31536000; SameSite=lax`;
}

function readTheme() {
  const cookie = document.cookie || '';
  for (const part of cookie.split(';')) {
    const v = part.trim();
    if (v === 'dark-mode=false') return 'light';
    if (v === 'dark-mode=true') return 'dark';
  }
  return 'dark';
}
