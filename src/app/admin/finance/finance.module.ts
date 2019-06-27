import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinanceRoutingModule } from './finance-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { DisplayHelpersModule } from '../display-helpers/display-helpers.module';
import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { CorporateStatementComponent } from './corporate-statement/corporate-statement.component';
import { CorporateMultiPaymentExcelComponent } from './corporate-multi-payment-excel/corporate-multi-payment-excel.component';
import { NgbModalModule, NgbProgressbarModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { CorporateTransferComponent, CorporateTransferBaseComponent } from './corporate-transfer/corporate-transfer.component';
import { AddBeneficiaryComponent, AddCorpPlusComponent } from './add-beneficiary/add-beneficiary.component';
import { ViewBeneficiariesListComponent, ViewCorpPlusListComponent } from './view-beneficiaries/view-beneficiaries.component';

@NgModule({
  imports: [
    CommonModule,
    FinanceRoutingModule,
    FormsModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgbAlertModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule,
    DisplayHelpersModule
  ],
  declarations: [
    FinanceDashboardComponent,
    CorporateStatementComponent,
    CorporateMultiPaymentExcelComponent,
    CorporateTransferComponent,
    CorporateTransferBaseComponent,
    AddBeneficiaryComponent,
    ViewBeneficiariesListComponent,
    ViewCorpPlusListComponent,
    AddCorpPlusComponent
  ]
})
export class FinanceModule {
}
