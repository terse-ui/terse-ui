import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'ex-root',
  template: `<h1>Welcome examples</h1>
    <router-outlet></router-outlet>`,
  styles: ``,
})
export class App {}
