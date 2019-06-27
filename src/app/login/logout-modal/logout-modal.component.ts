import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CookieManagementService } from 'src/app/cookie-management.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss']
})
export class LogoutModalComponent implements OnInit {

  public timeRemaining = 0;
  public loading = false;
  private interval;
  constructor(
    public modal: NgbActiveModal,
    private cookieService: CookieManagementService,
    public router: Router,
  ) { }

  ngOnInit() {

    const expiryDate = this.cookieService.tokenExpiryTime;
    if (Number.isNaN(expiryDate)) {
      return;
    }
    const refreshExpiry = expiryDate + 60000 * environment.refreshTokenExpiry;
    const timeToExpiry = refreshExpiry - Date.now();
    this.timeRemaining = Math.floor(timeToExpiry / 1000);
    this.interval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        clearInterval(this.interval);
        this.logout();
      }
    }, 1000);
  }

  logout() {
    this.modal.dismiss();
    clearInterval(this.interval);
    this.cookieService.clearCookie();
    this.router.navigate(['/login']);
  }

  refreshToken() {
    this.loading = true;
    clearInterval(this.interval);
    this.cookieService.refreshAuthToken(true).subscribe((success) => {
      this.loading = false;
      if (!success) {
        this.logout();
      }
      this.modal.close();
    });

  }
}
