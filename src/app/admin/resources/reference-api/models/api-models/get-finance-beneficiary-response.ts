import { Result } from './result';
import { FinanceBeneficiary } from './finance-beneficiary';

export class GetFinanceBeneficiaryResponse {
    public result: Result;
    public financeBeneficiariesDAOList: Array<FinanceBeneficiary>;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.financeBeneficiariesDAOList = object.financeBeneficiariesDAOList.map((v) => new FinanceBeneficiary(v));
    }
}
