import { FinanceBeneficiaryList } from './finance-beneficiary-list';
import { DisplayDecorator } from '../../display-decorators/display-decorators.module';
import { PropertyTypes } from '../../display-decorators/models/export-models';
import { AddFinanceBeneficiaryRequest } from '../../resources/bank-api/bank-api.module';

export class CorpPlusAccountList extends FinanceBeneficiaryList {
    @DisplayDecorator.Display({
        key: 'financeBeneficiariesDAOList',
        type: PropertyTypes.array,
        class: AddFinanceBeneficiaryRequest,
        templateOptions: {
            label: 'Corporate Accounts',
        }
    })
    public financeBeneficiariesDAOList: Array<AddFinanceBeneficiaryRequest> = [];
}
