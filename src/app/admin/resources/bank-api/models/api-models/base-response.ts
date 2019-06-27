import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { Result } from './result';

export class BaseResponse extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'result',
        type: PropertyTypes.class,
        class: Result,
        templateOptions: { label: 'Result' },
    })
    public result?: Result = null;
}
