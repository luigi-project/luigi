import type { Node } from './navigation';

export interface Route {
  raw: string;
  node?: Node;
  path: string;
  nodeParams?: Record<string, string>;
}

export interface LuigiParams {
  nodeParams: Record<string, any> | {};
  pathParams: Record<string, any> | {};
  searchParams: Record<string, any> | {};
}
