import { CorporatePlusAccount } from './corporate-plus-account';
import { ApiModelBase, Result } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';

export class CorporatePlusAccountsList extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'data',
        type: PropertyTypes.arrayTable,
        class: CorporatePlusAccount,
        templateOptions: {
            label: 'Accounts',
        }
    })
    public data: Array<CorporatePlusAccount> = [];

    @DisplayDecorator.Display({
        key: 'result',
        type: PropertyTypes.class,
        class: Result,
        templateOptions: { label: 'Result' },
    })
    public result?: Result = null;
}
