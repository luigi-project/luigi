import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { getPathParams, getNodeParams, linkManager, PathParams, NodeParams } from '@luigi-project/client';
import { LuigiContextService, IContextMessage } from '@luigi-project/client-support-angular';
import { toTitleCase } from '../../services/helpers';

@Component({
    selector: 'app-dynamic',
    templateUrl: './dynamic.component.html',
    styleUrls: ['./dynamic.component.css'],
    standalone: false
})
export class DynamicComponent implements OnInit, OnDestroy {
  public linkManager = linkManager;
  public pathParams: PathParams;
  public nodeLabel: string;
  public links: string[];
  public hasBack: boolean;
  public nodeParams: NodeParams = null;
  public callbackValue = 'default value';

  // routing playground
  public routeUrl: string;
  public mfBasePath = '';
  public showRouting = false;

  private lcSubscription: Subscription = new Subscription();

  constructor(private luigiService: LuigiContextService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.lcSubscription.add(
      this.luigiService.contextObservable().subscribe((ctx: IContextMessage) => {
        if (!ctx.context) {
          console.warn(
            `To use this component properly, node configuration requires context.label to be defined.
            context.links can be defined as array of strings to generate links to children`
          );
          return;
        }
        const lastPathParam = Object.values(getPathParams() || {}).pop();

        // We can directly access our specified context values here
        this.nodeLabel = toTitleCase(ctx.context.label || lastPathParam || 'hello');
        this.links = ctx.context.links;

        // preserveView and node params
        this.hasBack = linkManager().hasBack();
        this.nodeParams = Object.keys(getNodeParams()).length > 0 ? getNodeParams() : null;

        if (!this.cdr['destroyed']) {
          this.cdr.detectChanges();
        }
      })
    );
  }
  ngOnDestroy() {
    this.lcSubscription.unsubscribe();
  }

  public slugify(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .join('-');
  }

  public goBack() {
    // going back with some sample callback context,
    // that will be handed over to previous view
    linkManager().goBack(this.callbackValue);
  }
}
