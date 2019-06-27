import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiDisplayBaseComponent, IActionOptions } from '../../display-helpers/display-helpers.module';
import {
  ServiceResponse,
  AddFinanceBeneficiaryRequest,
  FinanceApiService,
  DeleteFinanceBeneficiaryRequest,
  Result
} from '../../resources/bank-api/bank-api.module';
import { FinanceBeneficiaryList } from '../models/finance-beneficiary-list';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import {
  GetFinanceBeneficiaryResponse,
  FinanceBeneficiary,
  FinanceAccountTypeEnum
} from '../../resources/reference-api/reference-api.module';
import { Scopes } from 'src/app/scopes.enum';
import { CorpPlusAccountList } from '../models/corp-plus-account-list';

/**
 * @description Component used to view finance beneficiaries
 */
@Component({
  selector: 'app-view-beneficiaries',
  templateUrl: '../../display-helpers/components/api-display-base/api-display-base.component.html',
  styleUrls: ['./view-beneficiaries.component.scss']
})
export class ViewBeneficiariesListComponent<T extends FinanceBeneficiaryList> extends ApiDisplayBaseComponent<T> {

  /**
   * @description indicates whether the data is being reloaded on simply loading as part of init
   */
  private _reloading = false;

  /**
  * @description Overridden method from the base class that gets the current user ID
  */
  public get modelId(): string {
    return '';
  }

  /**
   * @description create a new model to display (override to change display)
   */
  public get newModel(): T {
    return new FinanceBeneficiaryList() as T;
  }

  /**
   * @description Constructor. Set title.
   * @param router Injected service
   * @param activatedRouter Injected service
   * @param accountsService Injected service
   */
  constructor(
    routerService: Router,
    activateRouteService: ActivatedRoute,
    private referenceDataService: ReferenceDataService,
    private financeApiService: FinanceApiService) {
    super(routerService, activateRouteService);
    this.title = 'Corporate plus accounts';
  }

  /**
   * @description Overridden method from base class that gets the user from the API
   * @param modelId The user id to get
   */
  public async callService(_modelId: string): Promise<ServiceResponse<T>> {
    const beneficiaries = await this.referenceDataService.getAll<GetFinanceBeneficiaryResponse>({
      endpoint: 'getFinanceBeneficiary/all',
      type: GetFinanceBeneficiaryResponse,
      skipCache: this._reloading
    });

    let resultList: T = null;
    if (beneficiaries != null) {
      resultList = this.newModel;
      resultList.fromServerObject(beneficiaries as any);
    }

    if (resultList != null) {
      resultList.financeBeneficiariesDAOList = resultList.financeBeneficiariesDAOList.filter(this.filterBeneficiaries);
    }

    const result: ServiceResponse<T> = {
      success: beneficiaries != null,
      error: beneficiaries === null ? new HttpErrorResponse({ statusText: 'Could not load beneficiaries from reference data API' }) : null,
      data: resultList as T
    };
    return result;
  }
  /**
   * @description Filter to apply on list of beneficiaries
   */
  public filterBeneficiaries = (b: FinanceBeneficiary) => {
    return b.accountType === FinanceAccountTypeEnum.External || b.accountType === FinanceAccountTypeEnum.Internal;
  }

  /**
   * @description overridden reload method. Make sure to force a reload when refreshing
   */
  public refresh() {
    this._reloading = true;
    super.refresh();
    this._reloading = false;
  }

  /**
 * @description The navigation options passed to the view class components dictating how to view the details of a user
 */
  public get actionOptions(): IActionOptions[] {
    return [
      {
        navigationObject: AddFinanceBeneficiaryRequest,
        handler: async (beneficiary: AddFinanceBeneficiaryRequest): Promise<boolean | string> => {
          let result: ServiceResponse<Result>;

          const deleteRequest = new DeleteFinanceBeneficiaryRequest();
          deleteRequest.accountNumber = beneficiary.accountNumber;
          result =
            await this.financeApiService
              .deleteFinanceBeneficiary(deleteRequest);

          if (result.success) {
            return true;
          }

          return result.error.message;
        },
        buttonText: 'Delete beneficiary',
        buttonClass: 'btn-danger',
        scope: Scopes.DeleteFinanceBeneficiary,
      },
    ];
  }
}


/**
 * @description Component used to view finance beneficiaries
 */
@Component({
  selector: 'app-view-corp-plus-accounts',
  templateUrl: '../../display-helpers/components/api-display-base/api-display-base.component.html',
  styleUrls: ['./view-beneficiaries.component.scss']
})
export class ViewCorpPlusListComponent extends ViewBeneficiariesListComponent<CorpPlusAccountList> {
  /**
    * @description Filter to apply on list of beneficiaries
    */
  public filterBeneficiaries = (b: FinanceBeneficiary) => {
    return b.accountType === FinanceAccountTypeEnum.CorpPlus;
  }

  /**
   * @description create a new model to display (override to change display)
   */
  public get newModel(): CorpPlusAccountList {
    return new CorpPlusAccountList();
  }
}
