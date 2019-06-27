import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';

export class PaymentResponseList extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'responseCode',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Response code',
            placeholder: 'responseCode',
            required: true,
        },
    })
    public responseCode?: number = null;

    @DisplayDecorator.Display({
        key: 'responseDescription',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Response description',
            placeholder: 'responseDescription',
            required: true,
        },
    })
    public responseDescription?: string = null;

    @DisplayDecorator.Display({
        key: 'transactionID',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Transaction id',
            placeholder: 'transactionID',
            required: true,
        },
    })
    public transactionID?: number = null;

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
    public toAccount?: string = null;
}
