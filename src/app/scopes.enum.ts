
export enum Scopes {
    FinanceReference = 'reference_finance',
    CorporateViewStatement = 'accounts_view_corp_statement',
    CorporateOnceOffPayment = 'transactions_corporate_plus_once_of_payment',
    CorporateMultipleOnceOffPayment = 'transactions_corporate_plus_multiple_once_of_payment',
    AddFinanceBeneficiary = 'customers_add_new_finance_beneficiary',
    DeleteFinanceBeneficiary = 'customers_delete_finance_beneficiary',
    OpenId = 'openid',
}

export class ScopeHelper {
    private static readonly _allScopes = Object.values(Scopes);

    static get allScopes() {
        return this._allScopes;
    }
}

