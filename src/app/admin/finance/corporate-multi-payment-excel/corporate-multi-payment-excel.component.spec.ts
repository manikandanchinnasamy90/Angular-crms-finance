import { async, ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';

import { CorporateMultiPaymentExcelComponent } from './corporate-multi-payment-excel.component';
import { IActionOptions } from '../../display-helpers/display-helpers.module';
import { Component, Input, ElementRef } from '@angular/core';
import { DisplayOptions } from '../../display-decorators/models/export-models';
import * as xlsx from 'xlsx';
import {
  CorporatePlusMultipleOnceOffPaymentsItem,
  FinanceApiService,
  CorporatePlusMultipleOnceOffPaymentsRequest,
  NotificationTypeEnum
} from '../../resources/bank-api/bank-api.module';
import { CorporatePlusMultipleOnceOffPaymentsItemResults } from '../models/corporate-plus-multiple-once-off-payments-item-results';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { GetBankCodesResponse, GetAccountTypesResponse } from '../../resources/reference-api/reference-api.module';

describe('CorporateMultiPaymentExcelComponent', () => {
  let component: CorporateMultiPaymentExcelComponent;
  let fixture: ComponentFixture<CorporateMultiPaymentExcelComponent>;

  beforeEach(async(() => {
    @Component({
      selector: 'app-view-class',
      template: ''
    })
    class ViewClassComponentStubComponent {
      @Input()
      public object: any;

      @Input()
      public displayName: string;

      @Input()
      public actionOptions: IActionOptions[];

      @Input()
      public metaData: Array<DisplayOptions>;
    }

    TestBed.configureTestingModule({
      declarations: [
        ViewClassComponentStubComponent,
        CorporateMultiPaymentExcelComponent
      ],
      providers: [
        {
          provide: FinanceApiService,
          useValue: jasmine.createSpyObj(['corporatePlusMultiPayments'])
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
    fixture = TestBed.createComponent(CorporateMultiPaymentExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('model should work', () => {
    const model = new CorporatePlusMultipleOnceOffPaymentsItemResults();
    expect(model.success).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openFile', () => {
    let event: Event;
    let mockReader: FileReader;
    beforeEach(inject([ReferenceDataService], (referenceDataService: ReferenceDataService) => {
      mockReader = jasmine.createSpyObj('FileReader', ['readAsBinaryString']);
      spyOn(window as any, 'FileReader').and.returnValue(mockReader);

      event = {
        target: {
          files: [{ fileName: 'test' }]
        }
      } as any as Event;

      spyOn(component as any, 'getBankCode').and.returnValue(
        new Promise((r) => {
          r('bank code');
        }));

      spyOn(component as any, 'getAccountType').and.returnValue(
        new Promise((r) => {
          r(999);
        }));
    }));
    it('should read the first file', () => {
      // act
      component.openFile(event);
      // assert
      expect(component.loadingFile).toBeTruthy();
      expect(mockReader.readAsBinaryString).toHaveBeenCalledWith((event.target as any).files[0]);
    });

    it('should check that files exist', () => {
      // arrange
      (event.target as any).files = undefined;
      (event.target as any).value = 'value';
      (event.target as any).defaultValue = 'defaultValue';

      // act
      component.openFile(event);

      // assert
      expect(component.loadingFile).toBeFalsy();
      expect((event.target as any).value).toBe('defaultValue');
      expect(mockReader.readAsBinaryString).not.toHaveBeenCalled();
    });

    it('should check that files is not false', () => {
      // arrange
      (event.target as any).files = false;
      (event.target as any).value = 'value';
      (event.target as any).defaultValue = 'defaultValue';

      // act
      component.openFile(event);

      // assert
      expect(component.loadingFile).toBeFalsy();
      expect((event.target as any).value).toBe('defaultValue');
      expect(mockReader.readAsBinaryString).not.toHaveBeenCalled();
    });

    it('should check that files have been added', () => {
      // arrange
      (event.target as any).files = [];
      (event.target as any).value = 'value';
      (event.target as any).defaultValue = 'defaultValue';

      // act
      component.openFile(event);

      // assert
      expect(component.loadingFile).toBeFalsy();
      expect((event.target as any).value).toBe('defaultValue');
      expect(mockReader.readAsBinaryString).not.toHaveBeenCalled();
    });

    it('should read the excel file', fakeAsync(() => {
      // arrange
      spyOn(component, 'getExcelData').and.returnValue([
        ['a', 'b', 'c'],
        ['fromAccNum1', 'toAccNum1', 'toBank1', 'toBranch1', 'toAccName1', 'toAccType1', 1, 'notType1', 'fromRef1', 'toRef1'],
        ['fromAccNum2', 'toAccNum2', 'toBank2', 'toBranch2', 'toAccName2', 'toAccType2', 2, 'notType2', 'fromRef2', 'toRef2'],
      ]);
      const xlsxFile = {};
      spyOn(xlsx, 'read').and.returnValue(xlsxFile);
      component.openFile(event);

      // act
      mockReader.onload({} as ProgressEvent);
      tick();
      // assert
      expect(component.getExcelData).toHaveBeenCalledWith(xlsxFile);
      const item1 = new CorporatePlusMultipleOnceOffPaymentsItem();
      item1.amount = 1;
      item1.fromAccount = 'fromAccNum1';
      item1.fromReference = 'fromRef1';
      item1.notificationType = 'notType1' as any;
      item1.toAccountName = 'toAccName1';
      item1.toAccountNumber = 'toAccNum1';
      item1.toAccountTypeCode = 999;
      item1.toBankCode = 'bank code';
      item1.toBranchCode = 'toBranch1';
      item1.toReference = 'toRef1';

      const item2 = new CorporatePlusMultipleOnceOffPaymentsItem();
      item2.amount = 2;
      item2.fromAccount = 'fromAccNum2';
      item2.fromReference = 'fromRef2';
      item2.notificationType = 'notType2' as any;
      item2.toAccountName = 'toAccName2';
      item2.toAccountNumber = 'toAccNum2';
      item2.toAccountTypeCode = 999;
      item2.toBankCode = 'bank code';
      item2.toBranchCode = 'toBranch2';
      item2.toReference = 'toRef2';

      expect(component.data.listOfPayments).toEqual([item1, item2]);
      expect(component['getBankCode']).toHaveBeenCalledWith('toBank1');
      expect(component['getBankCode']).toHaveBeenCalledWith('toBank2');
      expect(component['getAccountType']).toHaveBeenCalledWith('toAccType1');
      expect(component['getAccountType']).toHaveBeenCalledWith('toAccType2');
    }));

    it('should handle exceptions', () => {
      // arrange
      spyOn(component, 'getExcelData').and.returnValue([
        ['a', 'b', 'c'],
        ['0', '1', '2', '3', '4', '5', '6', 7, 8, '9', '10', '11'],
        ['10', '11', '12', '13', '14', '15', '16', 17, 18, '19', '110', '111'],
      ]);

      spyOn(xlsx, 'read').and.throwError('test');
      component.openFile(event);
      spyOn(console, 'error').and.stub();

      // act
      mockReader.onload({} as ProgressEvent);

      // assert
      expect((console.error as jasmine.Spy).calls.first().args[0].message).toEqual('test');
      expect(component.error).toEqual('File is not a valid excel file');
      expect(component.data.listOfPayments).toEqual([]);
    });

    describe('validation', () => {
      let elem: ElementRef;
      beforeEach(() => {
        elem = { nativeElement: jasmine.createSpyObj(['querySelectorAll']) as HTMLInputElement };
        component['elem'] = elem;

        const xlsxFile = {};
        spyOn(xlsx, 'read').and.returnValue(xlsxFile);

        spyOn(component, 'getExcelData').and.returnValue([
          ['a', 'b', 'c'],
          ['0', '1', '2'],
        ]);

      });
      it('should check validation - no errors', fakeAsync(() => {
        // arrange
        (elem.nativeElement.querySelectorAll as jasmine.Spy).and.returnValue([]);

        // act
        component.openFile(event);
        mockReader.onload({} as ProgressEvent);
        tick();

        // assert
        expect(component.importIsValid).toBeTruthy();
      }));

      it('should check validation - has errors', fakeAsync(() => {
        // arrange
        (elem.nativeElement.querySelectorAll as jasmine.Spy).and.returnValue([1, 2, 3]);

        // act
        component.openFile(event);
        mockReader.onload({} as ProgressEvent);
        tick();
        tick();
        // assert
        expect(component.importIsValid).toBeFalsy();
        expect(elem.nativeElement.querySelectorAll).toHaveBeenCalledWith('td.array-table-invalid');
      }));

      it('should set invalid rows', fakeAsync(() => {
        // arrange
        (elem.nativeElement.querySelectorAll as jasmine.Spy).and.returnValue([
          {
            parentElement: {
              rowIndex: 0
            }
          }, {
            parentElement: {
              rowIndex: 0
            }
          }, {
            parentElement: {
              rowIndex: 100
            }
          }]);

        // act
        component.openFile(event);
        mockReader.onload({} as ProgressEvent);
        tick();
        tick();
        // assert
        expect(component.invalidRows).toEqual([0, 100]);
      }));
    });

  });

  describe('getExcelData', () => {
    it('should covert data to excel data', () => {
      // arrange
      const workbook = {
        SheetNames: [
          'sheet1'
        ],
        Sheets: {
          sheet1: {
            A1: { v: 'a' },
            B1: { v: 'b' },
            C1: { v: 'c' },
            A2: { v: '1' },
            B2: { v: '2' },
            C2: { v: '3' },
            A3: { v: '4' },
            B3: { v: '5' },
            C3: { v: '6' },
            B4: { v: 'x1' },
            C4: { v: 'x2' },
            A5: { v: 'y1' },
            C5: { v: 'y2' },
            A6: { v: 'z1' },
            B6: { v: 'z2' },
          }
        }
      };

      // act
      const data = component.getExcelData(workbook);

      // assert
      expect(data).toEqual([
        ['a', 'b', 'c', null, null, null, null, null, null, null],
        ['1', '2', '3', null, null, null, null, null, null, null],
        ['4', '5', '6', null, null, null, null, null, null, null],
        [null, 'x1', 'x2', null, null, null, null, null, null, null],
        ['y1', null, 'y2', null, null, null, null, null, null, null],
        ['z1', 'z2', null, null, null, null, null, null, null, null],
      ]);
    });

    it('should work with large arrays', () => {
      // arrange
      spyOn(console, 'warn').and.stub();

      // act
      const data = component['indexToCellName'](27, 0);

      // assert
      expect(data).toBe('Z1');
      expect(console.warn).toHaveBeenCalledWith('Does not support sheets larger than 26 columns');
    });

    it('should handle empty file', () => {
      // arrange
      const workbook = {
        SheetNames: [
        ],
        Sheets: {
        }
      };

      // act
      const data = component.getExcelData(workbook);

      // assert
      expect(data).toEqual([]);
    });
  });

  describe('processPayments', () => {
    let financeApiService: FinanceApiService;

    let resolver1: (value: any) => void;
    let resolver2: (value: any) => void;
    let result1, result2;

    beforeEach(inject([FinanceApiService], (_financeApiService: FinanceApiService) => {
      financeApiService = _financeApiService;


      result1 = {
        success: true,
        data: {
          paymentResponseList: []
        }
      };
      for (let i = 0; i < 20; i++) {
        result1.data.paymentResponseList.push({
          responseCode: 0,
          responseDescription: 'Success',
          transactionID: i
        });
      }

      result2 = {
        success: true,
        data: {
          paymentResponseList: []
        }
      };
      for (let i = 0; i < 5; i++) {
        result2.data.paymentResponseList.push({
          responseCode: i,
          responseDescription: 'Success2',
          transactionID: i
        });
      }

      (financeApiService.corporatePlusMultiPayments as jasmine.Spy).and.returnValues(
        new Promise((r) => { resolver1 = r; }),
        new Promise((r) => { resolver2 = r; }),
      );
      component.data = new CorporatePlusMultipleOnceOffPaymentsRequest();
      component.data.listOfPayments = [];

      for (let i = 0; i < 25; i++) {
        const item = new CorporatePlusMultipleOnceOffPaymentsItem();
        item.amount = i;
        item.fromAccount = i.toString();
        item.fromReference = i.toString();
        item.notificationType = NotificationTypeEnum.Email;
        item.toAccountName = i.toString();
        item.toAccountNumber = i.toString();
        item.toAccountTypeCode = i;
        item.toBankCode = i.toString();
        item.toBranchCode = i.toString();
        item.toReference = i.toString();
        component.data.listOfPayments.push(item);
      }
    }));
    it('should call api in sets of 20', fakeAsync(() => {
      // arrange

      // act
      component.processPayments();

      // assert
      expect(component.callingApi).toBeTruthy();
      expect(component.results.listOfPayments.length).toBe(25);
      component.results.listOfPayments.forEach((c, i) => {
        expect(c.success).toBeUndefined(`Success not null for item ${i}`);
        expect(c.message).toBeUndefined(`message not null for item ${i}`);
        expect(c.transactionId).toBeUndefined(`transactionId not null for item ${i}`);
      });

      resolver1(result1);
      tick();
      component.results.listOfPayments.forEach((c, i) => {
        if (i < 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i, `transactionId incorrect for item ${i}`);
        } else {
          expect(c.success).toBeUndefined(`Success not null for item ${i}`);
          expect(c.message).toBeUndefined(`message not null for item ${i}`);
          expect(c.transactionId).toBeUndefined(`transactionId not null for item ${i}`);
        }
      });

      resolver2(result2);
      tick();
      component.results.listOfPayments.forEach((c, i) => {
        if (i < 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i, `transactionId incorrect for item ${i}`);
        } else if (i === 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success2', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(0, `transactionId incorrect for item ${i}`);
        } else {
          expect(c.success).toEqual('Failed', `Success incorrect for item ${i}`);
          expect(c.message).toEqual(`${i - 20} - Success2`, `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i - 20, `transactionId incorrect for item ${i}`);
        }
      });

    }));

    it('should handle api error', fakeAsync(() => {
      // arrange

      // act
      component.processPayments();

      // assert
      expect(component.callingApi).toBeTruthy();
      expect(component.results.listOfPayments.length).toBe(25);
      component.results.listOfPayments.forEach((c, i) => {
        expect(c.success).toBeUndefined(`Success not null for item ${i}`);
        expect(c.message).toBeUndefined(`message not null for item ${i}`);
        expect(c.transactionId).toBeUndefined(`transactionId not null for item ${i}`);
      });

      resolver1(result1);
      tick();
      resolver2({
        success: false,
        error: { message: 'error message' }
      });
      tick();

      component.results.listOfPayments.forEach((c, i) => {
        if (i < 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i, `transactionId incorrect for item ${i}`);
        } else {
          expect(c.success).toEqual('Failed', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('error message', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(-1, `transactionId incorrect for item ${i}`);
        }
      });
    }));

    it('should handle api error', fakeAsync(() => {
      // arrange

      // act
      component.processPayments();

      // assert
      expect(component.callingApi).toBeTruthy();
      expect(component.results.listOfPayments.length).toBe(25);
      component.results.listOfPayments.forEach((c, i) => {
        expect(c.success).toBeUndefined(`Success not null for item ${i}`);
        expect(c.message).toBeUndefined(`message not null for item ${i}`);
        expect(c.transactionId).toBeUndefined(`transactionId not null for item ${i}`);
      });

      resolver1(result1);
      tick();
      resolver2({
        success: false,
        error: {
          message: 'error message',
          error: {

          }
        }
      });
      tick();

      component.results.listOfPayments.forEach((c, i) => {
        if (i < 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i, `transactionId incorrect for item ${i}`);
        } else {
          expect(c.success).toEqual('Failed', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('error message', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(-1, `transactionId incorrect for item ${i}`);
        }
      });
    }));

    it('should handle api error', fakeAsync(() => {
      // arrange

      // act
      component.processPayments();

      // assert
      expect(component.callingApi).toBeTruthy();
      expect(component.results.listOfPayments.length).toBe(25);
      component.results.listOfPayments.forEach((c, i) => {
        expect(c.success).toBeUndefined(`Success not null for item ${i}`);
        expect(c.message).toBeUndefined(`message not null for item ${i}`);
        expect(c.transactionId).toBeUndefined(`transactionId not null for item ${i}`);
      });

      resolver1(result1);
      tick();
      resolver2({
        success: false,
        error: {
          message: 'error message',
          error: {
            result: {
              responseDescription: 'description'
            }
          }
        }
      });
      tick();

      component.results.listOfPayments.forEach((c, i) => {
        if (i < 20) {
          expect(c.success).toEqual('Success', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('0 - Success', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(i, `transactionId incorrect for item ${i}`);
        } else {
          expect(c.success).toEqual('Failed', `Success incorrect for item ${i}`);
          expect(c.message).toEqual('description', `message incorrect for item ${i}`);
          expect(c.transactionId).toEqual(-1, `transactionId incorrect for item ${i}`);
        }
      });
    }));

    describe('getBankCodes', () => {
      let referenceDataService: ReferenceDataService;
      beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
        referenceDataService = _referenceDataService;
      }));

      it('should get data from reference api', fakeAsync(() => {
        // arrange
        (referenceDataService.getAll as jasmine.Spy).and.returnValue(
          new Promise((r) => {
            r({
              data: {
                bankCodes: [
                  { bankCode: '1', bankDescription: 'desc1' },
                  { bankCode: '2', bankDescription: 'desc2' },
                  { bankCode: '3', bankDescription: 'desc3' },
                ]
              }
            });
          }));

        // act
        let result: string;
        component['getBankCode']('desc2').then((r) => { result = r; });
        tick();

        // assert
        expect(result).toBe('2');
        expect(referenceDataService.getAll).toHaveBeenCalledWith({
          endpoint: 'bankCodes',
          type: GetBankCodesResponse
        });
      }));

      describe('null and empty checks', () => {
        let data;
        beforeEach(() => {
          // arrange
          (referenceDataService.getAll as jasmine.Spy).and.callFake(() => {
            return new Promise((r) => {
              r(data);
            });
          });
        });

        it('should check null results', fakeAsync(() => {
          data = null;

          let result: string;
          component['getBankCode']('desc2').then((r) => { result = r; });
          tick();

          expect(result).toBe(null);
        }));

        it('should check data null', fakeAsync(() => {
          data = {
            data: null
          };
          let result: string;
          component['getBankCode']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check bankCodes null', fakeAsync(() => {
          data = {
            data: {
              bankCodes: null
            }
          };
          let result: string;
          component['getBankCode']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check empty results', fakeAsync(() => {
          data = {
            data: {
              bankCodes: [
              ]
            }
          };
          let result: string;
          component['getBankCode']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check no matches', fakeAsync(() => {
          data = {
            data: {
              bankCodes: [
                { bankCode: '1', bankDescription: 'desc1' },
                { bankCode: '3', bankDescription: 'desc3' },
              ]
            }
          };
          let result: string;
          component['getBankCode']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));
      });
    });

    describe('getAccountType', () => {
      let referenceDataService: ReferenceDataService;
      beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
        referenceDataService = _referenceDataService;
      }));

      it('should get data from reference api', fakeAsync(() => {
        // arrange
        (referenceDataService.getAll as jasmine.Spy).and.returnValue(
          new Promise((r) => {
            r({
              data: {
                accountTypes: [
                  { accountTypeCode: 1, accountTypeDescription: 'desc1' },
                  { accountTypeCode: 2, accountTypeDescription: 'desc2' },
                  { accountTypeCode: 3, accountTypeDescription: 'desc3' },
                ]
              }
            });
          }));

        // act
        let result: number;
        component['getAccountType']('desc2').then((r) => { result = r; });
        tick();

        // assert
        expect(result).toBe(2);
        expect(referenceDataService.getAll).toHaveBeenCalledWith({
          endpoint: 'accountTypeCodes',
          type: GetAccountTypesResponse
        });
      }));

      describe('null and empty checks', () => {
        let data;
        beforeEach(() => {
          // arrange
          (referenceDataService.getAll as jasmine.Spy).and.callFake(() => {
            return new Promise((r) => {
              r(data);
            });
          });
        });

        it('should check null results', fakeAsync(() => {
          data = null;

          let result: number;
          component['getAccountType']('desc2').then((r) => { result = r; });
          tick();

          expect(result).toBe(null);
        }));

        it('should check data null', fakeAsync(() => {
          data = {
            data: null
          };
          let result: number;
          component['getAccountType']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check bankCodes null', fakeAsync(() => {
          data = {
            data: {
              accountTypes: null
            }
          };
          let result: number;
          component['getAccountType']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check empty results', fakeAsync(() => {
          data = {
            data: {
              accountTypes: [
              ]
            }
          };
          let result: number;
          component['getAccountType']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));

        it('should check no matches', fakeAsync(() => {
          data = {
            data: {
              accountTypes: [
                { accountTypeCode: 1, accountTypeDescription: 'desc1' },
                { accountTypeCode: 3, accountTypeDescription: 'desc3' },
              ]
            }
          };
          let result: number;
          component['getAccountType']('desc2').then((r) => { result = r; });
          tick();
          expect(result).toBe(null);
        }));
      });
    });
  });
});
