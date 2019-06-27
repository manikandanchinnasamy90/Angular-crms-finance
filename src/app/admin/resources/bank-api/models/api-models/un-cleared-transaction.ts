import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { DataFormats } from 'src/app/admin/display-decorators/models/data-formats.enum';

export class UnClearedTransaction extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'transactionId',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Transaction id',
            placeholder: 'transactionId',
            required: true,
        },
    })
    public transactionId?: number = null;

    @DisplayDecorator.Display({
        key: 'transactionTypeCode',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Transaction type code',
            placeholder: 'transactionTypeCode',
            required: true,
        },
    })
    public transactionTypeCode?: string = null;

    @DisplayDecorator.Display({
        key: 'transactionDate',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Transaction date',
            placeholder: 'transactionDate in YYYYMMDD format',
            required: true,
        },
    })
    public transactionDate?: string = null;

    @DisplayDecorator.Display({
        key: 'effectiveDate',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Effective date',
            placeholder: 'effectiveDate in YYYYMMDD format',
            required: true,
        },
    })
    public effectiveDate?: string = null;

    @DisplayDecorator.Display({
        key: 'clearingDate',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Clearing date',
            placeholder: 'clearingDate in YYYYMMDD format',
            required: true,
        },
    })
    public clearingDate?: string = null;

    @DisplayDecorator.Display({
        key: 'transactionDescription',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Transaction description',
            placeholder: 'transactionDescription',
            required: true,
        },
    })
    public transactionDescription?: string = null;

    @DisplayDecorator.Display({
        key: 'fee',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            label: 'Fee',
            placeholder: 'fee',
            required: true,
        },
    })
    public fee?: number = null;

    @DisplayDecorator.Display({
        key: 'debit',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            label: 'Debit',
            placeholder: 'debit',
            required: true,
        },
    })
    public debit?: number = null;

    @DisplayDecorator.Display({
        key: 'credit',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            label: 'Credit',
            placeholder: 'credit',
            required: true,
        },
    })
    public credit?: number = null;
}
