import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { getPathParams, linkManager } from '@luigi-project/client';
import { LuigiContextService, IContextMessage } from '@luigi-project/client-support-angular';
import { toTitleCase } from '../../../../services/helpers';

@Component({
    selector: 'app-group-details',
    templateUrl: './group-details.component.html',
    styleUrls: ['./group-details.component.css'],
    standalone: false
})
export class GroupDetailsComponent implements OnInit, OnDestroy {
  public linkManager = linkManager;
  public pathParams: { [key: string]: string };
  public groupLabel: string;
  private lcSubscription: Subscription;
  public currentRoute: string;
  public currentRouteFromClosestContext: string;
  public currentRouteFromParent: string;

  constructor(private luigiService: LuigiContextService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.lcSubscription = this.luigiService.contextObservable().subscribe((ctx: IContextMessage) => {
      // We can directly access our custom specified context value here
      this.groupLabel = toTitleCase(ctx.context.currentGroup);

      // Default way, if context is not specified in node configuration
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

  getCurrentRoute() {
    linkManager()
      .fromContext('project')
      .getCurrentRoute()
      .then(route => {
        this.currentRoute = route;
      });
  }

  getCurrentRouteFromParent() {
    linkManager()
      .fromParent()
      .getCurrentRoute()
      .then(route => {
        this.currentRouteFromParent = route;
      });
  }

  getCurrentRouteFromClosestContext() {
    linkManager()
      .fromClosestContext()
      .getCurrentRoute()
      .then(route => {
        this.currentRouteFromClosestContext = route;
      });
  }
}
