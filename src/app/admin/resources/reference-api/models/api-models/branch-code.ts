
export class BranchCode {
    public bankCode: string;
    public branchCode: number;
    public branchDescription: string;
    public branchAddress: string;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.bankCode = String(object.bankCode);
        this.branchCode = Number(object.branchCode);
        this.branchDescription = String(object.branchDescription);
        this.branchAddress = String(object.branchAddress);
    }
}
