import { Result } from './result';
import { BankCode } from './bank-code';

export class GetBankCodesResponse {
    public result: Result;
    public data: {
        bankCodes: BankCode[];
    };

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.data = {
            bankCodes: object.data.bankCodes.map != null
                ? object.data.bankCodes.map((v) => new BankCode(v))
                : object.data.bankCodes
        };
    }
}
