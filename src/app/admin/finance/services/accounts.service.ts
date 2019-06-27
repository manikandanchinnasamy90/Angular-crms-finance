import { Injectable } from '@angular/core';
import { ServiceResponse, Result } from '../../resources/bank-api/bank-api.module';
import {
  GetFinanceBeneficiaryResponse,
  GetFinanceBeneficiaryBalanceResponse,
} from '../../resources/reference-api/reference-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { CorporatePlusAccountsList } from '../models/corporarte-plus-account-list';
import { HttpErrorResponse } from '@angular/common/http';
import { CorporatePlusAccount } from '../models/corporate-plus-account';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private _accountsCache: ServiceResponse<CorporatePlusAccountsList> = null;
  constructor(private referenceDataService: ReferenceDataService) { }

  public async getCorporatePlusAccounts(force: boolean = false): Promise<ServiceResponse<CorporatePlusAccountsList>> {
    if (force === true || this._accountsCache == null || this._accountsCache.success === false) {

      const accounts = await this.referenceDataService.getAll<GetFinanceBeneficiaryResponse>({
        endpoint: 'getFinanceBeneficiary/all',
        type: GetFinanceBeneficiaryResponse,
      });

      const balances = await this.referenceDataService.getAll<GetFinanceBeneficiaryBalanceResponse>({
        endpoint: 'getFinanceBeneficiaryBalance',
        type: GetFinanceBeneficiaryBalanceResponse,
        skipCache: true
      });

      const data = new CorporatePlusAccountsList();

      if (balances != null) {
        const accountsList = balances.financeBeneficiariesList
          .map(balance => {
            const item = new CorporatePlusAccount();
            item.number = balance.accountNumber;
            item.balance = balance.balance;
            if (accounts != null) {
              const account = accounts.financeBeneficiariesDAOList.filter(c => c.accountNumber === balance.accountNumber);
              item.name = account.length > 0 ? account[0].accountName : 'Unknown account';
            }
            return item;
          });

        data.data = accountsList;
        data.result = new Result();
        data.result.fromServerObject(balances.result as any);
      }

      const result: ServiceResponse<CorporatePlusAccountsList> = {
        success: balances != null && balances.result.responseCode === '0',
        error: (balances == null || balances.result.responseCode !== '0')
          ? new HttpErrorResponse({ statusText: 'An error occurred getting accounts' })
          : null,
        data: data
      };

      this._accountsCache = result;
    }

    return this._accountsCache;
  }
}
