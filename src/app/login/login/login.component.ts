import { Component } from '@angular/core';
import {
    Router
} from '@angular/router';
import { AuthService } from '../../auth.service';
import { Credentials } from './Credentials';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    error: string;
    credentials: Credentials;
    loading = false;

    constructor(public authService: AuthService, public router: Router) {
        this.credentials = new Credentials();
    }

    login() {
        this.loading = true;
        this.authService.login(this.credentials.username, this.credentials.password)
            .subscribe(result => {
                this.loading = false;
                if (result === true) {
                        this.router.navigate(['/admin/dashboard']);
                } else {
                    this.error = 'Username or password is incorrect';
                }
            }, (err: HttpErrorResponse) => {
                this.loading = false;
                if (err != null && err.error != null && err.error.error_description != null) {
                    this.error = err.error.error_description;
                } else {
                    this.error = 'You could not be logged in at this time. Please try again or contact your system administrator';
                }
            });
    }
}
