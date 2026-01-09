import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Signal,
  signal,
  computed
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { addInitListener, Context, removeInitListener } from '@luigi-project/client';
import { IContextMessage, LuigiContextService } from '@luigi-project/client-support-angular';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-developers',
  templateUrl: './developers.component.html',
  styleUrls: ['./developers.component.css'],
  standalone: false
})
export class DevelopersComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private initListener;
  currentProject = signal<string | null>(null);
  computedProject = computed(() => this.currentProject() + '1');
  contextAsync;
  contextObservable;
  contextSignal;
  visitors = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private luigiContextService: LuigiContextService
  ) {
    effect(() => {
      const data: IContextMessage = luigiContextService.contextSignal()();

      if (data) {
        this.currentProject.set(data.context.currentProject + '1');
      }
    });
  }

  ngOnInit() {
    this.initListener = addInitListener((context, origin) => {
      let tempVisitors = window['visitors'] || 0;
      window['visitors'] = tempVisitors + 1;
      this.visitors = window['visitors'];
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
  }

  getContextAsync() {
    this.luigiContextService.getContextAsync().then((ctx: Context) => {
      this.contextAsync = ctx.currentProject;
    });
  }

  getContextObservable() {
    this.luigiContextService
      .contextObservable()
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe((data: IContextMessage) => {
        const ctx: Context = data.context;

        this.contextObservable = ctx.currentProject;
      });
  }

  getContextSignal() {
    const source: Signal<IContextMessage> = this.luigiContextService.contextSignal();
    const data: IContextMessage = source();
    const ctx: Context = data.context;

    this.contextSignal = ctx.currentProject;
  }

  ngOnDestroy() {
    removeInitListener(this.initListener);
  }
}
