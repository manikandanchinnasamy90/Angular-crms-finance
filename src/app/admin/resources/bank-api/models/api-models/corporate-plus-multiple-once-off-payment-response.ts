import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { PaymentResponseList } from './payment-response-list';

export class CorporatePlusMultipleOnceOffPaymentResponse extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'paymentResponseList',
        type: PropertyTypes.array,
        class: PaymentResponseList,
        templateOptions: {
            label: 'Payment response list',
        }
    })
    public paymentResponseList?: Array<PaymentResponseList> = null;
}
