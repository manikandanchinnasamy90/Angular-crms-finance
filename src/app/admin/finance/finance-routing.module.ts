import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/auth-guard.service';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { CorporateStatementComponent } from './corporate-statement/corporate-statement.component';
import { CorporateMultiPaymentExcelComponent } from './corporate-multi-payment-excel/corporate-multi-payment-excel.component';
import { CorporateTransferComponent} from './corporate-transfer/corporate-transfer.component';
import { AddCorpPlusComponent } from './add-beneficiary/add-beneficiary.component';
import { Scopes } from 'src/app/scopes.enum';
import { ViewCorpPlusListComponent } from './view-beneficiaries/view-beneficiaries.component';

const routes: Routes = [
  {
    path: 'accounts',
    component: FinanceDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      scope: Scopes.FinanceReference
    }
  },
  {
    path: 'corp-multi-payment-excel',
    component: CorporateMultiPaymentExcelComponent,
    canActivate: [AuthGuard],
    data: {
      scope: [Scopes.FinanceReference, Scopes.CorporateMultipleOnceOffPayment]
    }
  },
  {
    path: 'accounts/corp-statement/:accountNumber',
    component: CorporateStatementComponent,
    canActivate: [AuthGuard],
    data: {
      scope: [Scopes.FinanceReference, Scopes.CorporateViewStatement]
    }
  },
  {
    path: 'transfer/inter-account',
    component: CorporateTransferComponent,
    canActivate: [AuthGuard],
    data: {
      scope: [Scopes.FinanceReference, Scopes.CorporateOnceOffPayment]
    }
  },
  {
    path: 'add-corp-plus-account',
    component: AddCorpPlusComponent,
    canActivate: [AuthGuard],
    data: {
      scope: [Scopes.FinanceReference, Scopes.AddFinanceBeneficiary]
    }
  },
  {
    path: 'corp-plus-accounts',
    component: ViewCorpPlusListComponent,
    canActivate: [AuthGuard],
    data: {
      scope: Scopes.FinanceReference
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
