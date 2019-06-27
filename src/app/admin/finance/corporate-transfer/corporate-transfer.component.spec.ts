import { async, ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { CorporateTransferBaseComponent, CorporateTransferComponent } from './corporate-transfer.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DisplayHelpersModule, PanelWrapperComponent, FormPropertiesService } from '../../display-helpers/display-helpers.module';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import {
  FinanceApiService,
  NotificationTypeEnum,
  CorporatePlusMultipleOnceOffPaymentsRequest,
  CorporatePlusMultipleOnceOffPaymentsItem
} from '../../resources/bank-api/bank-api.module';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { CorporateTransfer } from '../models/corporate-transfer';
import {
  FinanceAccountTypeEnum,
  FinanceBeneficiary
} from '../../resources/reference-api/reference-api.module';
import { Observable, Subscriber } from 'rxjs';
import { BeneficiaryTransfer } from '../models/beneficiary-transfer';
import { BeneficiaryTransferList } from '../models/beneficiary-transfer-list';
import { DisplayOptions } from '../../display-decorators/models/export-models';
import { ModelHelper } from '../../display-decorators/display-decorators.module';
import { CorporateTransferList } from '../models/corporate-transfer-list';

describe('CorporateTransferBaseComponent', () => {
  let component: CorporateTransferBaseComponent;
  let fixture: ComponentFixture<CorporateTransferBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        DisplayHelpersModule,
        FormlyModule.forRoot({
          wrappers: [
            { name: 'panel', component: PanelWrapperComponent },
          ],
        }),
        FormlyBootstrapModule
      ],
      providers: [
        {
          provide: FinanceApiService,
          useValue: jasmine.createSpyObj(['corporatePlusMultiPayments']),
        },
        {
          provide: ReferenceDataService,
          useValue: jasmine.createSpyObj(['getAll']),
        },
      ],
      declarations: [CorporateTransferBaseComponent, CorporateTransferComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateTransferBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set model and title', () => {
    // assert
    expect(component.isInterAccountTransfer).toBeFalsy();
    expect(component.title).toBe('Beneficiary payment');
    expect(component.buttonText).toBe('Process payments');
    expect(component.model instanceof BeneficiaryTransferList).toBeTruthy();
  });

  it('should start with one payment in the list', () => {
    expect(component.model.transfers).toEqual([new BeneficiaryTransfer()]);
  });

  describe('from account validations', () => {
    let formControl: DisplayOptions;
    let modelChanges: Subscriber<any>;
    let formControlSpy;
    let fieldConfig: FormlyFieldConfig;

    beforeEach(() => {
      formControl = ModelHelper.GetDisplayProperties(new BeneficiaryTransfer()).filter((c) => c.key === 'fromAccount')[0];

      formControlSpy = jasmine.createSpyObj(['setErrors']);
      fieldConfig = {
        form: {
          valueChanges: new Observable((r) => modelChanges = r),

        } as any,
        hooks: {},
        formControl: formControlSpy
      };

      formControl.hooks.afterViewInit(fieldConfig);

    });

    it('should be setup correctly', () => {
      // assert
      expect(formControl.validators.equalToTo.message()).toEqual('From and to accounts have to be different');
      expect(formControl.validators.equalToTo.expression()).toBeTruthy();
    });

    it('should clear errors if not the same as from account', fakeAsync(() => {
      // arrange

      const value = {
        fromAccount: '1234',
        toAccount: '456'
      };

      // act
      modelChanges.next(value);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledWith(null);
    }));

    it('should set errors if the same as from account', fakeAsync(() => {
      // arrange

      const value = {
        fromAccount: '1234',
        toAccount: '1234'
      };
      // act
      modelChanges.next(value);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledWith({ equalToTo: true });
    }));

    it('should clear errors if to account is null', fakeAsync(() => {
      // arrange
      const value = {
        fromAccount: '1234',
      };

      // act
      modelChanges.next(value);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledWith(null);
    }));

    it('should clear errors if value is null', fakeAsync(() => {
      // arrange

      // act
      modelChanges.next(null);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledWith(null);
    }));

    it('should set required error if to from is null', fakeAsync(() => {
      // arrange
      const value = {
        toAccount: '1234'
      };

      // act
      modelChanges.next(value);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledWith({ required: true });
    }));

    it('should unsubscribe changes on destroy', fakeAsync(() => {
      // arrange
      const value = {
        toAccount: '1234'
      };

      // act
      modelChanges.next(value);
      tick();
      formControl.hooks.onDestroy(fieldConfig);
      modelChanges.next(null);
      tick();
      modelChanges.next(null);
      tick();
      modelChanges.next(null);
      tick();

      // assert
      expect(formControlSpy.setErrors).toHaveBeenCalledTimes(1);
    }));
  });

  describe('modelChanges', () => {
    let modelHandler: Subscriber<CorporateTransferList>;
    let itemHandler: Subscriber<CorporateTransfer>;
    let fromAccountControl: FormControl;
    let toAccountControl: FormControl;

    beforeEach(inject([ReferenceDataService, FormPropertiesService],
      (referenceDataService: ReferenceDataService) => {
        (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
          r({
            financeBeneficiariesDAOList: [
              {
                accountNumber: '1',
                accountType: FinanceAccountTypeEnum.CorpPlus,
                fromReference: 'from ref 1',
                toReference: 'to ref 1',
              } as FinanceBeneficiary,
              {
                accountNumber: '2',
                accountType: FinanceAccountTypeEnum.External,
                fromReference: 'from ref 2',
                toReference: 'to ref 2',
              } as FinanceBeneficiary
            ]
          });
        }));

        spyOnProperty(component, 'modelChanges', 'get').and.callFake(() => {
          return new Observable((o) => {
            modelHandler = o;
          });
        });

        fromAccountControl = jasmine.createSpyObj(['setValue']);
        toAccountControl = jasmine.createSpyObj(['setValue']);

        component.form = {
          controls: {
            form: {
              controls: {
                transfers: {
                  controls: [{
                    controls: {
                      toReference: toAccountControl,
                      fromReference: fromAccountControl,
                    },
                    value: {

                    },
                    valueChanges: new Observable((o) => {
                      itemHandler = o;
                    })
                  }]
                }
              }
            }
          }
        } as any;
      }));

    it('should set reference when selecting to account', fakeAsync(() => {
      component.ngOnInit();
      tick();
      modelHandler.next({ transfers: [{}] } as any);
      tick();

      // arrange
      const model = new CorporateTransfer();
      model.toAccount = '1';

      // act
      itemHandler.next(model);
      tick();

      // assert
      expect((toAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('to ref 1');
      expect((fromAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('from ref 1');
    }));

    it('should set reference when changing to account', fakeAsync(() => {
      component.ngOnInit();
      tick();
      modelHandler.next({ transfers: [{}] } as any);
      tick();

      // arrange
      const model = new CorporateTransfer();
      model.toAccount = '1';

      (toAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.toReference = v;
      });

      (fromAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.fromReference = v;
      });

      // act
      itemHandler.next(Object.assign({}, model));
      tick();

      model.toAccount = '2';
      itemHandler.next(Object.assign({}, model));
      tick();

      // assert
      expect((toAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('to ref 2');
      expect((fromAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('from ref 2');
    }));

    it('should set not change when the reference was changes', fakeAsync(() => {
      component.ngOnInit();
      tick();
      modelHandler.next({ transfers: [{}] } as any);
      tick();

      // arrange
      const model = new CorporateTransfer();
      model.toAccount = '1';

      (toAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.toReference = v;
      });
      (fromAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.fromReference = v;
      });

      // act
      itemHandler.next(Object.assign({}, model));
      tick();

      model.fromReference = 'from ref changed';
      itemHandler.next(Object.assign({}, model));
      tick();

      model.toReference = 'to ref changed';
      itemHandler.next(Object.assign({}, model));
      tick();

      model.toAccount = '2';
      itemHandler.next(Object.assign({}, model));
      tick();

      // assert
      expect((toAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('to ref 1');
      expect((fromAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual('from ref 1');
      expect(model.fromReference).toBe('from ref changed');
      expect(model.toReference).toBe('to ref changed');
    }));

    it('should set handle unknown accounts', fakeAsync(() => {
      component.ngOnInit();
      tick();
      modelHandler.next({ transfers: [{}] } as any);
      tick();

      // arrange
      const model = new CorporateTransfer();
      model.toAccount = '3';

      // act
      itemHandler.next(Object.assign({}, model));
      tick();

      // assert
      expect((toAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual(null);
      expect((fromAccountControl.setValue as jasmine.Spy).calls.mostRecent().args[0]).toEqual(null);
    }));

    it('should not handle changes after destroy', fakeAsync(() => {
      component.ngOnInit();
      tick();
      modelHandler.next({ transfers: [{}] } as any);
      tick();

      // arrange
      const model = new CorporateTransfer();
      model.toAccount = '1';

      (toAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.toReference = v;
      });
      (fromAccountControl.setValue as jasmine.Spy).and.callFake((v) => {
        model.fromReference = v;
      });

      // act
      component.ngOnDestroy();
      itemHandler.next(Object.assign({}, model));
      tick();

      // assert
      expect(toAccountControl.setValue).not.toHaveBeenCalled();
      expect(fromAccountControl.setValue).not.toHaveBeenCalled();
    }));

    it('should handle destroy without subscribe', () => {
      // expect not to throw
      component.ngOnDestroy();
    });
  });

  describe('callService', () => {
    let financeApiService: FinanceApiService;
    beforeEach(inject([FinanceApiService, ReferenceDataService],
      (_financeApiService: FinanceApiService, referenceDataService: ReferenceDataService) => {
        financeApiService = _financeApiService;

        (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
          r({
            financeBeneficiariesDAOList: [
              {
                accountNumber: '1',
                accountType: FinanceAccountTypeEnum.CorpPlus,
                fromReference: 'from ref 1',
                toReference: 'to ref 1',
                bankCode: 'BL001',
                branchCode: 1234,
              } as FinanceBeneficiary,
              {
                accountNumber: 'noRef',
                accountType: FinanceAccountTypeEnum.CorpPlus,
                bankCode: 'BL001',
                branchCode: 1234,
              } as FinanceBeneficiary,
              {
                accountNumber: 'noRef6789012345678',
                accountType: FinanceAccountTypeEnum.CorpPlus,
                bankCode: 'BL001',
                branchCode: 1234,
              } as FinanceBeneficiary,
              {
                accountNumber: '2',
                accountType: FinanceAccountTypeEnum.External,
                accountName: 'test name',
                fromReference: 'from ref 2',
                toReference: 'to ref 2',
                bankCode: 'BL001',
                branchCode: 1234,
                accountTypeCode: 1
              } as FinanceBeneficiary
            ]
          });
        }));
      }));

    it('should call the api with correct model', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      (financeApiService.corporatePlusMultiPayments as jasmine.Spy).and.returnValue((new Promise((r) => { r({ a: 1 }); })));
      const newItem = new BeneficiaryTransfer();
      newItem.amount = 1;
      newItem.toAccount = '2';
      newItem.fromAccount = '1';
      newItem.fromReference = 'test ref from';
      newItem.toReference = 'test ref to';
      newItem.notificationType = NotificationTypeEnum.Email;
      component.model.transfers[0] = newItem;
      // act
      let result: any;
      component.callService().then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result).toEqual({ a: 1 });
      const expectedCall = new CorporatePlusMultipleOnceOffPaymentsRequest();
      expectedCall.listOfPayments = [];
      expectedCall.listOfPayments.push(new CorporatePlusMultipleOnceOffPaymentsItem());
      expectedCall.listOfPayments[0].toAccountNumber = '2';
      expectedCall.listOfPayments[0].toAccountTypeCode = 1;
      expectedCall.listOfPayments[0].toBankCode = 'BL001';
      expectedCall.listOfPayments[0].toBranchCode = '1234';
      expectedCall.listOfPayments[0].amount = 1;
      expectedCall.listOfPayments[0].fromReference = 'test ref from';
      expectedCall.listOfPayments[0].toReference = 'test ref to';
      expectedCall.listOfPayments[0].fromAccount = '1';
      expectedCall.listOfPayments[0].notificationType = NotificationTypeEnum.Email;

      expect(financeApiService.corporatePlusMultiPayments).toHaveBeenCalledWith(expectedCall);
    }));

    it('should log error when to account does not exist', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      spyOn(console, 'error').and.stub();

      (financeApiService.corporatePlusMultiPayments as jasmine.Spy).and.returnValue((new Promise((r) => { r({ a: 1 }); })));
      const newItem = new BeneficiaryTransfer();
      newItem.amount = 1;
      newItem.toAccount = '3';
      newItem.fromAccount = '1';
      newItem.fromReference = 'test ref from';
      newItem.toReference = 'test ref to';
      newItem.notificationType = NotificationTypeEnum.Email;
      component.model.transfers.push(newItem);


      // act
      let result: any;
      component.callService().then((r) => {
        result = r;
      });
      tick();

      // assert
      expect(result).toBeUndefined();
      expect(financeApiService.corporatePlusMultiPayments).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Could not find account with number 3');
    }));

    it('should set default from reference for inter account transfers', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      (financeApiService.corporatePlusMultiPayments as jasmine.Spy).and.returnValue((new Promise((r) => { r({ a: 1 }); })));

      const newItem = new BeneficiaryTransfer();
      newItem.amount = 1;
      newItem.toAccount = 'noRef';
      newItem.fromAccount = '1';
      newItem.toReference = 'test ref to';
      newItem.notificationType = NotificationTypeEnum.Email;
      component.model.transfers[0] = newItem;

      spyOnProperty(component, 'isInterAccountTransfer', 'get').and.returnValue('true');
      // act
      component.callService();
      tick();

      // assert

      expect((financeApiService.corporatePlusMultiPayments as jasmine.Spy).calls.mostRecent().args[0].listOfPayments[0].fromReference)
        .toBe('To noRef');
    }));

    it('should set default from reference for inter account transfers not longer than 20 characters', fakeAsync(() => {
      // arrange
      component.ngOnInit();
      tick();

      (financeApiService.corporatePlusMultiPayments as jasmine.Spy).and.returnValue((new Promise((r) => { r({ a: 1 }); })));

      const newItem = new BeneficiaryTransfer();
      newItem.amount = 1;
      newItem.toAccount = 'noRef6789012345678';
      newItem.fromAccount = '1';
      newItem.toReference = 'test ref to';
      newItem.notificationType = NotificationTypeEnum.Email;
      component.model.transfers[0] = newItem;


      spyOnProperty(component, 'isInterAccountTransfer', 'get').and.returnValue('true');
      // act
      component.callService();
      tick();

      // assert
      expect((financeApiService.corporatePlusMultiPayments as jasmine.Spy).calls.mostRecent().args[0].listOfPayments[0].fromReference)
        .toBe('To noRef678901234567');
    }));
  });

  describe('CorporateTransferComponent', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CorporateTransferComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set model and title', () => {
      // assert
      expect(component.isInterAccountTransfer).toBeTruthy();
      expect(component.title).toBe('Inter-account transfer');
      expect(component.buttonText).toBe('Process transfers');
      expect(component.model instanceof CorporateTransferList).toBeTruthy();
    });

    it('should start with one payment in the list', () => {
      expect(component.model.transfers).toEqual([new CorporateTransfer()]);
    });

    describe('fieldOptionsOverrides', () => {
      beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
      }));
    });
  });
});
