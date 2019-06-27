import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { AccountsService } from './accounts.service';
import {
  GetFinanceBeneficiaryBalanceResponse,
  GetFinanceBeneficiaryResponse,
  FinanceAccountTypeEnum
} from '../../resources/reference-api/reference-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { ServiceResponse, Result } from '../../resources/bank-api/bank-api.module';
import { CorporatePlusAccountsList } from '../models/corporarte-plus-account-list';
import { CorporatePlusAccount } from '../models/corporate-plus-account';

describe('AccountsService', () => {
  let accountsApiResults: GetFinanceBeneficiaryResponse;
  let balanceApiResults: GetFinanceBeneficiaryBalanceResponse;
  let resolvers: Array<(value: any) => void>;
  beforeEach(() => {

    resolvers = [];
    const referenceDataServiceSpy = jasmine.createSpyObj(['getAll']);

    accountsApiResults = {
      result: {
        responseCode: '0',
        responseDescription: 'success',
      },
      financeBeneficiariesDAOList: [
        {
          accountName: 'account1',
          accountNumber: '1',
          accountType: FinanceAccountTypeEnum.CorpPlus,
          branchCode: 123,
          toReference: 'to',
          fromReference: 'from',
          bankCode: 'BL123',
          accountTypeCode: 1
        },
        {
          accountName: 'account2',
          accountNumber: '2',
          accountType: FinanceAccountTypeEnum.CorpPlus,
          branchCode: 123,
          toReference: 'to',
          fromReference: 'from',
          bankCode: 'BL123',
          accountTypeCode: 1
        },
        {
          accountName: 'account2',
          accountNumber: '9',
          accountType: FinanceAccountTypeEnum.External,
          branchCode: 123,
          toReference: 'to',
          fromReference: 'from',
          bankCode: 'BL123',
          accountTypeCode: 1
        }
      ]
    };

    balanceApiResults = {
      result: {
        responseCode: '0',
        responseDescription: 'success',
      },
      financeBeneficiariesList: [
        {
          accountNumber: '1',
          balance: 123.12
        },
        {
          accountNumber: '3',
          balance: 22.12
        }
      ]
    };

    (referenceDataServiceSpy.getAll as jasmine.Spy).and.callFake(() => {
      return new Promise((r) => {
        resolvers.push(r);
      });
    });

    TestBed.configureTestingModule({
      providers: [
        AccountsService,
        {
          provide: ReferenceDataService,
          useValue: referenceDataServiceSpy
        }
      ]
    });
  });

  it('should be created', inject([AccountsService], (_service: AccountsService) => {
    expect(_service).toBeTruthy();
  }));

  let service: AccountsService;
  let referenceDataService: ReferenceDataService;
  beforeEach(inject([AccountsService, ReferenceDataService], (_service: AccountsService, _referenceDataService: ReferenceDataService) => {

    service = _service;
    referenceDataService = _referenceDataService;
  }));

  it('should call finance service', fakeAsync(() => {
    // act
    let results: ServiceResponse<CorporatePlusAccountsList>;
    service.getCorporatePlusAccounts().then((r) => {
      results = r;
    });

    resolvers[0](accountsApiResults);
    tick();

    resolvers[1](balanceApiResults);
    tick();

    // assert
    const expectedResults: ServiceResponse<CorporatePlusAccountsList> = {
      success: true,
      error: null,
      data: new CorporatePlusAccountsList(),
    };
    const item = new CorporatePlusAccount();
    item.name = 'account1';
    item.number = '1';
    item.balance = 123.12;
    expectedResults.data.data.push(item);
    const item2 = new CorporatePlusAccount();
    item2.name = 'Unknown account';
    item2.number = '3';
    item2.balance = 22.12;
    expectedResults.data.data.push(item2);
    expectedResults.data.result = new Result();
    expectedResults.data.result.responseCode = '0';
    expectedResults.data.result.responseDescription = 'success';

    expect(results).toEqual(expectedResults);

    expect(referenceDataService.getAll).toHaveBeenCalledWith({
      endpoint: 'getFinanceBeneficiary/all',
      type: GetFinanceBeneficiaryResponse,
    });

    expect(referenceDataService.getAll).toHaveBeenCalledWith({
      endpoint: 'getFinanceBeneficiaryBalance',
      type: GetFinanceBeneficiaryBalanceResponse,
      skipCache: true
    });
  }));

  it('should call cache results from api service', fakeAsync(() => {

    let returns = 0;
    // act
    service.getCorporatePlusAccounts().then(() => {
      returns++;
    });
    resolvers[0](accountsApiResults);
    tick();
    resolvers[1](balanceApiResults);
    tick();

    service.getCorporatePlusAccounts().then(() => {
      returns++;
    });
    tick();

    service.getCorporatePlusAccounts().then(() => {
      returns++;
    });
    tick();

    service.getCorporatePlusAccounts().then(() => {
      returns++;
    });
    tick();

    // assert
    expect(returns).toBe(4);
    expect(referenceDataService.getAll).toHaveBeenCalledTimes(2);
  }));

  it('should not cache when api fails', fakeAsync(() => {
    // arrange
    const returns = [];
    balanceApiResults.result.responseCode = '100';

    // act
    for (let i = 0; i < 5; i++) {
      service.getCorporatePlusAccounts().then((r) => {
        returns.push(r);
      });
      resolvers.pop()(accountsApiResults);
      tick();
      resolvers.pop()(balanceApiResults);
      tick();
    }

    // assert
    expect(returns.length).toBe(5);
    expect(returns[0].success).toBeFalsy();
    expect(returns[0].error.statusText).toEqual('An error occurred getting accounts');
    expect(referenceDataService.getAll).toHaveBeenCalledTimes(10);
  }));

  it('should allow forcing cache reload', fakeAsync(() => {
    // arrange
    let returns = 0;

    // act
    for (let i = 0; i < 5; i++) {
      service.getCorporatePlusAccounts(true).then(() => {
        returns++;
      });
      resolvers.pop()(accountsApiResults);
      tick();
      resolvers.pop()(balanceApiResults);
      tick();
    }

    service.getCorporatePlusAccounts().then(() => {
      returns++;
    });
    tick();

    // assert
    expect(returns).toBe(6);
    expect(referenceDataService.getAll).toHaveBeenCalledTimes(10);
  }));

  it('should check for null accounts', fakeAsync(() => {
    // act
    let results: ServiceResponse<CorporatePlusAccountsList>;
    service.getCorporatePlusAccounts().then((r) => {
      results = r;
    });

    resolvers[0](null);
    tick();

    resolvers[1](null);
    tick();

    // assert
    expect(results.success).toBeFalsy();
    expect(results.data).toEqual(new CorporatePlusAccountsList());
    expect(results.error.statusText).toEqual('An error occurred getting accounts');

  }));

  it('should check for null accounts', fakeAsync(() => {
    // act
    let results: ServiceResponse<CorporatePlusAccountsList>;
    service.getCorporatePlusAccounts().then((r) => {
      results = r;
    });

    resolvers[0](null);
    tick();

    resolvers[1](balanceApiResults);
    tick();

    // assert
    const expectedResults: ServiceResponse<CorporatePlusAccountsList> = {
      success: true,
      error: null,
      data: new CorporatePlusAccountsList(),
    };
    const item = new CorporatePlusAccount();
    item.number = '1';
    item.balance = 123.12;
    expectedResults.data.data.push(item);
    const item2 = new CorporatePlusAccount();
    item2.number = '3';
    item2.balance = 22.12;
    expectedResults.data.data.push(item2);
    expectedResults.data.result = new Result();
    expectedResults.data.result.responseCode = '0';
    expectedResults.data.result.responseDescription = 'success';

    expect(results).toEqual(expectedResults);
  }));
});
