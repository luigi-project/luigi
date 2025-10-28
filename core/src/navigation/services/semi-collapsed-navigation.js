import { GenericHelpers, NavigationHelpers } from '../../utilities/helpers';
import { LuigiConfig } from '../../core-api';
import { CSS_BREAKPOINTS } from '../../utilities/constants';

class SemiCollapsibleNavigationClass {
  initial() {
    this.responsiveNavSetting = LuigiConfig.getConfigValue('settings.responsiveNavigation');

    const isResponsiveNavSemiCollapsibleOrFiori3 =
      this.responsiveNavSetting === 'semiCollapsible' || this.responsiveNavSetting === 'Fiori3';

    //checking if there was a previous state in LocalStorage before the first load and reload
    if (
      GenericHelpers.parseJSON(localStorage.getItem(NavigationHelpers.COL_NAV_KEY)) !== false &&
      isResponsiveNavSemiCollapsibleOrFiori3
    ) {
      this.isSemiCollapsed = this.getCollapsed();
    }
    this.semiCollapsible = isResponsiveNavSemiCollapsibleOrFiori3 ? true : false;

    // set this.isSemiCollapsed to true for mobile
    let isSemiCollapsedUndefined = this.isSemiCollapsed === undefined;
    if (this.semiCollapsible && window.innerWidth !== 0 && window.innerWidth < CSS_BREAKPOINTS.desktopMinWidth) {
      this.isSemiCollapsed = isSemiCollapsedUndefined ? true : this.getCollapsed();
    } else {
      this.isSemiCollapsed = isSemiCollapsedUndefined ? false : this.getCollapsed();
    }

    this.setCollapsed(this.isSemiCollapsed);

    this.previousWindowWidth = window.innerWidth;

    return {
      isSemiCollapsed: this.isSemiCollapsed,
      semiCollapsible: this.semiCollapsible
    };
  }

  onValueChanged(fn) {
    if (this.valueChangedFns) {
      this.valueChangedFns.push(fn);
    } else {
      this.valueChangedFns = [fn];
    }
  }

  onResize(selectedCategory) {
    const isDesktopToMobile =
      window.innerWidth !== 0 &&
      window.innerWidth < CSS_BREAKPOINTS.desktopMinWidth &&
      this.previousWindowWidth >= CSS_BREAKPOINTS.desktopMinWidth;
    const isMobileToDesktop =
      window.innerWidth !== 0 &&
      window.innerWidth > CSS_BREAKPOINTS.desktopMinWidth &&
      this.previousWindowWidth >= CSS_BREAKPOINTS.desktopMinWidth;

    if (isDesktopToMobile) {
      this.setCollapsed(true, false);
    }
    if (!this.isStoredCollapsed() && isMobileToDesktop) {
      this.setCollapsed(false, false);
    }
    selectedCategory = this.closePopupMenu(selectedCategory);
    return { isSemiCollapsed: this.isSemiCollapsed, selectedCategory };
  }

  setCollapsed(state, persistState = true) {
    document.body.classList.remove('semiCollapsed');
    // add if true
    if (state) {
      document.body.classList.add('semiCollapsed');
    }
    // initial state
    this.isSemiCollapsed = state;
    if (persistState) {
      localStorage.setItem(NavigationHelpers.COL_NAV_KEY, state);
    }

    if (this.valueChangedFns instanceof Array) {
      this.valueChangedFns.forEach(fn =>
        fn({
          isSemiCollapsed: this.isSemiCollapsed
        })
      );
    }
  }

  isStoredCollapsed() {
    return GenericHelpers.parseJSON(localStorage.getItem(NavigationHelpers.COL_NAV_KEY));
  }

  getCollapsed() {
    if (this.isStoredCollapsed()) {
      return true;
    }
    return this.isSemiCollapsed;
  }

  closePopupMenu(selectedCategory) {
    if (selectedCategory) {
      selectedCategory = null;
      document.getElementsByClassName('fd-app__sidebar')[0]?.classList.remove('isBlocked');
    }
    return selectedCategory;
  }

  buttonClicked(el) {
    this.closePopupMenu();
    if (!this.getCollapsed()) {
      this.setCollapsed(true);

      //Force browser to re-render vertical scrollbar
      if (document.getElementsByClassName('lui-fd-side-nav-wrapper')[0]) {
        document.getElementsByClassName('lui-fd-side-nav-wrapper')[0].setAttribute('style', 'overflow-y:hidden;');
        window.setTimeout(function() {
          document.getElementsByClassName('lui-fd-side-nav-wrapper')[0].setAttribute('style', 'overflow-y:auto;');
        });
      }
    } else {
      this.setCollapsed(false);
    }

    return this.isSemiCollapsed;
  }
}

export const SemiCollapsibleNavigation = new SemiCollapsibleNavigationClass();
