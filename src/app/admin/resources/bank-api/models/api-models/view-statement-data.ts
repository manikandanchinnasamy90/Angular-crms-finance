import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { ClearedTransaction } from './cleared-transaction';
import { UnClearedTransaction } from './un-cleared-transaction';

export class ViewStatementData extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'pageNumber',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Page number',
            placeholder: 'pageNumber',
            required: false,
        },
    })
    public pageNumber?: number = null;

    @DisplayDecorator.Display({
        key: 'totalPages',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            label: 'Total pages',
            placeholder: 'totalPages',
            required: false,
        },
    })
    public totalPages?: number = null;

    @DisplayDecorator.Display({
        key: 'clearedTransactions',
        type: PropertyTypes.arrayTable,
        class: ClearedTransaction,
        templateOptions: {
            label: 'Cleared transactions',
        }
    })
    public clearedTransactions?: Array<ClearedTransaction> = null;

    @DisplayDecorator.Display({
        key: 'unClearedTransactions',
        type: PropertyTypes.arrayTable,
        class: UnClearedTransaction,
        templateOptions: {
            label: 'Un cleared transactions',
        }
    })
    public unClearedTransactions?: Array<UnClearedTransaction> = null;
}
