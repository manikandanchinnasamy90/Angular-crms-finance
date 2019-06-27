
export class FinanceBeneficiaryBalance {
    public accountNumber: string;
    public balance: number;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.accountNumber = String(object.accountNumber);
        this.balance = Number(object.balance);
    }
}
