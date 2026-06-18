import { Component, OnInit, OnDestroy, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { linkManager } from '@luigi-project/client';
import { Subscription } from 'rxjs';

/**
 * This component is using Angular router to navigate between routes
 */

@Component({
  selector: 'app-nav-sync',
  templateUrl: './nav-sync.component.html',
  styleUrls: ['./nav-sync.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class NavSyncComponent implements OnInit, OnDestroy {
  segments: String[] = ['one', 'two', 'three', 'four'];
  currentSegment = signal<string>('');
  nextSegment: String;
  subs: Subscription = new Subscription();
  linkManager = linkManager;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.subs.add(
      this.route.url.subscribe(
        (segments) => {
          let segment;
          if (segments.length === 1 && this.router.routerState?.snapshot) {
            segment = this.router.routerState.snapshot.url;
          } else {
            segment = segments[segments.length - 1].path;
          }
          this.currentSegment.set(segment);
          const nextIndex = this.segments.indexOf(this.currentSegment()) + 1;
          this.nextSegment = this.segments[nextIndex] ? this.segments[nextIndex] : this.segments[0];
        },
        (err) => {}
      )
    );
    this.updateLuigiConfig(true);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.updateLuigiConfig(false);
  }

  private updateLuigiConfig(value: boolean) {
    if (!(window.parent as any)?.Luigi) {
      return;
    }

    (window.parent as any).Luigi.config.routing.showModalPathInUrl = value;
  }
}
