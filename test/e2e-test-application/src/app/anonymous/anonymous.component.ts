import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-anonymous',
    templateUrl: './anonymous.component.html',
    styleUrls: ['./anonymous.component.css'],
    standalone: false
})
export class AnonymousComponent implements OnInit {
  exclusive: false;

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe(
      params => {
        this.exclusive = params.exclusive;
      },
      err => {}
    );
  }

  ngOnInit() {}
}
