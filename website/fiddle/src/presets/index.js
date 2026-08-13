// file that gathers all the preset configs. Read by the dropdown in App.svelte
import defaultConfig from './defaultConfig.js';
import test1 from './test-preset1.js';
import test2 from './test-preset2.js';

export default [
    { id: 'default-config', label: 'Default Config', config: defaultConfig },
    { id: 'test-preset1', label: 'Test Preset 1', config: test1 },
    { id: 'test-preset1', label: 'Test Preset 2', config: test2 }
];