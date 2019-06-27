
export class AccountType {
    public accountTypeCode: number;
    public accountTypeDescription: string;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.accountTypeCode = Number(object.accountTypeCode);
        this.accountTypeDescription = String(object.accountTypeDescription);
    }
}
