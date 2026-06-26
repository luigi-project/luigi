/**
 * Configuration for compound web components in Luigi.
 * Compound allows you to layout multiple web components in one micro frontend.
 */
export interface CompoundConfig {
  /**
   * Renderer configuration for the compound layout
   */
  renderer?: {
    /**
     * The renderer to use - can be 'grid', a custom renderer object, or undefined for default
     */
    use?:
      | 'grid'
      | string
      | {
          /**
           * Base renderer to extend (e.g., 'grid')
           */
          extends?: string;
          /**
           * Custom function to create the compound container
           * @param config - The renderer configuration
           * @param renderer - The parent/super renderer (if extending)
           */
          createCompoundContainer?: (config: RendererConfig, renderer?: any) => HTMLDivElement;
          /**
           * Custom function to create individual compound item containers
           * @param layoutConfig - Layout configuration for the item
           * @param config - The overall renderer configuration
           * @param renderer - The parent/super renderer (if extending)
           */
          createCompoundItemContainer?: (
            layoutConfig?: LayoutConfig,
            config?: RendererConfig,
            renderer?: any
          ) => HTMLDivElement;
          /**
           * Custom function to attach an item to the compound container
           * @param compoundCnt - The compound container element
           * @param compoundItemCnt - The item container to attach
           * @param renderer - The parent/super renderer (if extending)
           */
          attachCompoundItem?: (compoundCnt: HTMLElement, compoundItemCnt: HTMLElement, renderer?: any) => void;
        };
    /**
     * Configuration for the grid layout
     */
    config?: {
      /**
       * CSS grid-template-columns value (e.g., '1fr 2fr')
       */
      columns?: string;
      /**
       * CSS grid-template-rows value (e.g., '150px 150px')
       */
      rows?: string;
      /**
       * CSS grid-gap value (e.g., 'auto', '10px')
       */
      gap?: string;
      /**
       * Minimum height for the grid container
       */
      minHeight?: string;
      /**
       * Responsive layout configurations for different viewport sizes
       */
      layouts?: Array<{
        /**
         * CSS grid-template-columns for this breakpoint
         */
        columns?: string | number;
        /**
         * CSS grid-template-rows for this breakpoint
         */
        rows?: string | number;
        /**
         * CSS grid-gap for this breakpoint
         */
        gap?: string | number;
        /**
         * Minimum viewport width for this layout (in pixels)
         */
        minWidth?: number;
        /**
         * Maximum viewport width for this layout (in pixels)
         */
        maxWidth?: number;
      }>;
    };
  };

  /**
   * Lazy loading configuration for compound children
   */
  lazyLoadingOptions?: {
    /**
     * Enable lazy loading using IntersectionObserver
     * @default false
     */
    enabled?: boolean;
    /**
     * IntersectionObserver rootMargin option
     * Controls when children are loaded relative to viewport visibility
     * @default "0px"
     */
    intersectionRootMargin?: string;
    /**
     * Default temporary height for child containers before they load
     * @default "500px"
     */
    temporaryContainerHeight?: string;
    /**
     * Disable automatic temporary container heights
     * Useful for custom renderers that manage heights themselves
     * @default false
     */
    noTemporaryContainerHeight?: boolean;
  };

  /**
   * Array of child web component configurations
   */
  children?: Array<{
    /**
     * Unique identifier for this child web component
     */
    id: string;
    /**
     * URL pointing to the web component JavaScript file
     * Supports {i18n.currentLocale} placeholder for localization
     */
    viewUrl: string;
    /**
     * Context object passed to the web component
     */
    context?: Record<string, any>;
    /**
     * Layout configuration for positioning this child
     */
    layoutConfig?: {
      /**
       * CSS grid-row value (e.g., '1 / 3', 'auto')
       * @default "auto"
       */
      row?: string;
      /**
       * CSS grid-column value (e.g., '1 / -1', 'auto')
       * @default "auto"
       */
      column?: string;
      /**
       * Slot name for nested web components
       * Use this instead of row/column to plug into a parent's slot
       */
      slot?: string;
      /**
       * Override the default temporary container height for this specific child
       * Only used when lazy loading is enabled
       * * @default undefined
       */
      temporaryContainerHeight?: string;
    };
    /**
     * Event listeners for cross-component communication via event bus
     */
    eventListeners?: Array<{
      /**
       * ID of the source web component (use '*' for any source)
       */
      source: string;
      /**
       * Name of the event to listen for
       */
      name: string;
      /**
       * Type of action to perform (e.g., 'update')
       */
      action: string;
      /**
       * Optional function to convert event data before passing to listener
       * @param data - The event data
       */
      dataConverter?: (data: any) => any;
    }>;
  }>;
}

/**
 * Supporting type for layout configuration
 */
export interface LayoutConfig {
  column?: string;
  row?: string;
  slot?: string;
  temporaryContainerHeight?: string;
}

/**
 * Supporting type for renderer configuration
 */
export interface RendererConfig {
  columns?: string;
  rows?: string;
  gap?: string;
  minHeight?: string;
  layouts?: Array<{
    columns?: string;
    rows?: string;
    gap?: string | number;
    minWidth?: number;
    maxWidth?: number;
  }>;
}
