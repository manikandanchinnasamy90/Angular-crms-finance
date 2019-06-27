import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { CorporatePlusMultipleOnceOffPaymentsItem } from './corporate-plus-multiple-once-off-payments-item';

export class CorporatePlusMultipleOnceOffPaymentsRequest extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'listOfPayments',
        type: PropertyTypes.arrayTable,
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        templateOptions: {
            label: 'List of payments',
        }
    })
    public listOfPayments: Array<CorporatePlusMultipleOnceOffPaymentsItem> = [];
}
