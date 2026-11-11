import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-usersoverview',
  templateUrl: './usersoverview.component.html',
  styleUrls: ['./usersoverview.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class UsersoverviewComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
