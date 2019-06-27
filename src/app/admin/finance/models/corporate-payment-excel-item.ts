
import { CorporatePlusMultipleOnceOffPaymentsItem } from '../../resources/bank-api/bank-api.module';

export class CorporatePaymentExcelItem
    extends CorporatePlusMultipleOnceOffPaymentsItem /* istanbul ignore next */ {
    public toBank: string = null;
    public toAccountType: string = null;
}
