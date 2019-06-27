export class FinanceBeneficiary {
    public accountNumber: string;
    public bankCode: string;
    public branchCode: number;
    public toReference?: string;
    public fromReference?: string;
    public accountName: string;
    public accountType: FinanceAccountTypeEnum;
    public accountTypeCode: number;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.accountNumber = String(object.accountNumber);
        this.bankCode = String(object.bankCode);
        this.branchCode = Number(object.branchCode);
        this.toReference = object.toReference == null ? null : String(object.toReference);
        this.fromReference = object.fromReference == null ? null : String(object.fromReference);
        this.accountName = String(object.accountName);
        this.accountType = String(object.accountType) as FinanceAccountTypeEnum;
        this.accountTypeCode = Number(object.accountTypeCode);
    }
}

export enum FinanceAccountTypeEnum {
    CorpPlus = 'CorpPlus',
    External = 'External',
    Internal = 'Internal',
}
