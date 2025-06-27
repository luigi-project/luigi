import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { addInitListener, removeInitListener } from '@luigi-project/client';
import { LuigiContextService } from '@luigi-project/client-support-angular';
@Component({
    selector: 'app-developers',
    templateUrl: './developers.component.html',
    styleUrls: ['./developers.component.css'],
    standalone: false
})
export class DevelopersComponent implements OnInit, OnDestroy {
  private initListener;
  contextAsync;
  visitors = 0;

  constructor(private cdr: ChangeDetectorRef, private luigiContextService: LuigiContextService) {}

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
    this.luigiContextService.getContextAsync().then(ctx => {
      this.contextAsync = ctx.currentProject;
    });
  }

  ngOnDestroy() {
    removeInitListener(this.initListener);
  }
}
