import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { BeneficiaryTransfer } from './beneficiary-transfer';
import { FormControl } from '@angular/forms';

export class BeneficiaryTransferList extends ApiModelBase {
    @DisplayDecorator.Display({
        key: 'transfers',
        type: PropertyTypes.array,
        class: BeneficiaryTransfer,
        templateOptions: {
            label: 'Payments',
            maxLength: 20,
        },
        validators: {
            empty: {
                expression: (c: FormControl) => {
                    return c.value.length > 0;
                },
                message: () => 'You have to add at least one transfer',
            },
        },
    })
    public transfers: Array<BeneficiaryTransfer> = [];
}
