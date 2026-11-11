// file that gathers all the preset configs. Read by the dropdown in App.svelte
import defaultConfig from './defaultConfig.js';
import viewGroupPreset from "./viewGroupPreset";
import basicNavigation from './basicNavigationPreset.js';
import userSettingsPreset from './userSettingsPreset.js';
import compoundPreset from './compoundPreset.js';
import globalSearchPreset from './globalSearchPreset.js';

export default [
    { id: 'defaultConfig', label: 'Default Config', config: defaultConfig },
    { id: 'basicNavigation', label: 'Basic Navigation', config: basicNavigation },
    { id: 'userSettings', label: 'Settings', config: userSettingsPreset },
    { id: 'viewGroup', label: 'View Group', config: viewGroupPreset },
    { id: 'compound', label: 'Compound Container', config: compoundPreset },
    { id: 'globalSearch', label: 'Global Search', config: globalSearchPreset }
];