import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { getPathParams, linkManager } from '@luigi-project/client';

import { LuigiContextService } from '@luigi-project/client-support-angular';
import { Subscription } from 'rxjs';
import { toTitleCase } from '../../../../../services/helpers';

@Component({
    selector: 'app-group-settings',
    templateUrl: './group-settings.component.html',
    styleUrls: ['./group-settings.component.css'],
    standalone: false
})
export class GroupSettingsComponent implements OnInit, OnDestroy {
  public linkManager = linkManager;
  public pathParams: { [key: string]: string };
  public groupLabel: string;
  private lcSubscription: Subscription;

  constructor(private luigiService: LuigiContextService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.lcSubscription = this.luigiService.contextObservable().subscribe(ctx => {
      this.pathParams = getPathParams();
      this.groupLabel = this.pathParams && this.pathParams.group && toTitleCase(this.pathParams.group);
      if (!this.cdr['destroyed']) {
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.lcSubscription) {
      this.lcSubscription.unsubscribe();
    }
  }
}
