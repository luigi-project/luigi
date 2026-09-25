// file that gathers all the preset configs. Read by the dropdown in App.svelte
import defaultConfig from './defaultConfig.js';
import viewGroupPreset from "./viewGroupPreset";
import basicNavigation from './basicNavigationPreset.js';
import userSettingsPreset from './userSettingsPreset.js';
import compoundPreset from './compoundPreset.js';
import globalSearchPreset from './globalSearchPreset.js';

export default [
    { id: 'defaultConfig', label: 'Default Config', config: defaultConfig },
    { id: 'basicNavigation', label: 'Basic Navigation Preset', config: basicNavigation },
    { id: 'userSettingsPreset', label: 'Settings Preset', config: userSettingsPreset },
    { id: 'viewGroupPreset', label: 'View Group Preset', config: viewGroupPreset },
    { id: 'compoundPreset', label: 'Compound Container Preset', config: compoundPreset },
    { id: 'globalSearchPreset', label: 'Global Search Preset', config: globalSearchPreset }
];