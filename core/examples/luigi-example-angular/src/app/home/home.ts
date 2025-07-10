import { Component, OnInit, signal } from '@angular/core';
import { addInitListener, addContextUpdateListener } from '@luigi-project/client';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <div>
      <section class="fd-section">
        <div class="fd-section__header">
          <h1 class="fd-section__title">Home</h1>
        </div>
        <div class="fd-panel">
          <div class="fd-panel__body">
            {{ message() }}
          </div>
        </div>
      </section>
    </div>
  `,
  styles: ``
})
export class Home implements OnInit {
  public message = signal('');

  ngOnInit() {
    addInitListener((initialContext) => {
      this.message.set('Luigi Client initialized');
      console.log(initialContext);
    });
    addContextUpdateListener((updatedContext) => {
      this.message.set('Luigi Client updated');
      console.log(updatedContext);
    });
  }
}
