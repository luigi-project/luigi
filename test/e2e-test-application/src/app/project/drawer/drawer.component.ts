import { Component } from '@angular/core';
import { linkManager, uxManager } from '@luigi-project/client/esm';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  standalone: false
})
export class DrawerComponent {
  public linkManager = linkManager;
  public uxManager = uxManager;
  public constructor() {}

  openConfirmationModal() {
    uxManager()
      .showConfirmationModal({ body: 'Just a confirmation modal' })
      .then(() => console.log('opended a confirmation modal'))
      .catch(() => console.log('rejected a confirmation modal'));
  }
}
