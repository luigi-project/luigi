import type { LuigiEngine } from '../luigi-engine';
import { Navigation } from './navigation';
import { UX } from './ux';

export class Luigi {
  config: any;

  constructor(private engine: LuigiEngine) {}

  getEngine() {
    return this.engine;
  }

  // NOTE: using arrow style functions to have "code completion" in browser dev tools
  setConfig = (cfg: any) => {
    this.config = cfg;
    this.engine.init();
  };

  getConfig = (): any => {
    return this.config;
  };

  navigation = (): Navigation => {
    return new Navigation(this);
  };

  ux = (): any => {
    return new UX(this);
  };
  // ...
}
