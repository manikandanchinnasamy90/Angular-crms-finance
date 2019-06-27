import { ApiModelBase } from '../api-model-base';
import { DisplayDecorator, PropertyTypes } from '../../../../display-decorators/display-decorators.module';
import { ViewStatementData } from './view-statement-data';
import { Result } from './result';

export class ViewStatementResponse extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'data',
        type: PropertyTypes.class,
        class: ViewStatementData,
        templateOptions: { label: 'Data' },
    })
    public data = new ViewStatementData();

    @DisplayDecorator.Display({
        key: 'result',
        type: PropertyTypes.class,
        class: Result,
        templateOptions: { label: 'Result' },
    })
    public result = new Result();
}
