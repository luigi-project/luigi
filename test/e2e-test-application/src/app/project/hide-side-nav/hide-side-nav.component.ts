import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hide-side-nav',
  templateUrl: './hide-side-nav.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class HideSideNavComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
