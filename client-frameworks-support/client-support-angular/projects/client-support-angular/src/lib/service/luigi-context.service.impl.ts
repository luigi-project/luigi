import { inject, Injectable, NgZone, Signal, signal, WritableSignal } from '@angular/core';
import { Context, addInitListener, addContextUpdateListener } from '@luigi-project/client';
import { ReplaySubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { IContextMessage, ILuigiContextTypes } from './luigi-context.model';
import { LuigiContextService } from './luigi-context.service';

@Injectable({
  providedIn: 'root'
})
export class LuigiContextServiceImpl implements LuigiContextService {
  private signalContext: WritableSignal<IContextMessage | undefined> = signal<IContextMessage | undefined>(undefined);
  private subject: ReplaySubject<IContextMessage> = new ReplaySubject<IContextMessage>(1);
  private currentContext!: IContextMessage;
  private ngZone = inject(NgZone);

  /**
   * Get a signal that emits when context is set.
   */
  public contextSignal: Signal<IContextMessage | undefined> = this.signalContext.asReadonly();

  constructor() {
    addInitListener((initContext: Context) => {
      this.addListener(ILuigiContextTypes.INIT, initContext);
    });
    addContextUpdateListener((updateContext: Context) => {
      this.addListener(ILuigiContextTypes.UPDATE, updateContext);
    });
  }

  public addListener(contextType: ILuigiContextTypes, context: Context): void {
    this.setContext({
      contextType,
      context
    } as IContextMessage);
  }

  /**
   * Get an observable that emits when context is set.
   */
  public contextObservable(): Observable<IContextMessage> {
    return this.subject.asObservable();
  }

  /**
   * Get latest context object retrieved from luigi core application or empty object, if not yet set.
   */
  public getContext(): Context {
    return this.currentContext?.context || {};
  }

  /**
   * Get a promise that resolves when context is set.
   */
  public getContextAsync(): Promise<Context> {
    return new Promise<Context>((resolve, reject) => {
      const context: Context = this.getContext();

      if (this.isObject(context) && Object.keys(context)?.length) {
        resolve(this.getContext());
      } else {
        this.contextObservable()
          .pipe(first())
          .subscribe((ctx: IContextMessage) => resolve(ctx.context));
      }
    });
  }

  /**
   * Checks if input is an object.
   * @param objectToCheck mixed
   * @returns {boolean}
   */
  private isObject(objectToCheck: any): boolean {
    return !!(objectToCheck && typeof objectToCheck === 'object' && !Array.isArray(objectToCheck));
  }

  /**
   * Set current context
   */
  protected setContext(obj: IContextMessage): void {
    this.ngZone.run(() => {
      this.currentContext = obj;
      this.signalContext.set(obj);
      this.subject.next(obj);
    });
  }
}
