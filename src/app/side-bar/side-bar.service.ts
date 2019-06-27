import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideBarService {

  public isCollapsed = false;

  constructor() { }
}
