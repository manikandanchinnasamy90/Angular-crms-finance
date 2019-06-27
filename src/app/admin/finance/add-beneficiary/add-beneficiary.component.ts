import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiFormBaseComponent, FormPropertiesService } from '../../display-helpers/display-helpers.module';
import {
  ServiceResponse,
  FinanceApiService,
  AddFinanceBeneficiaryRequest,
  Result
} from '../../resources/bank-api/bank-api.module';
import { Subscription } from 'rxjs';
import { GetBankCodesResponse, FinanceAccountTypeEnum } from '../../resources/reference-api/reference-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { ApiConstants } from '../../api-constants';

/**
 * @description Add beneficiary for use within finance module
 */
@Component({
  selector: 'app-add-beneficiary',
  templateUrl: '../../display-helpers/components/api-form-base/api-form-base.component.html',
  styleUrls: ['./add-beneficiary.component.scss']
})
export class AddBeneficiaryComponent
  extends ApiFormBaseComponent<AddFinanceBeneficiaryRequest, Result> implements OnInit, OnDestroy {

  private _changeSubscriber: Subscription;

  /**
   * @description Constructor. Set model to a new instance and set title.
   * @param formPropertiesService2 Injected service
   * @param financeApi Injected service
   * @param referenceApiService Injected service
   */
  constructor(
    private formPropertiesService2: FormPropertiesService,
    private financeApi: FinanceApiService,
    private referenceApiService: ReferenceDataService) {
    super(formPropertiesService2);
    this.model = new AddFinanceBeneficiaryRequest();
    this.title = 'Add finance beneficiary';
  }

  /**
   * @description Overridden method from base class that calls the API when the form submits
   */
  public async callService(): Promise<ServiceResponse<Result>> {

    if (this.model.accountType == null) {
      if (this.model.bankCode === ApiConstants.sasfinBankCode) {
        this.model.accountType = FinanceAccountTypeEnum.Internal;
      } else {
        this.model.accountType = FinanceAccountTypeEnum.External;
      }
    }
    return this.financeApi.addFinanceBeneficiary(this.model);
  }

  public async ngOnInit() {
    super.ngOnInit();

    const bankCodes = await this.referenceApiService.getAll<GetBankCodesResponse>({
      endpoint: 'bankCodes',
      type: GetBankCodesResponse,
    });

    let previousModel: AddFinanceBeneficiaryRequest = this.model;
    const branchCodeField = this.formPropertiesService2.getFormOptionsForField(this, 'branchCode');

    this._changeSubscriber = this.modelChanges.subscribe(model => {
      if (previousModel.bankCode !== model.bankCode) {
        const bank = bankCodes.data.bankCodes.filter(c => c.bankCode === model.bankCode);
        if (bank.length > 0) {
          previousModel = model;
          setTimeout(() => {
            branchCodeField.formControl.setValue(bank[0].universalBranchCode);
          });
        }
      }
      previousModel = model;
    });
  }

  public ngOnDestroy(): void {
    if (this._changeSubscriber != null) {
      this._changeSubscriber.unsubscribe();
    }
  }
}

/**
 * @description Add beneficiary for use within finance module
 */
@Component({
  selector: 'app-add-corp-plus',
  templateUrl: '../../display-helpers/components/api-form-base/api-form-base.component.html',
  styleUrls: ['./add-beneficiary.component.scss']
})
export class AddCorpPlusComponent extends AddBeneficiaryComponent implements OnInit {

  public async ngOnInit() {
    await super.ngOnInit();
    this.model.accountType = FinanceAccountTypeEnum.CorpPlus;
    this.title = 'Add corporate plus account';
  }
}
