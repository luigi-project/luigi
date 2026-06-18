import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class NavigationComponent implements OnInit {
  constructor() {}
  @Input() topNavConfig;
  @Input() leftNavConfig;

  ngOnInit() {}

  handleClick(route) {
    parent.window.location.hash = route;
  }
}
