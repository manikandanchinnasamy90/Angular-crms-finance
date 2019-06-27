import { ApiModelBase, NotificationTypeEnum } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import {
    GetFinanceBeneficiaryResponse,
    FinanceBeneficiary,
    FinanceAccountTypeEnum
} from '../../resources/reference-api/reference-api.module';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { tap } from 'rxjs/operators';

export class BeneficiaryTransfer extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'fromAccount',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        className: 'account-element',
        referenceDataApi: 'getFinanceBeneficiary/all',
        referenceDataPath: 'financeBeneficiariesDAOList',
        referenceDataReturnType: GetFinanceBeneficiaryResponse,
        referenceDataFilter: (item: FinanceBeneficiary): boolean => {
            return item.accountType === FinanceAccountTypeEnum.CorpPlus;
        },
        templateOptions: {
            type: 'text',
            label: 'From account',
            placeholder: 'From account',
            valueProp: 'accountNumber',
            labelProp: 'accountName',
            required: true,
        },
        hooks: {
            afterViewInit: (field: FormlyFieldConfig) => {

                field.hooks.valueChangeSub = (field as any).form.valueChanges.pipe(
                    tap((value: BeneficiaryTransfer) => {
                        if (value == null) {
                            field.formControl.setErrors(null);
                            return;
                        }
                        if (value.fromAccount == null) {
                            field.formControl.setErrors({ required: true });
                            return;
                        }
                        if (value.toAccount == null) {
                            field.formControl.setErrors(null);
                            return;
                        }
                        if (value.fromAccount === value.toAccount) {
                            field.formControl.setErrors({ equalToTo: true });
                            return;
                        }

                        field.formControl.setErrors(null);
                    })
                ).subscribe();
            },
            onDestroy: (field: FormlyFieldConfig) => {
                field.hooks.valueChangeSub.unsubscribe();
            }
        },
        validators: {
            equalToTo: {
                expression: () => {
                    return true;
                },
                message: () => 'From and to accounts have to be different',
            },
        },
    })
    public fromAccount: string = null;

    @DisplayDecorator.Display({
        key: 'toAccount',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        className: 'account-element',
        referenceDataApi: 'getFinanceBeneficiary/all',
        referenceDataPath: 'financeBeneficiariesDAOList',
        referenceDataReturnType: GetFinanceBeneficiaryResponse,
        templateOptions: {
            type: 'text',
            label: 'To account',
            placeholder: 'To account',
            valueProp: 'accountNumber',
            labelProp: 'accountName',
            required: true,
        },
    })
    public toAccount: string = null;

    @DisplayDecorator.Display({
        key: 'amount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Amount',
            min: 0,
            placeholder: 'Amount',
            required: true,
        },
    })
    public amount?: number = null;

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
            required: true,
        },
    })
    public toReference?: string = null;

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
    public notificationType: NotificationTypeEnum;
}
