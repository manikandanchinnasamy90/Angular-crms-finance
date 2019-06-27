import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LogoutModalComponent } from './logout-modal/logout-modal.component';

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    RouterModule,
    NgbModule,
  ],
  declarations: [
    LoginComponent,
    LogoutModalComponent
  ],
  entryComponents: [
    LogoutModalComponent
  ]
})
export class LoginModule {
}
