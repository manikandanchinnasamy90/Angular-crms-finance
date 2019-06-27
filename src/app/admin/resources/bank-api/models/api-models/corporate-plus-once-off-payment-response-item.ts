import { DisplayDecorator, PropertyTypes } from 'src/app/admin/display-decorators/display-decorators.module';

export class CorporatePlusOnceOffPaymentResponseItem {
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
}
