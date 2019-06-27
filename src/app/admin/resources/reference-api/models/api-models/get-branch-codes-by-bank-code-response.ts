import { Result } from './result';
import { BranchCode } from './branch-code';

export class GetBranchCodesByBankCodeResponse {
    public result: Result;
    public data: {
        branchCodes: BranchCode[];
    };

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.data = {
            branchCodes: object.data.branchCodes.map != null
                ? object.data.branchCodes.map((v) => new BranchCode(v))
                : object.data.branchCodes
        };
    }
}
