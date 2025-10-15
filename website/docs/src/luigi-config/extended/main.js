// import { auth } from './auth';
import { navigation } from './navigation';
import { routing } from './routing';
import { settings } from './settings';
import { globalSearch } from './globalSearch';
import { communication } from './communication';

window.toggleTheme = () => {
  document.body.classList.toggle('lightTheme');
  const currentTheme = document.body.classList.contains('lightTheme') ? 'light' : 'dark';
  Luigi.theming().setCurrentTheme(currentTheme);
  Luigi.configChanged('navigation');
  storeTheme(currentTheme);
};

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

if (readTheme() === 'light') {
  document.body.classList.toggle('lightTheme', true);
  settings.theming.defaultTheme = 'light';
}

Luigi.setConfig({
  // auth,
  navigation,
  routing,
  settings,
  globalSearch,
  communication
});
