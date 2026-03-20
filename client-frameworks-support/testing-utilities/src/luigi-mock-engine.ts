/*
 * This class mocks Luigi Core related functionality.
 *
 * Micro Frontends that use Luigi Client would usually communicate with Luigi Core
 * back and forth. When testing Luigi Client based components, Luigi Core might
 * not be present which leads into limitations on integration/e2e testing for standalone
 * microfrontends.
 *
 * This module adds a hook to the window postMessage API by adding an event listener to the
 * global message event of the window object and mocking the callback.
 * In the normal workflow this message would picked up by Luigi Core which then sends the response back.
 */

export class LuigiMockEngine {
  // Add a hook to the post message api to mock the LuigiCore response to the Client
  public static initPostMessageHook() {
    return async (): Promise<void> => {
      // Check if Luigi Client is running standalone
      if (window.parent === window) {
        console.debug('Detected standalone mode');

        // Check and skip if Luigi environment is already mocked
        if ((window as any).luigiMockEnvironment) {
          return;
        }

        // mock target origin
        if ((window as any).LuigiClient) {
          (window as any).LuigiClient.setTargetOrigin('*');
        }

        (window as any).luigiMockEnvironment = {
          msgListener: function(e: any) {
            // Origin validation for testing: accept same-origin or null (for standalone mode)
            if (e.origin !== window.location.origin && e.origin !== 'null' && e.origin !== '') {
              console.warn('[Luigi Mock] Rejected message from untrusted origin:', e.origin);
              return;
            }

            if (e.data.msg && (e.data.msg.startsWith('luigi.') || e.data.msg === 'storage')) {
              if (e.data.msg === 'luigi.get-context') {
                window.postMessage(
                  {
                    msg: 'luigi.init',
                    emulated: true,
                    internal: {
                      viewStackSize: 1
                    },
                    context: e.data.context
                  },
                  '*'
                );
              }

              // vizualise retrieved event data
              LuigiMockEngine.visualize(JSON.stringify(e.data));

              // Check and run mocked callback if it exists
              const mockListener = (window as any).luigiMockEnvironment.mockListeners[e.data.msg];
              if (mockListener) {
                mockListener(e);
              }
            }
          },
          mockListeners: {
            'luigi.navigation.pathExists': (event: any) => {
              const mockData = window.sessionStorage.getItem('luigiMockData');
              let mockDataParsed = mockData ? JSON.parse(mockData) : undefined;
              const inputPath = event.data.data.link;
              const pathExists = mockDataParsed && mockDataParsed.pathExists && mockDataParsed.pathExists[inputPath];

              const response = {
                msg: 'luigi.navigation.pathExists.answer',
                data: {
                  correlationId: event.data.data.id,
                  pathExists: pathExists ? pathExists : false
                },
                emulated: true
              };
              window.postMessage(response, '*');
            },
            //ux
            'luigi.ux.confirmationModal.show': (event: any) => {
              const response = {
                msg: 'luigi.ux.confirmationModal.hide',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            'luigi.ux.alert.show': (event: any) => {
              const response = {
                msg: 'luigi.ux.alert.hide',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            'luigi.ux.set-current-locale': (event: any) => {
              const response = {
                msg: 'luigi.current-locale-changed',
                currentLocale: event.data.data.currentLocale,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            // linkManager
            'luigi.navigation.open': (event: any) => {
              const response = {
                msg: 'luigi.navigate.ok',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            'luigi.navigation.splitview.close': (event: any) => {
              const response = {
                msg: 'luigi.navigate.ok',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            'luigi.navigation.splitview.collapse': (event: any) => {
              const response = {
                msg: 'luigi.navigate.ok',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            'luigi.navigation.splitview.expand': (event: any) => {
              const response = {
                msg: 'luigi.navigate.ok',
                data: event.data,
                emulated: true
              };
              window.postMessage(response, '*');
            },
            // storage
            storage: () => {}
          }
        };

        // Listen to the global 'message' event of the window object
        window.addEventListener('message', (window as any).luigiMockEnvironment.msgListener);
      }
    };
  }

  /*
   * This method takes a data object of type 'any' and vizualizes a simple container
   * which holds data that is useful for e2e testing.
   */
  public static visualize(data: string): void {
    const visualizationContainerId = 'luigi-debug-vis-cnt';
    const dataWrapper: HTMLDivElement = document.createElement('div');
    let luigiVisualizationContainer: Element | null = document.querySelector('#' + visualizationContainerId);

    // Construct element structure if not already constructed
    if (!luigiVisualizationContainer) {
      luigiVisualizationContainer = document.createElement('div');
      luigiVisualizationContainer.setAttribute('id', visualizationContainerId);
      // Hide the added DOM element to avoid interferring/overlapping with other elements during testing.
      luigiVisualizationContainer.setAttribute('style', 'display:none');
      document.body.appendChild(luigiVisualizationContainer);
    }

    dataWrapper.textContent = data;
    luigiVisualizationContainer.appendChild(dataWrapper);
  }
}
