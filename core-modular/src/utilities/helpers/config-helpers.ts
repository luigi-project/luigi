import type { Luigi } from "../../core-api/luigi";

class ConfigHelpersClass {
    setErrorMessage(errorMsg: string) {
      throw new Error('Method not implemented.');
    }

    getLuigi(): Luigi {
        return (window as any).Luigi;
    }

    getConfigValue(key: string): any {
        return this.getLuigi().getConfigValue(key);
    }

    getConfigValueAsync(key: string): any {
        return this.getLuigi().getConfigValueAsync(key);
    }
}


export const ConfigHelpers = new ConfigHelpersClass();