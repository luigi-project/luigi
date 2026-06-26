import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  templateUrl: './child-node-2.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ChildNode2Component implements OnInit {
  constructor() {}

  ngOnInit() {}
}
