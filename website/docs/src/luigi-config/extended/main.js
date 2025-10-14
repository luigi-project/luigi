// import { auth } from './auth';
import { navigation } from './navigation';
import { routing } from './routing';
import { settings } from './settings';
import {globalSearch} from './globalSearch';
import {communication} from './communication';

window.toggleTheme = () => {
  document.body.classList.toggle('lightTheme');
  Luigi.theming().setCurrentTheme(document.body.classList.contains('lightTheme') ? 'light' : 'dark');
  Luigi.configChanged('navigation');
}

Luigi.setConfig({
  // auth,
  navigation,
  routing,
  settings,
  globalSearch,
  communication
});
