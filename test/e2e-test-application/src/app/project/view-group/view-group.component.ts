import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-group',
  templateUrl: './view-group.component.html',
  styleUrls: ['./view-group.component.css'],
  standalone: false
})
export class ViewGroupComponent implements OnInit {
  vg: string;
  id: string;
  code: string;
  config: string;
  time: string;
  window: Window;

  constructor(
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.window = this.document.defaultView;
  }

  ngOnInit() {
    let iframes = Array.from(this.window.parent.document.querySelectorAll('iframe'));
    if (!iframes || !iframes[0] || !iframes[0]['luigi']) {
      return;
    }

    console.log('this.window.parent.Luigi --> ', this.window.parent['Luigi'].config);

    this.config = JSON.stringify(
      {
        viewGroupSettings: this.window.parent['Luigi'].config.navigation.viewGroupSettings,
        preloadViewGroups: this.window.parent['Luigi'].config.navigation.preloadViewGroups
      },
      null,
      3
    );

    this.route.paramMap.subscribe((queryParams) => {
      this.vg = queryParams.get('vg');
      this.time = new Date().toJSON();

      let iframes = Array.from(this.window.parent.document.querySelectorAll('iframe')).map(this.transformIframes);

      this.code = JSON.stringify(iframes, null, 3);
      let currentIFrame = iframes.find(
        (iframe) =>
          !!iframe.currentNode && !!iframe.currentNode.pathSegment && iframe.currentNode.pathSegment === this.vg
      );

      if (!!currentIFrame) {
        this.id = currentIFrame['id'];
      }
    });
  }

  transformIframes(iframe) {
    let luigiMf = iframe['luigi'];
    const clonedLuigiMf = Object.assign({}, luigiMf);
    clonedLuigiMf.currentNode = Object.assign({}, luigiMf.currentNode);
    delete clonedLuigiMf.currentNode.parent;
    clonedLuigiMf.currentNode.children = ['...children removed'];
    return clonedLuigiMf;
  }
}
