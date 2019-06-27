import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { NotificationTypeEnum } from './notification-type.enum';
import { DataFormats } from 'src/app/admin/display-decorators/models/data-formats.enum';
import { GetBankCodesResponse, GetAccountTypesResponse } from '../../../reference-api/reference-api.module';

export class CorporatePlusMultipleOnceOffPaymentsItem extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'fromAccount',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'From account',
            placeholder: 'From  account number',
            pattern: /^\d{11,16}$/,
            required: true,
        },
    })
    public fromAccount?: string = null;

    @DisplayDecorator.Display({
        key: 'toAccountNumber',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'To account number',
            placeholder: 'To account number',
            pattern: /^\d{11,16}$/,
            required: true,
        },
    })
    public toAccountNumber?: string = null;

    @DisplayDecorator.Display({
        key: 'toBankCode',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        referenceDataApi: 'bankCodes',
        referenceDataPath: 'data.bankCodes',
        referenceDataReturnType: GetBankCodesResponse,
        templateOptions: {
            type: 'text',
            label: 'Bank',
            placeholder: 'Bank',
            valueProp: 'bankCode',
            labelProp: 'bankDescription',
            required: true,
        },
    })
    public toBankCode?: string = null;

    @DisplayDecorator.Display({
        key: 'toBranchCode',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'Branch code',
            placeholder: 'Branch code',
            required: true,
        },
    })
    public toBranchCode?: string = null;

    @DisplayDecorator.Display({
        key: 'toAccountName',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'To account name',
            maxLength: 30,
            pattern: /^[a-zA-Z0-9_.\s]*$/,
            placeholder: 'toAccountName',
            required: false,
        },
    })
    public toAccountName?: string = null;

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
            placeholder: 'toAccountTypeCode',
            required: true,
        },
    })
    public toAccountTypeCode?: number = null;

    @DisplayDecorator.Display({
        key: 'amount',
        type: PropertyTypes.input,
        valueType: typeof (0),
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            min: 0,
            pattern: /^\d*\.?\d*$/,
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
            placeholder: 'notificationType',
            options: [
                { label: 'None', value: 'None' },
                { label: 'Email', value: 'Email' },
                { label: 'SMS', value: 'SMS' },
            ],
            required: true,
        },
    })
    public notificationType?: NotificationTypeEnum = null;

    @DisplayDecorator.Display({
        key: 'fromReference',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'From reference',
            placeholder: 'fromReference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: true,
        },
    })
    public fromReference?: string = null;

    @DisplayDecorator.Display({
        key: 'toReference',
        type: PropertyTypes.input,
        valueType: typeof (''),
        templateOptions: {
            type: 'text',
            label: 'To reference',
            placeholder: 'toReference',
            pattern: /^[a-zA-Z0-9_.\s]{1,20}$/,
            required: false,
        },
    })
    public toReference?: string = null;
}
