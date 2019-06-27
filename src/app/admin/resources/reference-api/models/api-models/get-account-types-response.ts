import { Result } from './result';
import { AccountType } from './account-type';

export class GetAccountTypesResponse {
    public result: Result;
    public data: {
        accountTypes: AccountType[];
    };

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.result = new Result(object.result);
        this.data = {
            accountTypes: object.data.accountTypes.map != null
                ? object.data.accountTypes.map((v) => new AccountType(v))
                : object.data.accountTypes
        };
    }
}
