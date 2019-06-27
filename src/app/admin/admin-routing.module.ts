import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../auth-guard.service';
import { AdminComponent } from './admin.component';

const routes: Routes = [{
  path: '',
  component: AdminComponent,
  canActivate: [AuthGuard],
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent
    },
    {
      path: 'finance',
      loadChildren: './finance/finance.module#FinanceModule',
      canLoad: [AuthGuard]
    }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
