
export class Result {
    public responseCode: string;
    public responseDescription: string;

    constructor(object?) {
        if (object == null) {
            return;
        }
        this.responseCode = String(object.responseCode);
        this.responseDescription = String(object.responseDescription);
    }
}
