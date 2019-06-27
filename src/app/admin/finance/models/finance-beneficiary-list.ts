import { Result, AddFinanceBeneficiaryRequest, ApiModelBase } from '../../resources/bank-api/bank-api.module';
import { DisplayDecorator, PropertyTypes } from '../../display-decorators/display-decorators.module';

export class FinanceBeneficiaryList extends ApiModelBase {

    @DisplayDecorator.Display({
        key: 'result',
        type: PropertyTypes.class,
        class: Result,
        templateOptions: { label: 'Result' },
    })
    public result: Result = null;

    @DisplayDecorator.Display({
        key: 'financeBeneficiariesDAOList',
        type: PropertyTypes.array,
        class: AddFinanceBeneficiaryRequest,
        templateOptions: {
            label: 'Beneficiaries',
        }
    })
    public financeBeneficiariesDAOList: Array<AddFinanceBeneficiaryRequest> = [];
}
