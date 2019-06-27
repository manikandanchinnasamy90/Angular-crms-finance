import { CorporatePlusMultipleOnceOffPaymentsRequest } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { CorporatePlusMultipleOnceOffPaymentsItemResults } from './corporate-plus-multiple-once-off-payments-item-results';

export class CorporatePlusMultipleOnceOffPaymentsResults
  extends CorporatePlusMultipleOnceOffPaymentsRequest /* istanbul ignore next */ {
  @DisplayDecorator.Display({
    key: 'listOfPayments',
    type: PropertyTypes.arrayTable,
    class: CorporatePlusMultipleOnceOffPaymentsItemResults,
    templateOptions: {
      label: 'List of payments',
    }
  })
  public listOfPayments: Array<CorporatePlusMultipleOnceOffPaymentsItemResults> = [];
}
