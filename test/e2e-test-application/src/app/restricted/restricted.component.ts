import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-restricted',
  templateUrl: './restricted.component.html',
  styleUrls: ['./restricted.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RestrictedComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
