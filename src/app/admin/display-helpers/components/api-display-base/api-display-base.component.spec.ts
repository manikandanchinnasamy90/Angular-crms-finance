
import { async, fakeAsync, tick } from '@angular/core/testing';
import { CorporatePlusMultipleOnceOffPaymentResponse, BaseResponse } from '../../../resources/bank-api/bank-api.module';
import { ApiDisplayBaseComponent } from './api-display-base.component';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

describe('ApiDisplayBaseComponent', () => {
  let component: ApiDisplayBaseComponent<CorporatePlusMultipleOnceOffPaymentResponse>;
  let router: Router;
  let activatedRouter: ActivatedRoute;

  beforeEach(async(() => {
    router = jasmine.createSpyObj(['navigate']);
    activatedRouter = jasmine.createSpyObj(['test']);
    component = new ApiDisplayBaseComponent<CorporatePlusMultipleOnceOffPaymentResponse>(router, activatedRouter);
  }));

  describe('onInit', () => {
    let resolver: (value) => void;
    beforeEach(() => {
      spyOn(component, 'callService').and.callFake(() => new Promise((r) => { resolver = r; }));
      spyOnProperty(component, 'modelId', 'get').and.callFake(() => 1);
    });


    it('should set data property from server data', fakeAsync(() => {
      // arrange
      const serverData = { success: true, data: {} as CorporatePlusMultipleOnceOffPaymentResponse };

      // act
      component.ngOnInit();
      resolver(serverData);
      tick();

      // assert
      expect(component.data).toBe(serverData.data);
      expect(component.callService).toHaveBeenCalledWith(1);
    }));

    it('should set error on failed scenario', fakeAsync(() => {
      // arrange
      const serverData = { success: false, error: { message: 'testError' } };

      // act
      component.ngOnInit();
      resolver(serverData);
      tick();

      // assert
      expect(component.errorMessage).toBe('testError');
      expect(component.callService).toHaveBeenCalledWith(1);
    }));

    it('should set the errorObject property on the component when it is not a string', fakeAsync(() => {
      // arrange
      const error: HttpErrorResponse = {
        error: {
          result: {
            responseCode: '123',
            responseDescription: '123'
          }
        } as BaseResponse

      } as any as HttpErrorResponse;

      // act
      component.ngOnInit();

      // assert
      expect(component.errorObject).toBeUndefined();

      // act
      resolver({ success: false, error: error });
      tick();

      // assert
      expect(component.errorObject.result.responseCode).toEqual(error.error.result.responseCode);
      expect(component.errorObject.result.responseDescription).toEqual(error.error.result.responseDescription);
    }));

    it('should not set the errorObject property on the component when it is a string', fakeAsync(() => {
      // arrange
      const error: HttpErrorResponse = {
        error: 'test123'

      } as any as HttpErrorResponse;

      // act
      component.ngOnInit();

      // assert
      expect(component.errorObject).toBeUndefined();

      // act
      resolver({ success: false, error: error });
      tick();

      // assert
      expect(component.errorObject).toBeUndefined();
    }));
  });

  describe('modelId', () => {
    it('should throw an exception', () => {
      // act
      try {
        const a = component.modelId;
        expect(a).toBeNull();
      } catch (error) {
        expect(error).toEqual(new Error('Not Implemented'));
      }
    });
  });

  describe('editUrl', () => {
    it('should return null', () => {
      // act
      const result = component.editUrl;

      // assert
      expect(result).toBeNull();
    });
  });

  describe('callService', () => {
    it('should throw an exception', () => {
      // act
      component.callService('123').then(() => {

      }).catch((error) => {
        expect(error).toEqual(new Error('Not Implemented'));
      });
    });
  });

  describe('navigateToEdit', () => {
    it('should navigate to the edit url', () => {
      // arrange
      spyOnProperty(component, 'editUrl', 'get').and.returnValue('123');

      // act
      component.navigateToEdit();

      // assert
      expect(router.navigate).toHaveBeenCalledWith('123', { relativeTo: activatedRouter });
    });
  });

  describe('actionOptions', () => {
    it('should return []', () => {
      // act
      const result = component.actionOptions;

      // assert
      expect(result).toEqual([]);
    });
  });

  describe('refresh', () => {
    it('should reload the data', () => {
      // arrange
      component.data = new CorporatePlusMultipleOnceOffPaymentResponse();
      component.errorMessage = 'test';
      component.errorObject = new BaseResponse();
      spyOn(component, 'ngOnInit').and.stub();

      // act
      component.refresh();

      // assert
      expect(component.data).toBeNull();
      expect(component.errorMessage).toBeNull();
      expect(component.errorObject).toBeNull();
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });
});
