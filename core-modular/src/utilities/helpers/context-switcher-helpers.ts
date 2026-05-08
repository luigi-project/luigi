import type { Luigi } from '../../core-api/luigi';
import { GenericHelpers } from './generic-helpers';
import { RoutingHelpers } from './routing-helpers';

export const ContextSwitcherHelpers = {
  _fallbackLabels: new Map(),

  resetFallbackLabelCache() {
    ContextSwitcherHelpers._fallbackLabels.clear();
  },

  getPreparedParentNodePath(config: Record<string, any>): string {
    if (!config.parentNodePath || !config.parentNodePath.startsWith('/')) {
      console.error(
        'Luigi Config Error: navigation.contextSwitcher.parentNodePath must be defined as an absolute path.'
      );
    }

    if (config.parentNodePath) {
      return GenericHelpers.addTrailingSlash(config.parentNodePath);
    }

    return config.parentNodePath;
  },

  generateSwitcherNav(config: Record<string, any>, rawOptions: any[]): any[] {
    const parentNodePath = ContextSwitcherHelpers.getPreparedParentNodePath(config);

    return rawOptions.map((opt) => ({
      label: opt.label,
      link: (parentNodePath || '/') + opt.pathValue,
      id: opt.pathValue,
      testId: opt.testId,
      customRendererCategory: opt.customRendererCategory
    }));
  },

  getNodePathFromCurrentPath(option: Record<string, any>, selectedOption: Record<string, any>): string {
    const currentPath = GenericHelpers.addLeadingSlash(RoutingHelpers.getCurrentPath()?.path);
    const selectedPath = GenericHelpers.addLeadingSlash(selectedOption.link);

    if (currentPath.startsWith(selectedPath)) {
      return option.link + GenericHelpers.addLeadingSlash(currentPath.substring(selectedPath.length));
    } else {
      return option.link;
    }
  },

  getOptionById(options: any[], id: string): any {
    return options.find((opt) => opt.id === id);
  },

  getLabelFromOptions(options: any[], id: string): string {
    const found = options.find((opt) => opt.id === id);

    return found && found.label;
  },

  isContextSwitcherDetailsView(currentPath: string, parentNodePath: string): boolean {
    const currentPathNormalized = GenericHelpers.normalizePath(currentPath);
    const parentNodePathNormalized = GenericHelpers.normalizePath(parentNodePath);

    return Boolean(
      parentNodePath &&
      currentPathNormalized &&
      typeof currentPathNormalized === 'string' &&
      currentPathNormalized.startsWith(parentNodePathNormalized) &&
      currentPathNormalized !== parentNodePathNormalized
    );
  },

  async getFallbackLabel(fallbackLabelResolver: any, id: string, luigi: Luigi): Promise<string> {
    if (!fallbackLabelResolver) {
      return id;
    }

    const useFallbackLabelCache = GenericHelpers.getConfigBooleanValue(
      luigi.getConfig(),
      'navigation.contextSwitcher.useFallbackLabelCache'
    );
    const labelCache = ContextSwitcherHelpers._fallbackLabels;

    if (useFallbackLabelCache && labelCache.has(id)) {
      return labelCache.get(id);
    }

    const label: string = await fallbackLabelResolver(id);

    useFallbackLabelCache && labelCache.set(id, label);

    return label;
  },

  getSelectedId(currentPath: string, options: any[], parentNodePath: string): string | undefined {
    currentPath = GenericHelpers.normalizePath(currentPath);
    parentNodePath = GenericHelpers.normalizePath(parentNodePath);

    if (!ContextSwitcherHelpers.isContextSwitcherDetailsView(currentPath, parentNodePath)) {
      return undefined;
    }

    // we are inside the context switcher base path
    return currentPath.replace(parentNodePath, '').split('/')[0].split('?')[0]; //ignore everything after '?'
  },

  getSelectedOption(currentPath: string, options: any[], parentNodePath: string): any {
    const selectedId = ContextSwitcherHelpers.getSelectedId(currentPath, options, parentNodePath);
    let selectedOption;

    if (selectedId && options) {
      selectedOption = ContextSwitcherHelpers.getOptionById(options, selectedId);
    }

    return selectedOption;
  },

  async getSelectedLabel(
    currentPath: string,
    options: any[],
    parentNodePath: string,
    fallbackLabelResolver: any,
    luigi: Luigi
  ): Promise<string | undefined> {
    const selectedId = ContextSwitcherHelpers.getSelectedId(currentPath, options, parentNodePath);

    if (!selectedId) {
      return;
    }

    const selectedOption = ContextSwitcherHelpers.getSelectedOption(currentPath, options, parentNodePath);
    const selectedLabel = selectedOption ? selectedOption.label : undefined;

    // get the label from fallback if selectedId is not
    // in options or options not yet lazy loaded by click
    return selectedLabel || (await ContextSwitcherHelpers.getFallbackLabel(fallbackLabelResolver, selectedId, luigi));
  },

  getSelectedNode(currentPath: string, options: any[], parentNodePath: string): string | undefined {
    const selectedId = ContextSwitcherHelpers.getSelectedId(currentPath, options, parentNodePath);

    if (!selectedId) {
      return;
    }

    const selectedOption = ContextSwitcherHelpers.getSelectedOption(currentPath, options, parentNodePath);
    const selectedNodePath = selectedOption ? selectedOption.link : undefined;

    return selectedNodePath;
  },

  async fetchOptions(existingOptions = [], luigi: Luigi): Promise<any[]> {
    const config = luigi.getConfigValue('navigation.contextSwitcher');

    if (!config.lazyloadOptions && existingOptions.length) {
      return existingOptions;
    }

    const contextSwitcherOptions: any[] = await luigi.getConfigValueAsync('navigation.contextSwitcher.options');

    return await ContextSwitcherHelpers.generateSwitcherNav(config, contextSwitcherOptions);
  }
};
