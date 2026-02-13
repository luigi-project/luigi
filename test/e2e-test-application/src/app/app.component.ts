import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { addInactiveListener, sendCustomMessage } from '@luigi-project/client/esm';
import { LuigiContextService } from '@luigi-project/client-support-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class AppComponent implements OnInit {
  public title = 'app';

  constructor(private luigiService: LuigiContextService) {}

  ngOnInit() {
    this.luigiService.contextObservable().subscribe((ctxObj) => {
      if (ctxObj.contextType === 0) {
        sendCustomMessage({ id: 'my-micro-frontend-is-ready' });
      }
    });

    addInactiveListener(() => {
      console.debug('inactiveListener: micro frontend is now in the background');
    });
  }
}
