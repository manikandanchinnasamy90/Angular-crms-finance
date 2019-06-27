import { NotificationTypeEnum } from '../../resources/bank-api/bank-api.module';
import { BeneficiaryTransfer } from './beneficiary-transfer';
import { DisplayDecorator } from '../../display-decorators/display-decorators.module';
import { PropertyTypes } from '../../display-decorators/models/export-models';
import {
    GetFinanceBeneficiaryResponse,
    FinanceBeneficiary,
    FinanceAccountTypeEnum
} from '../../resources/reference-api/reference-api.module';

export class CorporateTransfer
    extends BeneficiaryTransfer /* istanbul ignore next */ {

    @DisplayDecorator.Display({
        key: 'toAccount',
        type: PropertyTypes.searchSelect,
        valueType: typeof (''),
        className: 'account-element',
        referenceDataApi: 'getFinanceBeneficiary/all',
        referenceDataPath: 'financeBeneficiariesDAOList',
        referenceDataReturnType: GetFinanceBeneficiaryResponse,
        referenceDataFilter: (item: FinanceBeneficiary): boolean => {
            return item.accountType === FinanceAccountTypeEnum.CorpPlus;
        },
        templateOptions: {
            type: 'text',
            label: 'To account',
            placeholder: 'To account',
            valueProp: 'accountNumber',
            labelProp: 'accountName',
            required: true,
        },
    })
    public toAccount: string = null;

    @DisplayDecorator.Display({
        key: 'fromReference',
        type: PropertyTypes.none,
        className: 'hidden',
    })
    public fromReference?: string = null;

    @DisplayDecorator.Display({
        key: 'toReference',
        type: PropertyTypes.none,
        className: 'hidden',
    })
    public toReference?: string = null;

    @DisplayDecorator.Display({
        key: 'notificationType',
        type: PropertyTypes.none,
        className: 'hidden',
    })
    public notificationType = NotificationTypeEnum.None;
}
