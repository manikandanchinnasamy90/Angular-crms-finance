import { ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';
import { DataFormats } from '../../display-decorators/models/data-formats.enum';

export class CorporatePlusAccount extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'name',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Account',
            required: true,
        },
    })
    public name?: string = null;

    @DisplayDecorator.Display({
        key: 'number',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Account Number',
            required: true,
        },
    })
    public number?: string = null;

    @DisplayDecorator.Display({
        key: 'balance',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'number',
            format: DataFormats.currency,
            label: 'Balance',
        },
    })
    public balance?: number = null;
}
