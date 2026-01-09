import { Context } from '@luigi-project/client';

export enum ILuigiContextTypes {
  INIT,
  UPDATE
}

export interface IContextMessage {
  context: Context;
  contextType: ILuigiContextTypes;
}
