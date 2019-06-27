import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from '../navbar/navbar.component';
import { AdminComponent } from './admin.component';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { BankApiModule } from './resources/bank-api/bank-api.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    NgbModule,
    BankApiModule,
    SharedModule
  ],
  declarations: [
    DashboardComponent,
    NavbarComponent,
    AdminComponent,
    SideBarComponent,
  ]
})
export class AdminModule {
}
