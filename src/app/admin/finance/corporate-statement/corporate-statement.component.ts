import { Component, OnInit } from '@angular/core';
import {
  ServiceResponse,
  ViewStatementResponse,
  TransactionTypeEnum,
  FinanceApiService,
  GetViewCorporateStatementRequest,
  ClearedTransaction,
} from 'src/app/admin/resources/bank-api/bank-api.module';
import { FormPropertiesService, ApiSearchBaseComponent, CsvExportService } from 'src/app/admin/display-helpers/display-helpers.module';
import { QueryParametersService, RouteParametersService } from 'src/app/admin/shared/shared.module';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { CorporateStatementSearch } from '../models/corporate-statement-search';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { PropertyTypes } from '../../display-decorators/models/export-models';
import {
  FinanceBeneficiary,
  GetFinanceBeneficiaryResponse,
  FinanceAccountTypeEnum
} from '../../resources/reference-api/reference-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';

/**
 * @description View statement for a corporate plus account
 */
@Component({
  selector: 'app-corporate-statement',
  templateUrl: '../../display-helpers/components/api-search-base/api-search-base.component.html',
  styleUrls: ['./corporate-statement.component.scss'],
  providers: [DatePipe]
})
export class CorporateStatementComponent extends ApiSearchBaseComponent<CorporateStatementSearch, ViewStatementResponse> implements OnInit {
  private _cancel = false;

  /**
     * @description Constructor. Set model to a new instance and set title.
     * @param formPropertiesService Injected service
     * @param _csvExportService Injected service
     * @param queryParameterService2 Injected service
     * @param _router Injected service
     * @param _activatedRoute Injected service
     * @param financeApiService Injected service
     * @param routerParameterService Injected service
     * @param datePipe Injected service
     */
  constructor(
    formPropertiesService: FormPropertiesService,
    _csvExportService: CsvExportService,
    private queryParameterService2: QueryParametersService,
    _router: Router,
    _activatedRoute: ActivatedRoute,
    private financeApiService: FinanceApiService,
    private routerParameterService: RouteParametersService,
    datePipe: DatePipe,
    modalService: NgbModal,
    private referenceApiService: ReferenceDataService, ) {

    super(
      formPropertiesService,
      _csvExportService,
      queryParameterService2,
      _router, _activatedRoute,
      modalService
    )/* Workaround for code coverage bug *//* istanbul ignore next */;

    this.model = new CorporateStatementSearch();

    const currentDate = new Date(Date.now());
    const lastMonth = new Date(Date.now());
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    this.model.dateFrom = datePipe.transform(lastMonth, 'yyyyMMdd');
    this.model.dateTo = datePipe.transform(currentDate, 'yyyyMMdd');
    this.model.transactionType = TransactionTypeEnum.All;

    this.title = 'View corporate account statement';
    this.defaultPageNumber = 1;
    this.canDownload = true;

    this.fieldOptionsOverrides = [{
      key: 'account',
      path: 'account',
      type: PropertyTypes.searchSelect,
      valueType: typeof (''),
      getDataMethod: async (): Promise<FinanceBeneficiary[]> => {
        const accounts = await this.referenceApiService.getAll({
          endpoint: 'getFinanceBeneficiary/all',
          type: GetFinanceBeneficiaryResponse,
        });
        if (accounts == null) {
          return [];
        }
        return accounts.financeBeneficiariesDAOList.filter(c => c.accountType === FinanceAccountTypeEnum.CorpPlus);
      },
      templateOptions: {
        type: 'text',
        label: 'Account',
        placeholder: 'Account',
        valueProp: 'accountNumber',
        labelProp: 'accountName',
        required: true,
      },
    }];

  }

  public ngOnInit() {
    super.ngOnInit();
    this.model.account = this.routerParameterService.getRouteParameter('accountNumber');
  }

  /**
   * @description Overridden method from base class that calls the API when the form submits
   */
  public async callService(): Promise<ServiceResponse<ViewStatementResponse>> {
    const submitModel = new GetViewCorporateStatementRequest();
    submitModel.accountNumber = this.model.account;
    submitModel.pageNumber = this.queryParameterService2.currentSearchPage;
    submitModel.dateFrom = this.model.dateFrom;
    submitModel.dateTo = this.model.dateTo;
    submitModel.sortOrder = this.model.sortOrder;
    submitModel.transactionType = this.model.transactionType;
    return await this.financeApiService.getStatement(submitModel);
  }

  public cancelDownload() {
    this._cancel = true;
  }
  public async getExportData<T>(): Promise<ServiceResponse<Array<T>>> {
    this._cancel = false;

    const submitModel = new GetViewCorporateStatementRequest();
    submitModel.accountNumber = this.model.account;
    submitModel.pageNumber = this.defaultPageNumber;
    submitModel.dateFrom = this.model.dateFrom;
    submitModel.dateTo = this.model.dateTo;
    submitModel.sortOrder = this.model.sortOrder;
    submitModel.transactionType = this.model.transactionType;

    this.downloadFileName = `statement_${submitModel.accountNumber}`;
    this.exportDataProgress = 0.1;
    const firstPage = await this.financeApiService.getStatement(submitModel);

    let returnData = [];
    if (firstPage.success) {
      const clearedTransactions = new Array<ClearedTransaction>();

      clearedTransactions.push(...firstPage.data.data.clearedTransactions.map((c) => {
        const object = new ClearedTransaction();
        object.fromServerObject(c);
        return object;
      }));

      const unClearedTransactions = new Array<ClearedTransaction>();
      unClearedTransactions.push(...firstPage.data.data.unClearedTransactions.map((c) => {
        const object = new ClearedTransaction();
        object.fromServerObject(c);
        return object;
      }));

      for (let i = firstPage.data.data.pageNumber; i < firstPage.data.data.totalPages; i++) {
        if (this._cancel) {
          firstPage.error = new HttpErrorResponse({ status: -1, statusText: 'Aborted' });
          firstPage.success = false;
          break;
        }
        submitModel.pageNumber = i + 1;
        this.exportDataProgress = (i + 1) / firstPage.data.data.totalPages;
        const pageData = await this.financeApiService.getStatement(submitModel);

        if (!pageData.success) {
          firstPage.error = pageData.error;
          firstPage.success = pageData.success;
          break;
        } else {
          clearedTransactions.push(...pageData.data.data.clearedTransactions.map((c) => {
            const object = new ClearedTransaction();
            object.fromServerObject(c);
            return object;
          }));
          unClearedTransactions.push(...pageData.data.data.unClearedTransactions.map((c) => {
            const object = new ClearedTransaction();
            object.fromServerObject(c);
            return object;
          }));
        }
      }

      returnData = [...unClearedTransactions, ...clearedTransactions];
    }

    const results = {
      success: firstPage.success,
      error: firstPage.error,
      data: returnData
    };
    return results;
  }
}

