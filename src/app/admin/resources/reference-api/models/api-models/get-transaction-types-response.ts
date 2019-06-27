import { Result } from './result';
import { TransactionType } from './transaction-type';

export class GetTransactionTypesResponse {
    public result: Result;
    public data: {
        transactionTypes: TransactionType[];
    };

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.data = {
            transactionTypes: object.data.transactionTypes.map != null
                ? object.data.transactionTypes.map((v) => new TransactionType(v))
                : object.data.transactionTypes
        };
    }
}
