import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';

import {
    GetBranchCodesByBankCodeResponse,
    GetBankCodesResponse,
    GetAccountTypesResponse,
    FinanceAccountTypeEnum
} from '../../../reference-api/reference-api.module';

export class AddFinanceBeneficiaryRequest extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'accountType',
        type: PropertyTypes.none,
    })
    public accountType: FinanceAccountTypeEnum = null;

    @DisplayDecorator.Display({
        key: 'accountName',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Name',
            pattern: /^[a-zA-Z0-9\-\.\(\)&\@\#\[\]\_\,\-\/\\'"\\\s]{1,50}$/,
            placeholder: 'Enter name',
            required: true,
        },
    })
    public accountName: string = null;

    @DisplayDecorator.Display({
        key: 'accountNumber',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Account number',
            placeholder: 'Account number',
            pattern: /^[0-9\s]{1,20}$/,
            required: true,
        },
    })
    public accountNumber: string = null;

    @DisplayDecorator.Display({
        key: 'bankCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        referenceDataApi: 'bankCodes',
        referenceDataPath: 'data.bankCodes',
        referenceDataReturnType: GetBankCodesResponse,
        templateOptions: {
            type: 'text',
            label: 'Bank code',
            placeholder: 'Bank code',
            valueProp: 'bankCode',
            labelProp: 'bankDescription',
            required: true,
        },
    })
    public bankCode: string = null;

    @DisplayDecorator.Display({
        key: 'branchCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (0),
        referenceDataApi: 'bankCodes/{bankCode}/branchCodes',
        referenceDataPath: 'data.branchCodes',
        referenceDataReturnType: GetBranchCodesByBankCodeResponse,
        referenceDataPathVariables: [{ name: 'bankCode', pathInObject: 'bankCode' }],
        templateOptions: {
            type: 'number',
            label: 'Branch code',
            valueProp: 'branchCode',
            labelProp: 'branchDescription',
            placeholder: 'Branch code',
            required: true,
        },
    })
    public branchCode: number = null;

    @DisplayDecorator.Display({
        key: 'accountTypeCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (0),
        referenceDataApi: 'accountTypeCodes',
        referenceDataPath: 'data.accountTypes',
        referenceDataReturnType: GetAccountTypesResponse,
        templateOptions: {
            type: 'number',
            label: 'Account type',
            valueProp: 'accountTypeCode',
            labelProp: 'accountTypeDescription',
            placeholder: 'Select account type',
            required: true,
        },
    })
    public accountTypeCode: number = null;

    @DisplayDecorator.Display({
        key: 'fromReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'From reference',
            placeholder: 'From account reference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: false,
        },
    })
    public fromReference?: string = null;

    @DisplayDecorator.Display({
        key: 'toReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'To reference',
            placeholder: 'To account reference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: false,
        },
    })
    public toReference?: string = null;
}
