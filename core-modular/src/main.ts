// import './app.scss';
import { Luigi } from './core-api/luigi';
import { LuigiEngine } from './luigi-engine';

(window as any).Luigi = new Luigi(new LuigiEngine());
