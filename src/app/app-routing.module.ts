import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard.service';

const routes: Routes = [{
  path: 'admin',
  pathMatch: 'prefix',
  loadChildren: './admin/admin.module#AdminModule',
  canLoad: [AuthGuard]
},
{
  path: '',
  loadChildren: './login/login.module#LoginModule'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
