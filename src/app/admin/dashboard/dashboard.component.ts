import { Component, OnInit } from '@angular/core';
import { Scopes } from 'src/app/scopes.enum';

/**
* @description Main entry component for site
*/
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public scopes = Scopes;
  constructor() { }

  ngOnInit() {
  }

}
