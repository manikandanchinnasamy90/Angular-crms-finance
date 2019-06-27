import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { NotificationTypeEnum } from './notification-type.enum';
import {
    GetBranchCodesByBankCodeResponse,
    GetBankCodesResponse,
    GetAccountTypesResponse
} from '../../../reference-api/reference-api.module';
import { DataFormats } from 'src/app/admin/display-decorators/models/data-formats.enum';

export class CorporatePlusOnceOffPaymentRequest extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'fromAccount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'From account',
            placeholder: 'From account number',
            pattern: /^300\d{8}$/,
            required: true,
        },
    })
    public fromAccount?: string = null;

    @DisplayDecorator.Display({
        key: 'toAccountName',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'To account name',
            maxLength: 30,
            pattern: /^[a-zA-Z0-9_.\s]*$/,
            placeholder: 'To account name',
            required: false,
        },
    })
    public toAccountName?: string = null;

    @DisplayDecorator.Display({
        key: 'toAccount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'To account number',
            placeholder: 'To account number',
            pattern: /^[0-9\s]{1,20}$/,
            required: true,
        },
    })
    public toAccount?: string = null;

    @DisplayDecorator.Display({
        key: 'toBankCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        referenceDataApi: 'bankCodes',
        referenceDataPath: 'data.bankCodes',
        referenceDataReturnType: GetBankCodesResponse,
        templateOptions: {
            type: 'text',
            label: 'To bank code',
            placeholder: 'To bank code',
            valueProp: 'bankCode',
            labelProp: 'bankDescription',
            required: true,
        },
    })
    public toBankCode?: string = null;

    @DisplayDecorator.Display({
        key: 'toBranchCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (0),
        referenceDataApi: 'bankCodes/{bankCode}/branchCodes',
        referenceDataPath: 'data.branchCodes',
        referenceDataReturnType: GetBranchCodesByBankCodeResponse,
        referenceDataPathVariables: [{ name: 'bankCode', pathInObject: 'toBankCode' }],
        templateOptions: {
            type: 'number',
            label: 'To branch code',
            valueProp: 'branchCode',
            labelProp: 'branchDescription',
            placeholder: 'To branch code',
            required: true,
        },
    })
    public toBranchCode?: number = null;

    @DisplayDecorator.Display({
        key: 'toAccountTypeCode',
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
            placeholder: 'Account type',
            required: true,
        },
    })
    public toAccountTypeCode?: number = null;

    @DisplayDecorator.Display({
        key: 'amount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            min: 0,
            label: 'Amount',
            placeholder: 'Amount',
            required: true,
        },
    })
    public amount?: number = null;

    @DisplayDecorator.Display({
        key: 'notificationType',
        type: PropertyTypes.select,
        valueType: typeof (''),
        templateOptions: {
            label: 'Notification type',
            placeholder: 'Notification type',
            options: [
                { label: 'None', value: 'None' },
                { label: 'Email', value: 'Email' },
                { label: 'SMS', value: 'SMS' },
            ],
            required: true,
        },
    })
    public notificationType?: NotificationTypeEnum = NotificationTypeEnum.None;

    @DisplayDecorator.Display({
        key: 'fromReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'From reference',
            placeholder: 'From reference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: true,
        },
    })
    public fromReference?: string = null;

    @DisplayDecorator.Display({
        key: 'toReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'To reference',
            placeholder: 'To reference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: false,
        },
    })
    public toReference?: string = null;
}
