import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';

export class CorporatePlusOnceOffPayment extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'transactionId',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Transaction id',
            placeholder: 'transactionId',
            required: false,
        },
    })
    public transactionId?: number = null;

    @DisplayDecorator.Display({
        key: 'amount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Amount',
            min: 0,
            placeholder: 'Amount',
            required: false,
        },
    })
    public amount?: number = null;

    @DisplayDecorator.Display({
        key: 'fromAccount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'From account',
            placeholder: 'fromAccount',
            pattern: /^786\d{8}$/,
            required: false,
        },
    })
    public fromAccount?: string = null;

    @DisplayDecorator.Display({
        key: 'toAccount',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'To account',
            placeholder: 'toAccount',
            required: false,
        },
    })
    public toAccount?: number = null;

    @DisplayDecorator.Display({
        key: 'toReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'To reference',
            placeholder: 'toReference',
            required: false,
        },
    })
    public toReference?: string = null;

    @DisplayDecorator.Display({
        key: 'fromReference',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'From reference',
            placeholder: 'fromReference',
            required: false,
        },
    })
    public fromReference?: string = null;
}
