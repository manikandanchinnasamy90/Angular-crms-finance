
export class TransactionType {
    public transactionTypeCode: string;
    public transactionTypeDescription: string;
    public transactionTypeDetailDescription: string;
    public transactionTypeInternalDescription: string;
    public transactionTypeMinistatementDescription: string;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.transactionTypeCode = String(object.transactionTypeCode);
        this.transactionTypeDescription = String(object.transactionTypeDescription);
        this.transactionTypeDetailDescription = String(object.transactionTypeDetailDescription);
        this.transactionTypeInternalDescription = String(object.transactionTypeInternalDescription);
        this.transactionTypeMinistatementDescription = String(object.transactionTypeMinistatementDescription);
    }
}
