import { Result } from './result';
import { FinanceBeneficiaryBalance } from './finance-beneficiary-balance';

export class GetFinanceBeneficiaryBalanceResponse {
    public result: Result;
    public financeBeneficiariesList: Array<FinanceBeneficiaryBalance>;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.financeBeneficiariesList = object.financeBeneficiariesList.map((v) => new FinanceBeneficiaryBalance(v));
    }
}
