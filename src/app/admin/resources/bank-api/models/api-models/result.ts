import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';

export class Result extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'responseCode',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Response code',
            placeholder: 'responseCode',
            required: true,
        },
    })
    public responseCode: string = null;

    @DisplayDecorator.Display({
        key: 'responseDescription',
        type: PropertyTypes.input,
        templateOptions: {
            type: 'text',
            label: 'Response description',
            placeholder: 'responseDescription',
            required: true,
        },
    })
    public responseDescription: string = null;
}
