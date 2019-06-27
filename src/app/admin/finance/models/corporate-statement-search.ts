import { ApiModelBase } from '../../resources/bank-api/models/api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { TransactionTypeEnum, SortOrderEnum } from '../../resources/bank-api/bank-api.module';

export class CorporateStatementSearch extends ApiModelBase {
    @DisplayDecorator.Display({
        key: 'account',
        type: PropertyTypes.searchSelect,
        templateOptions: {
            type: 'text',
        },
    })
    public account?: string = null;

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
        valueType: typeof (''),
        templateOptions: {
            label: 'Cleared or un-cleared transactions',
            placeholder: 'transaction type',
            options: [
                { label: 'All', value: 'All' },
                { label: 'Cleared', value: 'Cleared' },
                { label: 'Un-cleared', value: 'UnCleared' },
            ],
            required: false,
        },
    })
    public transactionType?: TransactionTypeEnum = TransactionTypeEnum.All;

    @DisplayDecorator.Display({
        key: 'sortOrder',
        type: PropertyTypes.select,
        valueType: typeof (''),
        templateOptions: {
            label: 'Sort order',
            placeholder: 'Sort order for results',
            options: [
                { label: 'Ascending', value: 'Asc' },
                { label: 'Descending', value: 'Dsc' },
            ],
            required: false,
        },
    })
    public sortOrder?: SortOrderEnum = SortOrderEnum.Descending;
}
