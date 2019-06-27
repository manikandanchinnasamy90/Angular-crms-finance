import { Component } from '@angular/core';
import { SideBarService } from './side-bar.service';
import { AuthService } from '../auth.service';
import { Scopes } from '../scopes.enum';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent {
  public scopes = Scopes;
  constructor(
    public authService: AuthService,
    public sideBarService: SideBarService) { }

}
