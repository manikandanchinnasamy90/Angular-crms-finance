import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SideBarService } from '../side-bar/side-bar.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

    public username: string;

    constructor(
        public authService: AuthService,
        public sideBarService: SideBarService) {
    }

    ngOnInit() {
        this.username = this.authService.loggedInUsername;
    }

}
