import { Injectable } from '@angular/core';
import { ApiDecorators } from '../decorators/api.decorator';
import { environment } from 'src/environments/environment';
import {
  CorporatePlusOnceOffPaymentResponse,
  CorporatePlusMultipleOnceOffPaymentsRequest,
  ServiceResponse,
  CorporatePlusOnceOffPaymentRequest,
  GetViewCorporateStatementRequest,
  ViewStatementResponse,
  CorporatePlusMultipleOnceOffPaymentResponse,
  AddFinanceBeneficiaryRequest,
  Result,
  DeleteFinanceBeneficiaryRequest
} from '../models/model-exports';

/**
 * @description Service with finance related apis
 */
@Injectable({
  providedIn: 'root'
})
export class FinanceApiService {

  constructor() { }

  /* istanbul ignore next */
  /**
   * @description Get statement for an account
   * @param _body request body
   */
  @ApiDecorators.postApi<GetViewCorporateStatementRequest, ViewStatementResponse>(
    environment.accountContext,
    'accounts/viewCorpPlusStatement',
    ViewStatementResponse)
  public async getStatement(_body: GetViewCorporateStatementRequest): Promise<ServiceResponse<ViewStatementResponse>> {
    return null;
  }

  /* istanbul ignore next */
  /**
   * @description Pay multiple accounts from a corporate plus account
   * @param _body Request model
   */
  @ApiDecorators.postApi<CorporatePlusMultipleOnceOffPaymentsRequest, CorporatePlusMultipleOnceOffPaymentResponse>(
    environment.paymentsContext,
    'payments/corporatePlusMultipleOnceOffPayments',
    CorporatePlusMultipleOnceOffPaymentResponse)
  public async corporatePlusMultiPayments(
    _body: CorporatePlusMultipleOnceOffPaymentsRequest):
    Promise<ServiceResponse<CorporatePlusMultipleOnceOffPaymentResponse>> {
    return null;
  }

  /* istanbul ignore next */
  /**
   * @description Pay account from a corporate plus account
   * @param _body Request model
   */
  @ApiDecorators.postApi<CorporatePlusOnceOffPaymentRequest, CorporatePlusOnceOffPaymentResponse>(
    environment.paymentsContext,
    'payments/corporatePlusOnceOffPayment',
    CorporatePlusOnceOffPaymentResponse)
  public async corporatePlusOnceOffPayment(
    _body: CorporatePlusOnceOffPaymentRequest):
    Promise<ServiceResponse<CorporatePlusOnceOffPaymentResponse>> {
    return null;
  }

  /* istanbul ignore next */
  /**
   * @description Add finance beneficiary
   * @param _body Request model
   */
  @ApiDecorators.postApi<AddFinanceBeneficiaryRequest, Result>(
    environment.customersContext,
    'customers/addFinanceBeneficiary',
    Result)
  public async addFinanceBeneficiary(
    _body: AddFinanceBeneficiaryRequest):
    Promise<ServiceResponse<Result>> {
    return null;
  }


  /* istanbul ignore next */
  /**
   * @description Add finance beneficiary
   * @param _body Request model
   */
  @ApiDecorators.deleteWithBodyApi<DeleteFinanceBeneficiaryRequest, Result>(
    environment.customersContext,
    'customers/deleteFinanceBeneficiary',
    Result)
  public async deleteFinanceBeneficiary(
    _body: DeleteFinanceBeneficiaryRequest):
    Promise<ServiceResponse<Result>> {
    return null;
  }
}
