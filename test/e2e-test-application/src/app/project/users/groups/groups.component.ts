import { Component, OnInit } from '@angular/core';
import { linkManager } from '@luigi-project/client';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
  standalone: false
})
export class GroupsComponent {
  public linkManager = linkManager;
  public customValue = 'avengers';
  public groupLinks: any[] = [
    {
      link: 'stakeholders',
      text: 'stakeholders',
      description: 'a dynamic node'
    },
    {
      link: 'customers',
      text: 'customers',
      description: 'a dynamic node'
    }
  ];
}
