import { async, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ApiEditFormBaseComponent } from './api-edit-form-base.component';
import {
  GetViewCorporateStatementRequest,
  CorporatePlusOnceOffPaymentResponse,
  ServiceResponse
} from '../../../resources/bank-api/bank-api.module';
import { FormPropertiesService } from '../../display-helpers.module';
import { HttpErrorResponse } from '@angular/common/http';


describe('ApiEditFormBaseComponent', () => {
  let component: ApiEditFormBaseComponent<GetViewCorporateStatementRequest, CorporatePlusOnceOffPaymentResponse>;


  beforeEach(async(() => {
    const serviceStub = jasmine.createSpyObj(['displayToFormProperties']);

    TestBed.configureTestingModule({
      declarations: [],
      imports: [
      ],
      providers: [
        {
          provide: FormPropertiesService,
          useValue: serviceStub
        }
      ]

    })
      .compileComponents();
  }));

  beforeEach(inject([FormPropertiesService], (service: FormPropertiesService) => {
    component = new ApiEditFormBaseComponent(service);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let resolver: (value?: {}) => void;

    beforeEach(fakeAsync(() => {
      spyOn(component, 'loadModelFromServer').and.callFake(() => new Promise((r) => { resolver = r; }));
      spyOnProperty(component, 'modelId', 'get').and.returnValue('123');
      spyOn(component['__proto__']['__proto__'], 'ngOnInit').and.callThrough();
      component.model = jasmine.createSpyObj(['fromServerObject']);
    }));

    it('should load the object from the server', fakeAsync(() => {
      // arrange
      const serviceResponse: ServiceResponse<any> = { success: true, data: {}, error: null };

      // act
      component.ngOnInit();
      resolver(serviceResponse);
      tick();

      // assert
      expect(component.loadModelFromServer).toHaveBeenCalledWith('123');
      expect(component.model.fromServerObject).toHaveBeenCalledWith(serviceResponse.data);
      expect(component['__proto__']['__proto__'].ngOnInit).toHaveBeenCalled();
    }));

    it('should set the loading property', fakeAsync(() => {
      // arrange
      const serviceResponse: ServiceResponse<any> = { success: true, data: {}, error: null };
      component.loading = false;
      // act
      component.ngOnInit();
      expect(component.loading).toBeTruthy();
      resolver(serviceResponse);
      tick();

      // assert
      expect(component.loading).toBeFalsy();
    }));

    it('should handle error scenario', fakeAsync(() => {
      // arrange
      const serviceResponse: ServiceResponse<any> = { success: false, data: null, error: {} as HttpErrorResponse };

      // act
      component.ngOnInit();
      resolver(serviceResponse);
      tick();

      // assert
      expect(component.error).toBe(serviceResponse.error);
    }));
  });

  describe('modelId', () => {
    it('should throw an exception', () => {
      try {
        const a = component.modelId;

        // should not reach this line
        expect(a).toBeTruthy();
      } catch (error) {
        expect(error instanceof Error).toBeTruthy();
        expect((error as Error).message).toBe('Not Implemented');
      }
    });
  });

  describe('loadModelFromServer', () => {
    it('should throw an exception', () => {
      component.loadModelFromServer('123')
        .then(() => {
          // should not reach this line
          expect(true).toBeFalsy();
        })
        .catch((error) => {
          expect(error instanceof Error).toBeTruthy();
          expect((error as Error).message).toBe('Not Implemented');
        });
    });
  });

  describe('reset', () => {
    it('should call init again', () => {
      // arrange
      spyOn(component, 'ngOnInit').and.stub();
      component['modelBackup'] = new GetViewCorporateStatementRequest();
      // act
      component.reset();

      // assert
      expect(component.ngOnInit).toHaveBeenCalled();
    });
  });
});
