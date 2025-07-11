import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Sample1 } from './sample1/sample1';
import { Sample2 } from './sample2/sample2';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'sample1', component: Sample1 },
  { path: 'sample2', component: Sample2 }
];
