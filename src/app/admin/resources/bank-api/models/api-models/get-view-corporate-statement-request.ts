import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { TransactionTypeEnum } from './transaction-type.enum';
import { SortOrderEnum } from './sort-order.enum';

export class GetViewCorporateStatementRequest extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'accountNumber',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Account number',
            pattern: /^\d{11,20}$/,
            placeholder: 'Account number linked to the card',
            required: true,
        },
    })
    public accountNumber?: string = null;

    @DisplayDecorator.Display({
        key: 'dateFrom',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Date from',
            placeholder: 'Statement from date',
            pattern: /^[12]\d{3}(0?[1-9]|1[012])(0?[1-9]|[12]\d|3[01])$/,
            required: false,
        },
    })
    public dateFrom?: string = null;

    @DisplayDecorator.Display({
        key: 'dateTo',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Date to',
            placeholder: 'Statement to date',
            pattern: /^[12]\d{3}(0?[1-9]|1[012])(0?[1-9]|[12]\d|3[01])$/,
            required: false,
        },
    })
    public dateTo?: string = null;

    @DisplayDecorator.Display({
        key: 'transactionType',
        type: PropertyTypes.select,
        valueType: typeof(''),
        templateOptions: {
            label: 'Transaction type',
            placeholder: 'transaction type',
            options: [
                {label: 'All', value: 'All'},
                {label: 'Cleared', value: 'Cleared'},
                {label: 'UnCleared', value: 'UnCleared'},
            ],
            required: false,
        },
    })
    public transactionType?: TransactionTypeEnum = null;

    @DisplayDecorator.Display({
        key: 'pageNumber',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Page number',
            min: 1,
            placeholder: 'page records',
            required: false,
        },
    })
    public pageNumber?: number = null;

    @DisplayDecorator.Display({
        key: 'sortOrder',
        type: PropertyTypes.select,
        valueType: typeof(''),
        templateOptions: {
            label: 'Sort order',
            placeholder: 'Sort order for results',
            options: [
                {label: 'Ascending', value: 'Asc'},
                {label: 'Descending', value: 'Dsc'},
            ],
            required: false,
        },
    })
    public sortOrder?: SortOrderEnum = null;
}
