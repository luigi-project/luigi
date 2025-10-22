// @ts-nocheck
import type { LayoutConfig, RendererObject, RendererUseProps } from '../../src/constants/container.model';
import {
  CustomCompoundRenderer,
  DefaultCompoundRenderer,
  GridCompoundRenderer
} from '../../src/services/web-component-helpers';
import * as helperFunctions from '../../src/services/web-component-helpers';

describe('DefaultCompoundRenderer', () => {
  it('should create a compound container', () => {
    // Arrange
    const renderer = new DefaultCompoundRenderer();

    // Act
    const compoundContainer = renderer.createCompoundContainer();

    // Assert
    expect(compoundContainer).toBeInstanceOf(HTMLDivElement);
  });

  it('should create a compound item container', () => {
    // Arrange
    const renderer = new DefaultCompoundRenderer();

    // Act
    const compoundItemContainer = renderer.createCompoundItemContainer();

    // Assert
    expect(compoundItemContainer).toBeInstanceOf(HTMLDivElement);
  });

  it('should attach a compound item to a compound container', () => {
    // Arrange
    const renderer = new DefaultCompoundRenderer();
    const compoundContainer = document.createElement('div');
    const compoundItem = document.createElement('div');

    // Act
    renderer.attachCompoundItem(compoundContainer, compoundItem);

    // Assert
    expect(compoundContainer.contains(compoundItem)).toBe(true);
  });

  it('should initialize config if a renderer object is not provided', () => {
    // Arrange
    const renderer = new DefaultCompoundRenderer();

    // Assert
    expect(renderer.config).toEqual({});
  });

  it('should initialize config from the renderer object if provided', () => {
    // Arrange
    const rendererObject = {
      config: {
        key: 'value'
      }
    } as RendererObject;

    // Act
    const renderer = new DefaultCompoundRenderer(rendererObject);

    // Assert
    expect(renderer.config).toEqual(rendererObject.config);
  });
});

