import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';

import { ViewBeneficiariesListComponent } from './view-beneficiaries.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplayHelpersModule, PanelWrapperComponent } from '../../display-helpers/display-helpers.module';
import { NgbProgressbarModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import {
  FinanceApiService,
  ServiceResponse,
  AddFinanceBeneficiaryRequest,
  Result,
  DeleteFinanceBeneficiaryRequest
} from '../../resources/bank-api/bank-api.module';
import { FinanceBeneficiaryList } from '../models/finance-beneficiary-list';
import { GetFinanceBeneficiaryResponse, FinanceAccountTypeEnum } from '../../resources/reference-api/reference-api.module';
import { Scopes } from 'src/app/scopes.enum';
import { HttpErrorResponse } from '@angular/common/http';

describe('ViewBeneficiariesComponent', () => {
  let component: ViewBeneficiariesListComponent<FinanceBeneficiaryList>;
  let fixture: ComponentFixture<ViewBeneficiariesListComponent<FinanceBeneficiaryList>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewBeneficiariesListComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DisplayHelpersModule,
        NgbProgressbarModule,
        NgbAlertModule,
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
          provide: ReferenceDataService,
          useValue: jasmine.createSpyObj(['getAll'])
        },
        {
          provide: FinanceApiService,
          useValue: jasmine.createSpyObj(['deleteFinanceBeneficiary'])
        }
      ]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBeneficiariesListComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit').and.stub();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('callService', () => {
    let referenceDataService: ReferenceDataService;
    let referenceDataResult: FinanceBeneficiaryList;
    beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
      referenceDataService = _referenceDataService;
      referenceDataResult = new FinanceBeneficiaryList();

      const item = new AddFinanceBeneficiaryRequest();
      item.accountName = 'test account';
      item.accountType = FinanceAccountTypeEnum.Internal;

      const item2 = new AddFinanceBeneficiaryRequest();
      item2.accountName = 'test account2';
      item2.accountType = FinanceAccountTypeEnum.External;

      const item3 = new AddFinanceBeneficiaryRequest();
      item3.accountName = 'test account3';
      item3.accountType = FinanceAccountTypeEnum.CorpPlus;

      referenceDataResult.financeBeneficiariesDAOList = [
        item,
        item2,
        item3
      ];
      referenceDataResult.result = new Result();
      referenceDataResult.result.responseCode = '0';
      referenceDataResult.result.responseDescription = 'Success';
    }));

    it('should call reference data service, and translate result', fakeAsync(() => {
      // arrange
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(referenceDataResult);
      }));

      // act
      let result: ServiceResponse<FinanceBeneficiaryList> = null;
      component.callService('').then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result.success).toBeTruthy();
      expect(result.error).toBeNull();
      expect(result.data.result).toEqual(referenceDataResult.result);
      expect(result.data.financeBeneficiariesDAOList).toEqual([
        referenceDataResult.financeBeneficiariesDAOList[0],
        referenceDataResult.financeBeneficiariesDAOList[1]
      ]);
      expect(referenceDataService.getAll).toHaveBeenCalledWith(
        {
          endpoint: 'getFinanceBeneficiary/all',
          type: GetFinanceBeneficiaryResponse,
          skipCache: false
        }
      );
    }));

    it('should handle null from reference data', fakeAsync(() => {
      // arrange
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(null);
      }));

      // act
      let result: ServiceResponse<FinanceBeneficiaryList> = null;
      component.callService('').then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result.success).toBeFalsy();
      expect(result.error.statusText).toEqual('Could not load beneficiaries from reference data API');
      expect(result.data).toBeNull();
    }));

    it('should call skip cache when refreshing', fakeAsync(() => {
      // arrange
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(referenceDataResult);
      }));
      (component.ngOnInit as jasmine.Spy).and.callThrough();

      // act
      component.refresh();
      tick();

      // assert
      expect(referenceDataService.getAll).toHaveBeenCalledWith(
        {
          endpoint: 'getFinanceBeneficiary/all',
          type: GetFinanceBeneficiaryResponse,
          skipCache: true
        }
      );
    }));
  });

  describe('actionOptions', () => {

    let financeApiService: FinanceApiService;
    beforeEach(inject([FinanceApiService], (_financeApiService: FinanceApiService) => {
      financeApiService = _financeApiService;

    }));

    it('should be setup correctly', () => {
      expect(component.actionOptions[0].buttonClass).toBe('btn-danger');
      expect(component.actionOptions[0].buttonText).toBe('Delete beneficiary');
      expect(component.actionOptions[0].scope).toBe(Scopes.DeleteFinanceBeneficiary);
      expect(component.actionOptions[0].navigationObject).toBe(AddFinanceBeneficiaryRequest);
    });

    it('should call delete api', fakeAsync(() => {
      // arrange
      const apiResult: ServiceResponse<Result> = {
        success: true,
        data: { responseCode: '0', responseDescription: 'Success' } as Result,
        error: null
      };
      (financeApiService.deleteFinanceBeneficiary as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(apiResult);
      }));

      // act
      let result = null;
      (component.actionOptions[0].handler({ accountNumber: '1234' } as any) as Promise<string | boolean>).then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result).toBeTruthy();

      const requestBody = new DeleteFinanceBeneficiaryRequest();
      requestBody.accountNumber = '1234';
      expect(financeApiService.deleteFinanceBeneficiary).toHaveBeenCalledWith(requestBody);
    }));

    it('should handle error scenario', fakeAsync(() => {
      // arrange
      const apiResult: ServiceResponse<Result> = {
        success: false,
        data: null,
        error: { message: 'test' } as HttpErrorResponse
      };
      (financeApiService.deleteFinanceBeneficiary as jasmine.Spy).and.returnValue(new Promise((r) => {
        r(apiResult);
      }));

      // act
      let result = null;
      (component.actionOptions[0].handler({ accountNumber: '1234' } as any) as Promise<string | boolean>).then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result).toEqual('test');
    }));
  });
});
