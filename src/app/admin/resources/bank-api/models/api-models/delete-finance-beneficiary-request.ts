import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';

export class DeleteFinanceBeneficiaryRequest extends ApiModelBase {
    @DisplayDecorator.Display({
        key: 'accountNumber',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Beneficiary account number',
            placeholder: 'Beneficiary account number',
            pattern: /^[0-9\s]{1,20}$/,
            required: true,
        },
    })
    public accountNumber: string = null;
}