describe('CustomCompoundRenderer', () => {
  describe('constructor', () => {
    it('should create an instance with a superRenderer', () => {
      // Arrange
      const rendererObj = {
        use: {
          extends: 'superRendererType'
        },
        config: {}
      };

      // Act
      const renderer = new CustomCompoundRenderer(rendererObj);

      // Assert
      expect(renderer).toBeInstanceOf(CustomCompoundRenderer);
      expect(renderer.superRenderer).toBeDefined();
      // You can add additional assertions to verify the superRenderer's properties.
    });
  });

  describe('createCompoundContainer', () => {
    it('should create a custom compound container when defined', () => {
      // Arrange
      const rendererObj = {
        use: {
          createCompoundContainer: (config, superRenderer) => {
            // Custom logic for creating a compound container
            return document.createElement('div');
          }
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);

      // Act
      const compoundContainer = customRenderer.createCompoundContainer();

      // Assert
      expect(compoundContainer).toBeInstanceOf(HTMLDivElement);
      // You can add more specific assertions for the custom logic
    });

    it('should create a custom compound container when defined', () => {
      // Arrange
      const rendererObj = {
        use: {
          createCompoundContainer: (config, superRenderer) => {
            // Custom logic for creating a compound container
            return document.createElement('div');
          }
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);

      // Act
      const compoundContainer = customRenderer.createCompoundContainer();

      // Assert
      expect(compoundContainer).toBeInstanceOf(HTMLDivElement);
      // You can add more specific assertions for the custom logic
    });

    it('should call the provided createCompoundContainer function', () => {
      const rendererObj = {
        use: {
          createCompoundContainer: jest.fn()
        },
        config: {}
      };
      // Arrange
      const renderer = new CustomCompoundRenderer(rendererObj);
      const createCompoundContainerFn = jest.fn();
      (renderer.rendererObject.use as RendererUseProps).createCompoundContainer = createCompoundContainerFn;

      // Act
      const result = renderer.createCompoundContainer();

      // Assert
      expect(result).toBeUndefined();
      expect(createCompoundContainerFn).toHaveBeenCalledWith(renderer.config, renderer.superRenderer);
    });

    it("should call the superRenderer's createCompoundContainer when no function is provided", () => {
      // Arrange
      const rendererObj = {
        use: {},
        config: {}
      };
      const renderer = new CustomCompoundRenderer(rendererObj);

      const superRenderer = new CustomCompoundRenderer(rendererObj); // Create a mock superRenderer
      renderer.superRenderer = superRenderer;
      const mockElm = document.createElement('div');
      const createCompoundContainerSpy = jest.spyOn(superRenderer, 'createCompoundContainer').mockReturnValue(mockElm);

      // Act
      const result = renderer.createCompoundContainer();

      // Assert
      expect(result).toEqual(mockElm);
      expect(createCompoundContainerSpy).toHaveBeenCalled();
    });

    it('should call the super.createCompoundContainer when no function or superRenderer is provided', () => {
      // Arrange
      const rendererObj = {
        use: {},
        config: {}
      };
      const renderer = new CustomCompoundRenderer(rendererObj);

      // Act
      const result = renderer.createCompoundContainer();

      // Assert
      expect(result).toBeInstanceOf(HTMLDivElement); // Assuming super.createCompoundContainer returns an HTMLDivElement
    });
  });

  describe('createCompoundItemContainer', () => {
    it('should create a compound item container when defined', () => {
      // Arrange
      const rendererObj = {
        use: {
          createCompoundItemContainer: (layoutConfig, config, superRenderer) => {
            // Custom logic for creating a compound item container
            return document.createElement('span');
          }
        }
      } as RendererObject;
      const customRenderer = new CustomCompoundRenderer(rendererObj);

      // Act
      const compoundItemContainer = customRenderer.createCompoundItemContainer({ layout: 'custom' });

      // Assert
      expect(compoundItemContainer).toBeInstanceOf(HTMLSpanElement);
    });

    it('should create a compound item container from superRenderer', () => {
      // Arrange
      const rendererObj = {
        use: {
          createCompoundItemContainer: undefined,
          extends: 'test'
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);

      const mockDiv = document.createElement('div');
      mockDiv.style.color = 'red';

      // Act
      const compoundItemContainer = customRenderer.createCompoundItemContainer({ layout: 'custom' });

      // Assert
      expect(compoundItemContainer).toBeInstanceOf(HTMLDivElement);
    });

    it('should create a compound item container with superRenderer and use undefined', () => {
      // Arrange
      const rendererObj = {
        use: {
          createCompoundItemContainer: undefined
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);

      const mockDiv = document.createElement('div');
      mockDiv.style.color = 'red';

      // Act
      const compoundItemContainer = customRenderer.createCompoundItemContainer({ layout: 'custom' });

      // Assert
      expect(compoundItemContainer).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('attachCompoundItem', () => {
    it('should attach a compound item with custom logic when defined', () => {
      // Arrange
      const rendererObj = {
        use: {
          attachCompoundItem: (compoundCnt, compoundItemCnt, superRenderer) => {
            // Custom logic for attaching a compound item
            compoundCnt.appendChild(compoundItemCnt);
          }
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);
      const compoundContainer = document.createElement('div');
      const compoundItem = document.createElement('div');
      compoundItem.style.color = 'white';

      // Act
      customRenderer.attachCompoundItem(compoundContainer, compoundItem);

      // Assert
      expect(compoundContainer.contains(compoundItem)).toBe(true);
    });

    it('should attach a compound item with superRenderer', () => {
      // Arrange
      const rendererObj = {
        use: {
          extends: 'test'
        }
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);
      const compoundContainer = document.createElement('div');
      const compoundItem = document.createElement('div');
      compoundItem.style.color = 'blue';

      // Act
      customRenderer.attachCompoundItem(compoundContainer, compoundItem);

      // Assert
      expect(compoundContainer.contains(compoundItem)).toBe(true);
    });

    it('should attach a compound item with use and superrenderer undefined', () => {
      // Arrange
      const rendererObj = {
        use: {}
      };
      const customRenderer = new CustomCompoundRenderer(rendererObj);
      const compoundContainer = document.createElement('div');
      const compoundItem = document.createElement('div');
      compoundItem.style.color = 'yellow';

      // Act
      customRenderer.attachCompoundItem(compoundContainer, compoundItem);

      // Assert
      expect(compoundContainer.contains(compoundItem)).toBe(true);
    });
  });
});

describe('GridCompoundRenderer', () => {
  it('should create a compound container with grid styles', () => {
    // Arrange
    const rendererObject = {
      config: {
        columns: '1fr 2fr',
        rows: 'auto',
        gap: '10px',
        minHeight: '100px',
        maxWidth: '150px',
        layouts: [
          {
            minWidth: 600,
            maxWidth: 150,
            columns: '1fr',
            rows: '1fr 1fr',
            gap: 5
          }
        ]
      }
    } as unknown as RendererObject;
    const config = rendererObject.config;
    const fixedTimestamp = 1619123456789;
    const mockDate = new Date(fixedTimestamp);
    const spyDate = jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    const gridRenderer = new GridCompoundRenderer(rendererObject);

    // Act
    const compoundContainer = gridRenderer.createCompoundContainer();

    // Assert
    expect(compoundContainer).toBeInstanceOf(HTMLDivElement);

    expect(compoundContainer.classList[0]).toEqual(`__lui_compound_${fixedTimestamp}`);
    expect(compoundContainer.innerHTML).toContain('display: grid');
    expect(compoundContainer.innerHTML).toContain(`grid-template-columns: ${config.columns || 'auto'};`);
    expect(compoundContainer.innerHTML).toContain(`grid-template-rows: ${config.rows || 'auto'};`);
    expect(compoundContainer.innerHTML).toContain(`grid-gap: ${config.gap || '0'};`);
    expect(compoundContainer.innerHTML).toContain(`min-height: ${config.minHeight || 'auto'};`);
    expect(compoundContainer.innerHTML).toContain(`and (max-width: ${config.maxWidth}`);

    spyDate.mockRestore();
    // dateNowSpy.mockRestore();
  });

  it('should create a compound item container with grid row and column styles', () => {
    // Arrange
    const layoutConfig = {
      row: 1,
      column: 2
    } as unknown as LayoutConfig;

    const gridRenderer = new GridCompoundRenderer();

    // Act
    const compoundItemContainer = gridRenderer.createCompoundItemContainer(layoutConfig);

    // Assert
    expect(compoundItemContainer).toBeInstanceOf(HTMLDivElement);

    // You can add more specific assertions for the generated HTML and styles
    expect(compoundItemContainer.getAttribute('style')).toContain('grid-row: 1');
    expect(compoundItemContainer.getAttribute('style')).toContain('grid-column: 2');
  });
});

describe('registerEventListeners', () => {
  it('should register event listeners when navNode has eventListeners', () => {
    // Arrange
    const eventbusListeners = {};
    const navNode = {
      eventListeners: [
        {
          source: 'source1',
          name: 'event1',
          action: 'action1',
          dataConverter: 'converter1'
        }
      ]
    };
    const nodeId = 'node1';
    const wcElement = 'element1';

    // Act
    helperFunctions.registerEventListeners(eventbusListeners, navNode, nodeId, wcElement);

    // Assert
    const expectedEventID = 'source1.event1';
    const listenerList = eventbusListeners[expectedEventID];
    expect(listenerList).toBeDefined();
    expect(listenerList).toHaveLength(1);
    expect(listenerList[0]).toEqual({
      wcElementId: nodeId,
      wcElement: wcElement,
      action: 'action1',
      converter: 'converter1'
    });
  });

  it('should register event listeners when navNode has NO eventListeners', () => {
    // Arrange
    const eventbusListeners = {
      's.n': [{ test: '123' }]
    };
    const navNode = {
      eventListeners: [
        {
          source: 's',
          name: 'n',
          action: 'myaction',
          dataConverter: 'myconverter'
        }
      ]
    };
    const nodeId = 'node1';
    const wcElement = 'element1';

    // Act
    helperFunctions.registerEventListeners(eventbusListeners, navNode, nodeId, wcElement);

    // Assert
    const expectedEventID = 's.n';
    const listenerList = eventbusListeners[expectedEventID];
    // expect()
    expect(listenerList).toBeDefined();
    expect(listenerList).toHaveLength(2);
    expect(listenerList[1]).toEqual({
      wcElementId: nodeId,
      wcElement: wcElement,
      action: 'myaction',
      converter: 'myconverter'
    });
  });

  it('should handle multiple event listeners', () => {
    // Arrange
    const eventbusListeners = {};
    const navNode = {
      eventListeners: [
        {
          source: 'source1',
          name: 'event1',
          action: 'action1',
          dataConverter: 'converter1'
        },
        {
          source: 'source2',
          name: 'event2',
          action: 'action2',
          dataConverter: 'converter2'
        }
      ]
    };
    const nodeId = 'node1';
    const wcElement = 'element1';

    // Act
    helperFunctions.registerEventListeners(eventbusListeners, navNode, nodeId, wcElement);

    // Assert
    const expectedEventID1 = 'source1.event1';
    const expectedEventID2 = 'source2.event2';

    const listenerList1 = eventbusListeners[expectedEventID1];
    const listenerList2 = eventbusListeners[expectedEventID2];

    expect(listenerList1).toBeDefined();
    expect(listenerList1).toHaveLength(1);
    expect(listenerList1[0]).toEqual({
      wcElementId: nodeId,
      wcElement: wcElement,
      action: 'action1',
      converter: 'converter1'
    });

    expect(listenerList2).toBeDefined();
    expect(listenerList2).toHaveLength(1);
    expect(listenerList2[0]).toEqual({
      wcElementId: nodeId,
      wcElement: wcElement,
      action: 'action2',
      converter: 'converter2'
    });
  });

  it('should handle cases when navNode is undefined or eventListeners is missing', () => {
    // Arrange
    const eventbusListeners = {};
    const navNode = undefined; // Missing eventListeners
    const nodeId = 'node1';
    const wcElement = 'element1';

    // Act
    helperFunctions.registerEventListeners(eventbusListeners, navNode, nodeId, wcElement);

    // Assert
    expect(eventbusListeners).toEqual({}); // No listeners should be registered
  });
});
