import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './child-node-1.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ChildNode1Component implements OnInit {
  constructor() {}

  ngOnInit() {}
}
