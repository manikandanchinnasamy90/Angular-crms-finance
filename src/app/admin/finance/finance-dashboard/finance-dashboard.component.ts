import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiDisplayBaseComponent, IActionOptions } from '../../display-helpers/display-helpers.module';
import { ServiceResponse } from '../../resources/bank-api/bank-api.module';
import { AccountsService } from '../services/accounts.service';
import { CorporatePlusAccountsList } from '../models/corporarte-plus-account-list';
import { CorporatePlusAccount } from '../models/corporate-plus-account';
import { Scopes } from 'src/app/scopes.enum';

/**
 * @description Component used to view customer accounts. This does not call a API directly but instead uses a
 * cached version of accounts from the last get customer profile call
 */
@Component({
  selector: 'app-finance-dashboard',
  templateUrl: '../../display-helpers/components/api-display-base/api-display-base.component.html',
  styleUrls: ['./finance-dashboard.component.scss']
})
export class FinanceDashboardComponent extends ApiDisplayBaseComponent<CorporatePlusAccountsList> {

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
   * @description Constructor. Set title.
   * @param router Injected service
   * @param activatedRouter Injected service
   * @param accountsService Injected service
   */
  constructor(
    private routerService: Router,
    private activateRouteService: ActivatedRoute,
    private accountsService: AccountsService) {
    super(routerService, activateRouteService);
    this.title = 'Corporate plus accounts';
    this.informationMessage = 'Please note: account balances might take a few minutes to update after payments and transfers.';
  }

  /**
   * @description Overridden method from base class that gets the user from the API
   * @param modelId The user id to get
   */
  public async callService(_modelId: string): Promise<ServiceResponse<CorporatePlusAccountsList>> {
    return await this.accountsService.getCorporatePlusAccounts(this._reloading);
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
        navigationObject: CorporatePlusAccount,
        handler: (account: CorporatePlusAccount): void => {
          this.routerService.navigate(['corp-statement', account.number],
            {
              relativeTo: this.activateRouteService,
              queryParams: { pageNumber: '1', accountName: account.name }
            });
        },
        buttonText: 'View statement',
        scope: Scopes.CorporateViewStatement,
        buttonClass: 'btn-outline-primary'
      },
    ];
  }
}
