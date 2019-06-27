import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { Result } from './result';
import { CorporatePlusOnceOffPayment } from './corporate-plus-once-off-payment';
import { CorporatePlusOnceOffPaymentResponseItem } from './corporate-plus-once-off-payment-response-item';

export class CorporatePlusOnceOffPaymentResponse extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'result',
        type: PropertyTypes.class,
        class: Result,
        templateOptions: { label: 'Result' },
    })
    public result?: Result = null;

    @DisplayDecorator.Display({
        key: 'data',
        type: PropertyTypes.class,
        class: CorporatePlusOnceOffPayment,
        templateOptions: { label: 'Data' },
    })
    public data?: CorporatePlusOnceOffPaymentResponseItem = null;
}
