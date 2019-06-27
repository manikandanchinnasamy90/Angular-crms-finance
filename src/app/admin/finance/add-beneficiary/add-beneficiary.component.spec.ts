import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { AddBeneficiaryComponent, AddCorpPlusComponent } from './add-beneficiary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplayHelpersModule, PanelWrapperComponent, FormPropertiesService } from '../../display-helpers/display-helpers.module';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FinanceApiService, ServiceResponse, Result, AddFinanceBeneficiaryRequest } from '../../resources/bank-api/bank-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { FinanceAccountTypeEnum, GetBankCodesResponse } from '../../resources/reference-api/reference-api.module';
import { Observable, Subscriber } from 'rxjs';

describe('AddBeneficiaryComponent', () => {
  let component: AddBeneficiaryComponent;
  let fixture: ComponentFixture<AddBeneficiaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddBeneficiaryComponent, AddCorpPlusComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DisplayHelpersModule,
        FormlyModule.forRoot({
          wrappers: [
            { name: 'panel', component: PanelWrapperComponent },
          ],
        }),
        FormlyBootstrapModule,
      ],
      providers: [
        {
          provide: FinanceApiService,
          useValue: jasmine.createSpyObj(['addFinanceBeneficiary'])
        },
        {
          provide: FormPropertiesService,
          useValue: jasmine.createSpyObj(['displayToFormProperties', 'getFormOptionsForField'])
        },
        {
          provide: ReferenceDataService,
          useValue: jasmine.createSpyObj(['getAll'])
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBeneficiaryComponent);
    component = fixture.componentInstance;
    spyOn(component, 'ngOnInit').and.stub();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should set model and header', () => {
    expect(component.model instanceof AddFinanceBeneficiaryRequest).toBeTruthy();
    expect(component.title).toBe('Add finance beneficiary');
  });

  describe('callService', () => {
    let resolver: (value?: any) => void;
    let apiService: FinanceApiService;

    beforeEach(inject([FinanceApiService], (_apiService: FinanceApiService) => {
      apiService = _apiService;
      (apiService.addFinanceBeneficiary as jasmine.Spy).and.returnValue(new Promise((r) => {
        resolver = r;
      }));
    }));

    it('should  call the service', fakeAsync(() => {
      const expectedResult = {} as ServiceResponse<Result>;

      // act
      let result: ServiceResponse<Result>;
      component.callService().then((r) => {
        result = r;
      });
      resolver(expectedResult);
      tick();

      // assert
      expect(result).toBe(expectedResult);
      expect(apiService.addFinanceBeneficiary).toHaveBeenCalledWith(component.model);
    }));

    it('should set account type for external accounts', () => {
      // act
      component.callService();

      // assert
      expect(component.model.accountType).toBe(FinanceAccountTypeEnum.External);
      expect(apiService.addFinanceBeneficiary).toHaveBeenCalledWith(component.model);
    });

    it('should set account type for sasfin accounts', () => {
      // arramge
      component.model.bankCode = 'BL00059';
      // act
      component.callService();

      // assert
      expect(component.model.accountType).toBe(FinanceAccountTypeEnum.Internal);
      expect(apiService.addFinanceBeneficiary).toHaveBeenCalledWith(component.model);
    });

    it('should not account type set if set', () => {
      // arramge
      component.model.bankCode = 'BL00059';
      component.model.accountType = FinanceAccountTypeEnum.External;
      // act
      component.callService();

      // assert
      expect(component.model.accountType).toBe(FinanceAccountTypeEnum.External);
      expect(apiService.addFinanceBeneficiary).toHaveBeenCalledWith(component.model);
    });
  });

  describe('ngOnInit', () => {
    let formPropertiesService: FormPropertiesService;
    let branchCodeField: FormlyFieldConfig;
    let referenceApiService: ReferenceDataService;
    let resolver: Subscriber<{}>;
    beforeEach(inject([FormPropertiesService, ReferenceDataService],
      (
        _formPropertiesService: FormPropertiesService,
        _referenceApiService: ReferenceDataService
      ) => {
        (component.ngOnInit as jasmine.Spy).and.callThrough();

        formPropertiesService = _formPropertiesService;
        referenceApiService = _referenceApiService;

        branchCodeField = {
          formControl: jasmine.createSpyObj(['setValue'])
        } as any;
        (formPropertiesService.getFormOptionsForField as jasmine.Spy).and.returnValue(branchCodeField);

        (referenceApiService.getAll as jasmine.Spy).and.returnValue({
          data: {
            bankCodes: [
              { bankCode: 1, universalBranchCode: 1 },
              { bankCode: 2, universalBranchCode: null },
            ]
          }
        });

        spyOnProperty(component, 'modelChanges', 'get').and.returnValue(new Observable((r) => { resolver = r; }));
      }));

    it('should set branch code when bank changes', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      // act
      resolver.next({ bankCode: 1 });
      expect(branchCodeField.formControl.setValue).not.toHaveBeenCalled();
      tick();

      // assert
      expect(branchCodeField.formControl.setValue).toHaveBeenCalledWith(1);
      expect(formPropertiesService.getFormOptionsForField).toHaveBeenCalledWith(component, 'branchCode');
      expect(referenceApiService.getAll).toHaveBeenCalledWith({
        endpoint: 'bankCodes',
        type: GetBankCodesResponse,
      });

    }));

    it('should set when bank does not change', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      // act
      resolver.next({ bankCode: 1 });
      tick();
      resolver.next({ bankCode: 1 });
      tick();
      resolver.next({ bankCode: 1 });
      tick();

      // assert
      expect(branchCodeField.formControl.setValue).toHaveBeenCalledWith(1);
    }));

    it('should set null when universal branch code is not available', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      // act
      resolver.next({ bankCode: 2 });
      tick();

      // assert
      expect(branchCodeField.formControl.setValue).toHaveBeenCalledWith(null);
    }));

    it('should not set universal branch code if bank not available', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      // act
      resolver.next({ bankCode: 3 });
      tick();

      // assert
      expect(branchCodeField.formControl.setValue).not.toHaveBeenCalled();
    }));

    it('should not set after destroy', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      component.ngOnDestroy();

      // act
      resolver.next({ bankCode: 1 });
      tick();

      // assert
      expect(branchCodeField.formControl.setValue).not.toHaveBeenCalled();
    }));
  });

  describe('AddCorpPlusComponent', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AddCorpPlusComponent);
      component = fixture.componentInstance;
      spyOn(component, 'ngOnInit').and.stub();
      fixture.detectChanges();
    });

    it('should set title and account type', fakeAsync(() => {
      // arrange
      (component.ngOnInit as jasmine.Spy).and.callThrough();

      // act
      component.ngOnInit();
      tick();

      // assert
      expect(component.title).toBe('Add corporate plus account');
      expect(component.model.accountType).toBe(FinanceAccountTypeEnum.CorpPlus);
    }));
  });

});
