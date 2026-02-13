import { Component, OnInit, signal } from '@angular/core';
import { uxManager, addInitListener, addContextUpdateListener } from '@luigi-project/client/esm';

@Component({
  selector: 'app-miscellaneous2',
  templateUrl: './miscellaneous2.component.html',
  styleUrls: ['./miscellaneous2.component.css'],
  standalone: false
})
export class Miscellaneous2Component implements OnInit {
  consoleText = signal<string>('InitListener called');

  ngOnInit() {
    addInitListener((context) => {
      this.consoleText.set('InitListener called');
    });
    addContextUpdateListener((context) => {
      this.consoleText.set('ContextUpdateListener called');
    });
  }

  openConfirmationModal() {
    uxManager()
      .showConfirmationModal({ body: 'Just a confirmation modal' })
      .then(() => console.log('opended a confirmation modal'))
      .catch(() => console.log('rejected a confirmation modal'));
  }
}
