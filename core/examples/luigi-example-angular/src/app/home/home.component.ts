import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { addInitListener, addContextUpdateListener } from '@luigi-project/client';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false
})
export class HomeComponent implements OnInit {
  public message: string;

  constructor(private ref: ChangeDetectorRef) {}

  ngOnInit() {
    addInitListener((initialContext) => {
      this.message = 'Luigi Client initialized.';
      console.log(initialContext);
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
    addContextUpdateListener((updatedContext) => {
      this.message = 'Luigi Client updated.';
      console.log(updatedContext);
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
  }
}
