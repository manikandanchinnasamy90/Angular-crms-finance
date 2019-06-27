
export class BankCode {
    public bankCode: string;
    public bankDescription: string;
    public universalBranchCode?: number;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.bankCode = String(object.bankCode);
        this.bankDescription = String(object.bankDescription);
        this.universalBranchCode = object.universalBranchCode == null ? null : Number(object.universalBranchCode);
    }
}
