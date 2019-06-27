import { CorporatePlusMultipleOnceOffPaymentsItem } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';

export class CorporatePlusMultipleOnceOffPaymentsItemResults
  extends CorporatePlusMultipleOnceOffPaymentsItem /* istanbul ignore next */ {
  @DisplayDecorator.Display({
    key: 'success',
    order: 0,
    type: PropertyTypes.input,
    templateOptions: {
      type: 'text',
      label: 'Success',
      placeholder: 'Success',
      pattern: /^Success$/,
      required: false,
    },
  })
  public success?: string = null;

  @DisplayDecorator.Display({
    key: 'message',
    order: 1,
    type: PropertyTypes.input,
    templateOptions: {
      type: 'text',
      label: 'Message',
      placeholder: 'Message',
      required: false,
    },
  })
  public message?: string = null;

  @DisplayDecorator.Display({
    key: 'transactionId',
    order: 2,
    type: PropertyTypes.input,
    templateOptions: {
      type: 'text',
      label: 'Transaction ID',
      placeholder: 'Transaction ID',
      required: false,
    },
  })
  public transactionId?: number = null;
}
