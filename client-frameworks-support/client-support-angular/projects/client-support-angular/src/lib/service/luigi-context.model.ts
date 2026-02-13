import { Context } from '@luigi-project/client/esm';

export enum ILuigiContextTypes {
  INIT,
  UPDATE
}

export interface IContextMessage {
  context: Context;
  contextType: ILuigiContextTypes;
}
