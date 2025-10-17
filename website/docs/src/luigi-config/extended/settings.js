const version = 'none';

class Settings {
  header = {
    title: 'Documentation - Luigi - The Enterprise-Ready Micro Frontend Framework',
    logo: '/logo.svg',
    favicon: '/favicon.ico'
  };

  responsiveNavigation = 'simpleMobileOnly'; // Options: simple | simpleMobileOnly | semiCollapsible
  sideNavFooterText = ' ';
  customSandboxRules = ['allow-presentation'];
  // hideNavigation = true
  // backdropDisabled = true
  theming = {
    // useFioriScrollbars: true,
    themes: [
      { id: 'dark', name: 'Dark' },
      { id: 'light', name: 'Light' }
    ],
    defaultTheme: 'dark',
    nodeViewURLDecorator: {
      queryStringParameter: {
        keyName: 'theme'
      }
    }
  };
}

export const settings = new Settings();
