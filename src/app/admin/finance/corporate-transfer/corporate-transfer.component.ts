import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CorporatePlusMultipleOnceOffPaymentResponse,
  ServiceResponse,
  FinanceApiService,
  CorporatePlusMultipleOnceOffPaymentsRequest,
  CorporatePlusMultipleOnceOffPaymentsItem,
  NotificationTypeEnum
} from '../../resources/bank-api/bank-api.module';
import { ApiFormBaseComponent, FormPropertiesService } from '../../display-helpers/display-helpers.module';
import { FormGroup, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import {
  FinanceBeneficiary,
  GetFinanceBeneficiaryResponse,
} from '../../resources/reference-api/reference-api.module';
import { CorporateTransferList } from '../models/corporate-transfer-list';
import { BeneficiaryTransferList } from '../models/beneficiary-transfer-list';
import { CorporateTransfer } from '../models/corporate-transfer';
import { BeneficiaryTransfer } from '../models/beneficiary-transfer';

@Component({
  selector: 'app-corporate-transfer-base',
  templateUrl: '../../display-helpers/components/api-form-base/api-form-base.component.html',
  styleUrls: ['./corporate-transfer.component.scss']
})
export class CorporateTransferBaseComponent
  extends ApiFormBaseComponent<CorporateTransferList, CorporatePlusMultipleOnceOffPaymentResponse> implements OnDestroy, OnInit {
  private _changeSubscriber: Subscription;
  private _itemChangeSubscribers: Subscription[] = [];
  private _corporatePlusAccounts: GetFinanceBeneficiaryResponse;

  public get isInterAccountTransfer() {
    return false;
  }
  /**
     * @description Constructor. Set the model and title
     * @param _formPropertiesService Injected service
     * @param financeApiService Injected service
     * @param accountService Injected service
     */
  constructor(
    formPropertiesService2: FormPropertiesService,
    private financeApiService: FinanceApiService,
    private referenceApiService: ReferenceDataService) {
    super(formPropertiesService2)/* Workaround for code coverage bug *//* istanbul ignore next */;

    if (this.isInterAccountTransfer) {
      this.title = 'Inter-account transfer';
      this.buttonText = 'Process transfers';
      this.model = new CorporateTransferList();
      this.model.transfers.push(new CorporateTransfer());
    } else {
      this.title = 'Beneficiary payment';
      this.buttonText = 'Process payments';
      this.model = new BeneficiaryTransferList();
      this.model.transfers.push(new BeneficiaryTransfer());
    }
  }

  public async ngOnInit() {
    super.ngOnInit();

    this._corporatePlusAccounts = await this.referenceApiService.getAll<GetFinanceBeneficiaryResponse>({
      endpoint: 'getFinanceBeneficiary/all',
      type: GetFinanceBeneficiaryResponse,
    });

    let numberOfItems = 0;

    this._changeSubscriber = this.modelChanges.subscribe(model => {
      if (numberOfItems === model.transfers.length) {
        return;
      }
      this._itemChangeSubscribers.forEach(s => s.unsubscribe());

      const transfers = ((this.form.controls.form as FormGroup).controls.transfers as FormArray).controls;
      numberOfItems = transfers.length;
      transfers.forEach((fg: FormGroup) => {

        let previousModel = fg.value;

        let lastSetFromReference = previousModel.fromReference;
        if (lastSetFromReference === undefined) {
          lastSetFromReference = null;
        }
        let lastSetToReference = previousModel.toReference;
        if (lastSetToReference === undefined) {
          lastSetToReference = null;
        }

        this._itemChangeSubscribers.push(fg.valueChanges.subscribe((itemModel) => {
          const previousModelCache = previousModel;
          previousModel = itemModel;

          if (
            itemModel.toAccount != null
            && itemModel.toAccount !== previousModelCache.toAccount
            && itemModel.toReference === lastSetToReference
          ) {
            const toAccount = this.getAccountDetails(itemModel.toAccount);
            const newReference = toAccount != null ? toAccount.toReference : null;
            lastSetToReference = newReference;
            fg.controls.toReference.setValue(newReference);
          }

          if (
            itemModel.toAccount != null
            && itemModel.toAccount !== previousModelCache.toAccount
            && itemModel.fromReference === lastSetFromReference
          ) {
            const toAccount = this.getAccountDetails(itemModel.toAccount);
            const newReference = toAccount != null ? toAccount.fromReference : null;
            lastSetFromReference = newReference;
            fg.controls.fromReference.setValue(newReference);
          }
        }));
      });
    });
  }

  public ngOnDestroy(): void {
    if (this._changeSubscriber != null) {
      this._changeSubscriber.unsubscribe();
    }

    this._itemChangeSubscribers.forEach(s => s.unsubscribe());
  }

  /**
   * @description Overridden method of base class that posts the form to the API service .
   */
  public async callService(): Promise<ServiceResponse<CorporatePlusMultipleOnceOffPaymentResponse>> {
    const request = new CorporatePlusMultipleOnceOffPaymentsRequest();

    let error = false;
    this.model.transfers.forEach((transferItem) => {
      const itemRequest = new CorporatePlusMultipleOnceOffPaymentsItem();
      itemRequest.amount = transferItem.amount;
      itemRequest.fromReference = transferItem.fromReference;
      itemRequest.toReference = transferItem.toReference;
      itemRequest.fromAccount = transferItem.fromAccount;
      itemRequest.notificationType = transferItem.notificationType != null ? transferItem.notificationType : NotificationTypeEnum.None;

      const toAccount = this.getAccountDetails(transferItem.toAccount);
      if (toAccount == null) {
        console.error('Could not find account with number ' + transferItem.toAccount);
        error = true;
        return;
      }
      itemRequest.toAccountNumber = toAccount.accountNumber;
      itemRequest.toAccountTypeCode = toAccount.accountTypeCode;
      itemRequest.toBankCode = toAccount.bankCode;
      itemRequest.toBranchCode = toAccount.branchCode.toString();

      if (itemRequest.fromReference == null && this.isInterAccountTransfer) {
        let message = `To ${itemRequest.toAccountNumber}`;
        if (message.length > 20) {
          message = message.slice(0, 20);
        }

        itemRequest.fromReference = message;
      }

      request.listOfPayments.push(itemRequest);
    });

    if (error) {
      return;
    }
    return await this.financeApiService.corporatePlusMultiPayments(request);
  }

  private getAccountDetails(accountNumber: string): FinanceBeneficiary | null {

    const matches = this._corporatePlusAccounts.financeBeneficiariesDAOList.filter(c => c.accountNumber === accountNumber);
    if (matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
  }
}

@Component({
  selector: 'app-corporate-transfer',
  templateUrl: '../../display-helpers/components/api-form-base/api-form-base.component.html',
  styleUrls: ['./corporate-transfer.component.scss']
})
export class CorporateTransferComponent extends CorporateTransferBaseComponent {
  public get isInterAccountTransfer() {
    return true;
  }
}
