import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { DisplayHelpersModule, PanelWrapperComponent, FormPropertiesService } from '../../display-helpers/display-helpers.module';
import {
  ServiceResponse,
  ViewStatementResponse,
  TransactionTypeEnum,
  FinanceApiService,
  SortOrderEnum,
  GetViewCorporateStatementRequest,
  ClearedTransaction
} from '../../resources/bank-api/bank-api.module';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { CorporateStatementComponent } from './corporate-statement.component';
import { QueryParametersService, RouteParametersService } from '../../shared/shared.module';
import { CorporateStatementSearch } from '../models/corporate-statement-search';
import { NgbProgressbarModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import {
  FinanceAccountTypeEnum,
  FinanceBeneficiary,
  GetFinanceBeneficiaryResponse
} from '../../resources/reference-api/reference-api.module';

@Component({ template: '' })
export class StubComponent {

}

describe('CorporateStatementComponent', () => {
  let component: CorporateStatementComponent;
  let fixture: ComponentFixture<CorporateStatementComponent>;

  beforeEach(async(() => {
    class QueryParametersServiceStub {
      get currentSearchPage() {
        return 10;
      }
    }

    const serviceStub = jasmine.createSpyObj(['displayToFormProperties', 'getFormOptionsForField']);
    const apiServiceStub = jasmine.createSpyObj(['getStatement']);

    TestBed.configureTestingModule({
      declarations: [
        CorporateStatementComponent,
        StubComponent
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DisplayHelpersModule,
        NgbProgressbarModule,
        FormlyModule.forRoot({
          wrappers: [
            { name: 'panel', component: PanelWrapperComponent },
          ],
        }),
        RouterTestingModule.withRoutes([]),
        FormlyBootstrapModule
      ],
      providers: [
        {
          provide: FormPropertiesService,
          useValue: serviceStub
        },
        {
          provide: QueryParametersService,
          useValue: new QueryParametersServiceStub()
        },
        {
          provide: FinanceApiService,
          useValue: apiServiceStub
        },
        {
          provide: NgbModal,
          useValue: jasmine.createSpyObj(['open'])
        },
        {
          provide: RouteParametersService,
          useValue: jasmine.createSpyObj(['getRouteParameter'])
        },
        {
          provide: ReferenceDataService,
          useValue: jasmine.createSpyObj(['getAll'])
        },
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const testDate = new Date('2018-10-05');
    spyOn(Date, 'now').and.returnValue(testDate);

    fixture = TestBed.createComponent(CorporateStatementComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit').and.stub();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set model on construction', () => {
    // assert
    expect(component.model instanceof CorporateStatementSearch).toBeTruthy();
  });

  it('should set default values', () => {
    // arrange

    // assert
    expect(component.model.dateFrom).toBe('20180905');
    expect(component.model.dateTo).toBe('20181005');
    expect(component.model.transactionType).toBe(TransactionTypeEnum.All);
  });

  it('should set the page title', () => {
    expect(component.title).toBe('View corporate account statement');
    expect(component.defaultPageNumber).toBe(1);
  });



  describe('ngOnInit', () => {
    let routerParameterService: RouteParametersService;

    beforeEach(inject([RouteParametersService],
      (
        _routerParameterService: RouteParametersService
      ) => {
        routerParameterService = _routerParameterService;
        (routerParameterService.getRouteParameter as jasmine.Spy).and.returnValue('1234');
      }));

    it('should set account on init', () => {
      // arrange
      (component.ngOnInit as jasmine.Spy).and.callThrough();
      // act
      component.ngOnInit();

      // assert
      expect(component.model.account).toEqual('1234');
      expect(routerParameterService.getRouteParameter).toHaveBeenCalledWith('accountNumber');
    });
  });

  describe('callService', () => {
    let resolver: (value?: any) => void;
    let financeApiService: FinanceApiService;

    beforeEach(inject([FinanceApiService, QueryParametersService],
      (
        _financeApiService: FinanceApiService,
        queryParamterService: QueryParametersService,
      ) => {
        spyOnProperty(queryParamterService, 'currentSearchPage', 'get').and.returnValue(100);

        financeApiService = _financeApiService;
        (financeApiService.getStatement as jasmine.Spy).and.returnValue(new Promise((r) => {
          resolver = r;
        }));
      }));

    it('should call the service', fakeAsync(() => {
      // arrange
      const expectedResult = {} as ServiceResponse<ViewStatementResponse>;
      component.model.dateFrom = 'from';
      component.model.dateTo = 'to';
      component.model.account = '1234';
      component.model.transactionType = TransactionTypeEnum.Cleared;

      const submitModel = new GetViewCorporateStatementRequest();
      submitModel.accountNumber = '1234';
      submitModel.pageNumber = 100;
      submitModel.dateFrom = component.model.dateFrom;
      submitModel.dateTo = component.model.dateTo;
      submitModel.sortOrder = component.model.sortOrder;
      submitModel.transactionType = component.model.transactionType;

      // act
      let result: ServiceResponse<ViewStatementResponse>;
      component.callService().then((r) => {
        result = r;
      });
      resolver(expectedResult);
      tick();

      // assert
      expect(result).toBe(expectedResult);
      expect(financeApiService.getStatement)
        .toHaveBeenCalledWith(submitModel);
    }));
  });

  describe('geExportData', () => {
    let resolvers: ((value?: any) => void)[];
    let financeApiService: FinanceApiService;

    beforeEach(inject([FinanceApiService, RouteParametersService],
      (
        _financeApiService: FinanceApiService,
      ) => {

        resolvers = [];

        financeApiService = _financeApiService;
        (financeApiService.getStatement as jasmine.Spy).and.callFake(() => {
          return new Promise((r) => {
            resolvers.push(r);
          });
        });

        component.model = new CorporateStatementSearch();
        component.model.dateFrom = 'from';
        component.model.dateTo = 'to';
        component.model.account = '1234';
        component.model.sortOrder = SortOrderEnum.Ascending;
        component.model.transactionType = TransactionTypeEnum.Cleared;
      }));

    it('should call api for all pages', fakeAsync(() => {

      // arrange
      const expectedModel = new GetViewCorporateStatementRequest();
      expectedModel.dateFrom = 'from';
      expectedModel.dateTo = 'to';
      expectedModel.sortOrder = SortOrderEnum.Ascending;
      expectedModel.transactionType = TransactionTypeEnum.Cleared;
      expectedModel.pageNumber = 1;
      expectedModel.accountNumber = '1234';

      // act
      let exportResults: ServiceResponse<ClearedTransaction[]>;
      component.getExportData<ClearedTransaction>().then((result) => {
        exportResults = result;
      });

      tick();

      expect(component.exportDataProgress).toBe(0.1);
      expect(component.downloadFileName).toBe('statement_1234');

      expect(financeApiService.getStatement).toHaveBeenCalledWith(expectedModel);
      resolvers[0]({
        success: true,
        data: {
          data: {
            pageNumber: 1,
            totalPages: 2,
            clearedTransactions: [{ transactionId: 1 }, { transactionId: 2 }],
            unClearedTransactions: [{ transactionId: 3 }, { transactionId: 4 }]
          }
        }
      });

      tick();

      expect(component.exportDataProgress).toBe(1);
      expectedModel.pageNumber = 2;
      expect(financeApiService.getStatement).toHaveBeenCalledWith(expectedModel);
      resolvers[1]({
        success: true,
        data: {
          data: {
            pageNumber: 1,
            totalPages: 2,
            clearedTransactions: [{ transactionId: 5 }, { transactionId: 6 }],
            unClearedTransactions: [{ transactionId: 7 }, { transactionId: 8 }]
          }
        }
      });
      tick();

      // assert
      expect(exportResults.success).toBeTruthy();
      expect(exportResults.error).toBeUndefined();
      expect(exportResults.data.length).toEqual(8);
      expect(exportResults.data[0].transactionId).toEqual(3);
      expect(exportResults.data[1].transactionId).toEqual(4);
      expect(exportResults.data[2].transactionId).toEqual(7);
      expect(exportResults.data[3].transactionId).toEqual(8);
      expect(exportResults.data[4].transactionId).toEqual(1);
      expect(exportResults.data[5].transactionId).toEqual(2);
      expect(exportResults.data[6].transactionId).toEqual(5);
      expect(exportResults.data[7].transactionId).toEqual(6);

    }));

    it('should call handle first page error', fakeAsync(() => {
      // act
      let exportResults: ServiceResponse<{}[]>;
      component.getExportData().then((result) => {
        exportResults = result;
      });

      tick();

      const error = { message: 'test' };
      resolvers[0]({
        success: false,
        error: error
      });

      tick();

      // assert
      expect(exportResults).toEqual({
        success: false,
        error: error,
        data: []
      } as ServiceResponse<{}[]>);
    }));


    it('should call handle second page error', fakeAsync(() => {
      // act
      let exportResults: ServiceResponse<ClearedTransaction[]>;
      component.getExportData<ClearedTransaction>().then((result) => {
        exportResults = result;
      });

      tick();
      resolvers[0]({
        success: true,
        data: {
          data: {
            pageNumber: 1,
            totalPages: 100,
            clearedTransactions: [{ transactionId: 1 }, { transactionId: 2 }],
            unClearedTransactions: [{ transactionId: 3 }, { transactionId: 4 }]
          }
        }
      });

      tick();
      const error = { message: 'test' };
      resolvers[1]({
        success: false,
        error: error
      });
      tick();

      // assert
      expect(exportResults.success).toBeFalsy();
      expect(exportResults.error).toEqual(error as any);
      expect(exportResults.data.length).toEqual(4);
      expect(exportResults.data[0].transactionId).toEqual(3);
      expect(exportResults.data[1].transactionId).toEqual(4);
      expect(exportResults.data[2].transactionId).toEqual(1);
      expect(exportResults.data[3].transactionId).toEqual(2);
    }));

    it('should call handle cancels', fakeAsync(() => {
      // act
      let exportResults: ServiceResponse<ClearedTransaction[]>;
      component.getExportData<ClearedTransaction>().then((result) => {
        exportResults = result;
      });

      tick();
      resolvers[0]({
        success: true,
        data: {
          data: {
            pageNumber: 1,
            totalPages: 100,
            clearedTransactions: [{ transactionId: 1 }, { transactionId: 2 }],
            unClearedTransactions: [{ transactionId: 3 }, { transactionId: 4 }]
          }
        }
      });

      tick();
      component.cancelDownload();
      resolvers[1]({
        success: true,
        data: {
          data: {
            pageNumber: 1,
            totalPages: 2,
            clearedTransactions: [{ transactionId: 5 }, { transactionId: 6 }],
            unClearedTransactions: [{ transactionId: 7 }, { transactionId: 8 }]
          }
        }
      });
      tick();

      // assert
      expect(exportResults.success).toBeFalsy();
      expect(exportResults.error).toEqual(new HttpErrorResponse({ status: -1, statusText: 'Aborted' }));
      expect(exportResults.data.length).toEqual(8);
      expect(exportResults.data[0].transactionId).toEqual(3);
      expect(exportResults.data[1].transactionId).toEqual(4);
      expect(exportResults.data[2].transactionId).toEqual(7);
      expect(exportResults.data[3].transactionId).toEqual(8);
      expect(exportResults.data[4].transactionId).toEqual(1);
      expect(exportResults.data[5].transactionId).toEqual(2);
      expect(exportResults.data[6].transactionId).toEqual(5);
      expect(exportResults.data[7].transactionId).toEqual(6);
    }));
  });

  describe('fieldOptionsOverrides', () => {
    let referenceDataService: ReferenceDataService;
    beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
      referenceDataService = _referenceDataService;
    }));
    it('should get only corporate accounts for from account', fakeAsync(() => {
      // arrange
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        r({
          financeBeneficiariesDAOList: [
            {
              accountNumber: '1',
              accountType: FinanceAccountTypeEnum.CorpPlus
            } as FinanceBeneficiary,
            {
              accountNumber: '2',
              accountType: FinanceAccountTypeEnum.External
            } as FinanceBeneficiary
          ]
        });
      }));

      // act
      let data: FinanceBeneficiary[];
      component.fieldOptionsOverrides[0].getDataMethod().then((r) => {
        data = r;
      });
      tick();

      // assert
      expect(referenceDataService.getAll).toHaveBeenCalledWith({
        endpoint: 'getFinanceBeneficiary/all',
        type: GetFinanceBeneficiaryResponse,
      });

      expect(data).toEqual([
        {
          accountNumber: '1',
          accountType: FinanceAccountTypeEnum.CorpPlus
        } as FinanceBeneficiary]);
    }));

    it('should get handle null from api', fakeAsync(() => {
      // arrange
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(null);
      }));

      // act
      let data: FinanceBeneficiary[];
      component.fieldOptionsOverrides[0].getDataMethod().then((r) => {
        data = r;
      });
      tick();

      // assert
      expect(data).toEqual([]);
    }));
  });
});

