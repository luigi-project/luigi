import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-code-snippet',
    templateUrl: './code-snippet.component.html',
    styleUrls: ['./code-snippet.component.scss'],
    standalone: false
})
export class CodeSnippetComponent {
  @Input() public data: string;
}
