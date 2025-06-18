import { version } from '../../../node_modules/@luigi-project/client/package.json';

class Settings {
  header = {
    logo: 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MTIuMzggMjA0Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsLXJ1bGU6ZXZlbm9kZH0uY2xzLTF7ZmlsbDp1cmwoI2xpbmVhci1ncmFkaWVudCl9LmNscy0ye2ZpbGw6I2ZmZn08L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB4MT0iMjA2LjE5IiB4Mj0iMjA2LjE5IiB5Mj0iMjA0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMDBiOGYxIi8+PHN0b3Agb2Zmc2V0PSIuMDIiIHN0b3AtY29sb3I9IiMwMWI2ZjAiLz48c3RvcCBvZmZzZXQ9Ii4zMSIgc3RvcC1jb2xvcj0iIzBkOTBkOSIvPjxzdG9wIG9mZnNldD0iLjU4IiBzdG9wLWNvbG9yPSIjMTc3NWM4Ii8+PHN0b3Agb2Zmc2V0PSIuODIiIHN0b3AtY29sb3I9IiMxYzY1YmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxZTVmYmIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+U0FQX2dyYWRfUl9zY3JuX1plaWNoZW5mbMOkY2hlIDE8L3RpdGxlPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTAgMjA0aDIwOC40MUw0MTIuMzggMEgwdjIwNCIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTI0NC43MyAzOC4zNmgtNDAuNnY5Ni41MmwtMzUuNDYtOTYuNTVoLTM1LjE2bC0zMC4yNyA4MC43MkMxMDAgOTguNyA3OSA5MS42NyA2Mi40IDg2LjQgNTEuNDYgODIuODkgMzkuODUgNzcuNzIgNDAgNzJjLjA5LTQuNjggNi4yMy05IDE4LjM4LTguMzggOC4xNy40MyAxNS4zNyAxLjA5IDI5LjcxIDhsMTQuMS0yNC41NUM4OS4wNiA0MC40MiA3MSAzNi4yMSA1Ni4xNyAzNi4xOWgtLjA5Yy0xNy4yOCAwLTMxLjY4IDUuNi00MC42IDE0LjgzQTM0LjIzIDM0LjIzIDAgMCAwIDUuNzcgNzQuN0M1LjU0IDg3LjE1IDEwLjExIDk2IDE5LjcxIDEwM2M4LjEgNS45NCAxOC40NiA5Ljc5IDI3LjYgMTIuNjIgMTEuMjcgMy40OSAyMC40NyA2LjUzIDIwLjM2IDEzQTkuNTcgOS41NyAwIDAgMSA2NSAxMzVjLTIuODEgMi45LTcuMTMgNC0xMy4wOSA0LjEtMTEuNDkuMjQtMjAtMS41Ni0zMy42MS05LjU5TDUuNzcgMTU0LjQyYTkzLjc3IDkzLjc3IDAgMCAwIDQ2IDEyLjIyaDIuMTFjMTQuMjQtLjI1IDI1Ljc0LTQuMzEgMzQuOTItMTEuNzEuNTMtLjQxIDEtLjg0IDEuNDktMS4yOGwtNC4xMiAxMC44NUgxMjNsNi4xOS0xOC44MmE2Ny40NiA2Ny40NiAwIDAgMCAyMS42OCAzLjQzIDY4LjMzIDY4LjMzIDAgMCAwIDIxLjE2LTMuMjVsNiAxOC42NGg2MC4xNHYtMzloMTMuMTFjMzEuNzEgMCA1MC40Ni0xNi4xNSA1MC40Ni00My4yIDAtMzAuMTEtMTguMjItNDMuOTQtNTcuMDEtNDMuOTR6TTE1MC45MSAxMjFhMzYuOTMgMzYuOTMgMCAwIDEtMTMtMi4yOGwxMi44Ny00MC41OWguMjJsMTIuNjUgNDAuNzFhMzguNSAzOC41IDAgMCAxLTEyLjc0IDIuMTZ6bTk2LjItMjMuMzNoLTguOTRWNjQuOTFoOC45NGMxMS45MyAwIDIxLjQ0IDQgMjEuNDQgMTYuMTQgMCAxMi42LTkuNTEgMTYuNTctMjEuNDQgMTYuNTciLz48L3N2Zz4=',
    title: 'Luigi Demo',
    subTitle: version || 'unknown',
    favicon: '/assets/favicon-sap.ico',
    responsiveShellbarPaddings: false
    //disabled:true
  };
  appLoadingIndicator = {
    hideAutomatically: false
  };
  profileType = ''; // Options: simple | Fiori3 | vega
  responsiveNavigation = 'Fiori3'; // Options: simple | simpleMobileOnly | semiCollapsible | Fiori3
  sideNavFooterText = `Luigi Client: ${version || 'unknown'}`;
  thirdPartyCookieCheck = {
    // thirdPartyCookieScriptLocation: 'https://domain/init.html',
    thirdPartyCookieErrorHandling: () => {
      const alert = {
        text: 'Third Party Cookies are not enabled. Please check your browser settings.',
        type: 'warning'
      };
      Luigi.ux().showAlert(alert);
    }
  };
  burgerTooltip = {
    navExpanded: 'Collapse navigation test',
    navCollapsed: 'Expand navigation test'
  };
  theming = {
    themes: () => [
      { id: 'light', name: 'Fiori3 Light' },
      { id: 'dark', name: 'Fiori3 Dark' }
    ],
    defaultTheme: 'light'
    // nodeViewURLDecorator: {
    //   queryStringParameter: {
    //     keyName: 'sap-theme'
    //     // optional
    //     // value: themeId => {
    //     //   return themeId;
    //     // }
    //   }
    // }
  };
  featureToggles = {
    queryStringParam: 'ft'
  };

  // customAlertHandler = (settings, openFromClient = false) =>{
  //   window.open('http://localhost:4200',settings.title , `width=${settings.width},height=${settings.height}`);
  // }

  // sideNavCompactMode = true;
  // allowRules = ['microphone'];
  // iframeCreationInterceptor = (iframe, viewGroup, navigationNode, microFrontendType) => { };
  // hideNavigation = true
  // backdropDisabled = true
  // customTranslationImplementation = () => {
  //   return {
  //     getTranslation: (key, interpolations, locale) => {
  //       return '*' + key + '* ' + (locale || Luigi.i18n().getCurrentLocale());
  //     }
  //   };
  // };
  // globalSideNavigation = true;
  profileMenuFiori3 = false;
  btpToolLayout = false;
  experimental = {
    btpToolLayout: true,
    profileMenuFiori3: true
  };
}

export const settings = new Settings();
