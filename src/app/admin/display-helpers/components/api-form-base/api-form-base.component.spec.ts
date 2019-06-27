import { ApiFormBaseComponent } from './api-form-base.component';
import { async, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormPropertiesService } from '../../services/form-properties.service';
import { ApiModelBase, CorporatePlusMultipleOnceOffPaymentsItem } from '../../../resources/bank-api/bank-api.module';
import { HttpErrorResponse } from '@angular/common/http';
import { ModelHelper, DisplayOptions, PropertyTypes } from 'src/app/admin/display-decorators/display-decorators.module';
import { FormControl } from '@angular/forms';
import { Observable, Subscriber } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { GetBankCodesResponse } from 'src/app/admin/resources/reference-api/reference-api.module';

describe('ApiFormBaseComponent', () => {
  class Request extends ApiModelBase {

  }
  class Response extends ApiModelBase {

  }
  let component: ApiFormBaseComponent<Request, Response>;


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
    component = new ApiFormBaseComponent(service);
    component.model = new ApiModelBase();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set fields display properties on init', inject([FormPropertiesService], (service: FormPropertiesService) => {
    // arrange
    const displayProperties = [] as Array<DisplayOptions>;
    const formProperties = [] as Array<FormlyFieldConfig>;
    spyOn(ModelHelper, 'GetDisplayProperties').and.returnValue(displayProperties);
    (service.displayToFormProperties as jasmine.Spy).and.returnValue(formProperties);

    // act
    component.ngOnInit();

    // assert
    expect(component.fields[0].key).toBe('form');
    expect(component.fields[0].fieldGroup).toBe(formProperties);
    expect(ModelHelper.GetDisplayProperties).toHaveBeenCalledWith(component.model);
    expect(service.displayToFormProperties).toHaveBeenCalledWith(displayProperties);
  }));

  it('should override display options if set', inject([FormPropertiesService], (service: FormPropertiesService) => {
    // arrange
    const original1: DisplayOptions = {
      key: 'test1',
      path: 'original1',
      type: PropertyTypes.array
    };
    const original2: DisplayOptions = {
      key: 'test2',
      path: 'original2',
      type: PropertyTypes.input

    };
    const override1: DisplayOptions = {
      key: 'test1',
      path: 'override',
      type: PropertyTypes.searchSelect
    };
    const displayProperties = [original1, original2];
    component.fieldOptionsOverrides = [override1];

    spyOn(ModelHelper, 'GetDisplayProperties').and.returnValue(displayProperties);

    // act
    component.ngOnInit();

    // assert
    expect(component.fields[0].key).toBe('form');
    expect(service.displayToFormProperties).toHaveBeenCalledWith([override1, original2]);
  }));

  it('should throw is model is not set', () => {
    // arrange
    component.model = null;

    // act
    try {
      component.ngOnInit();

      // should not reach this part
      expect(true).toBeFalsy();
    } catch (error) {
      // assert
      expect(error instanceof Error).toBeTruthy();
      expect((error as Error).message).toBe('Model has to be instantiated before ngOnInit');
    }
  });

  it('should set wrappedModel', () => {
    // arrange
    component.model = new ApiModelBase();

    // act
    component.ngOnInit();

    expect(component.wrappedModel).toEqual({ form: component.model });
  });

  it('should call fromServerObject on init', () => {
    // arrange
    spyOn(component.model, 'fromServerObject');

    // act
    component.ngOnInit();

    // assert
    expect(component.model.fromServerObject).toHaveBeenCalledWith(component.model);
  });

  describe('submit', () => {
    let resolver: (value?: any) => void;
    beforeEach(() => {
      spyOn(component, 'callService').and.returnValue(new Promise((r) => { resolver = r; }));
    });

    it('should  set loading to true, and false after submit', fakeAsync(() => {
      // arrange
      component.loading = false;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();

      // assert
      expect(component.loading).toBe(true);

      // act
      resolver({});
      tick();

      // assert
      expect(component.loading).toBe(false);
    }));

    it('should set response values on component', fakeAsync(() => {
      // arrange
      const result = new Request();
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();
      resolver({ success: true, data: result });
      tick();

      // assert
      expect(component.responseResult).toBe(result);
    }));

    it('should set the error property on the component', fakeAsync(() => {
      // arrange
      const error: HttpErrorResponse = {} as any as HttpErrorResponse;
      component.error = {} as HttpErrorResponse;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();

      // assert
      expect(component.error).toBe(null);

      // act
      resolver({ success: false, error: error });
      tick();

      // assert
      expect(component.error).toBe(error);
    }));

    it('should set the errorObject property on the component when it is not a string', fakeAsync(() => {
      // arrange
      const error: HttpErrorResponse = {
        error: {
          result: {
            responseCode: '123',
            responseDescription: '123',
          }
        } as GetBankCodesResponse

      } as any as HttpErrorResponse;
      component.error = {} as HttpErrorResponse;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();

      // assert
      expect(component.errorObject).toBe(null);

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
      component.error = {} as HttpErrorResponse;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();

      // assert
      expect(component.errorObject).toBe(null);

      // act
      resolver({ success: false, error: error });
      tick();

      // assert
      expect(component.errorObject).toBe(null);
    }));

    it('should call the call method', () => {
      // arrange
      component.model = {} as Request;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);

      // act
      component.submit();

      // assert
      expect(component.callService).toHaveBeenCalled();
    });

    it('should not post while the model is invalid', () => {
      // arrange
      component.model = {} as Request;
      spyOnProperty(component.form, 'invalid', 'get').and.returnValue(true);

      // act
      component.submit();

      // assert
      expect(component.callService).not.toHaveBeenCalledWith(component.model);
    });
  });

  describe('additional validation', () => {
    it('should assign validators', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const formProperties = [
        {
          key: 'field',
        },
        {
          key: 'other',
        }
      ];
      (service.displayToFormProperties as jasmine.Spy).and.returnValue(formProperties);

      component.model = new Request();
      component.additionalValidations = {
        form: {
          errorPath: 'field',
          expression: (_: FormControl) => true,
          message: 'test'
        }
      };

      // act
      component.ngOnInit();

      // assert
      expect(component.fields.length).toBe(1);
      expect(component.fields[0].key).toBe('form');
      expect(component.fields[0].validators).toBe(component.additionalValidations);
      expect(component.fields[0].fieldGroup).toBe(formProperties);
    }));
  });

  describe('reset', () => {
    it('should reset result and error', () => {
      // arrange
      component.error = new HttpErrorResponse({});
      component.errorObject = {} as any;
      component.responseResult = {} as any;
      component['modelBackup'] = new CorporatePlusMultipleOnceOffPaymentsItem();
      spyOn(component.form, 'reset').and.stub();

      // act
      component.reset();

      // assert
      expect(component.error).toBeNull();
      expect(component.errorObject).toBeNull();
      expect(component.responseResult).toBeNull();
    });
  });

  describe('modelChanges', () => {
    it('should return observable from model changes', () => {
      // arrange
      let observer: Subscriber<{ form: Request }>;

      component.form = {
        valueChanges: new Observable((o) => { observer = o; })
      } as any;

      const expectedChange = new Request();

      // act
      component.modelChanges.subscribe((value) => {
        // assert
        expect(value).toBe(expectedChange);
      });

      // act (trigger observable)
      observer.next({ form: expectedChange });
    });
  });

  describe('scrollToError', () => {
    it('should scroll to first element with error', () => {
      // arrange
      const el = jasmine.createSpyObj(['scrollIntoView']) as Element;

      spyOn(document, 'querySelector').and.returnValue(el);

      // act
      component.scrollToError();

      // assert
      expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle no error scenario', () => {
      // arrange
      spyOn(document, 'querySelector').and.returnValue(null);
      // act
      component.scrollToError();
    });
  });
});
