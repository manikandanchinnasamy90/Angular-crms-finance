import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { CorporateTransfer } from './corporate-transfer';
import { FormControl } from '@angular/forms';

export class CorporateTransferList extends ApiModelBase {
    @DisplayDecorator.Display({
        key: 'transfers',
        type: PropertyTypes.array,
        class: CorporateTransfer,
        templateOptions: {
            label: 'Transfers',
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
    public transfers: Array<CorporateTransfer> = [];
}
