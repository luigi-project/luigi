### Select a preset

1. Open the Fiddle and click **Modify Config**.
2. Click **Select Presets** and choose a preset from the list.
3. Click **Apply**.

### Add a preset

1. Create a file in `src/presets/` that default-exports the Luigi config as a string, like `defaultConfig.js`.
2. Import it in `src/presets/index.js`.
3. Add an entry with `id`, `label` and `config` to the list exported from `src/presets/index.js`. The `id` is used in `?preset=<id>` links, and the `label` is shown under **Select Presets**.