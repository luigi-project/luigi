import { Component, ChangeDetectionStrategy } from '@angular/core';
import { linkManager } from '@luigi-project/client';

@Component({
  selector: 'app-on-node-activation',
  templateUrl: './onNodeActivation.component.html',
  styleUrls: ['./onNodeActivation.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class OnNodeActivationComponent {
  public linkManager = linkManager;
}
