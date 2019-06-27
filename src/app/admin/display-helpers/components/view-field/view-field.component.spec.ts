import { async, ComponentFixture, TestBed, fakeAsync, tick, inject } from '@angular/core/testing';
import { ViewFieldComponent } from './view-field.component';
import { IActionOptions } from '../../models/export-models';
import { ReferenceDataService } from '../../../resources/reference-api/services/reference-data.service';
import { CorporatePlusMultipleOnceOffPaymentsItem } from '../../../resources//bank-api/bank-api.module';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { PropertyTypes } from 'src/app/admin/display-decorators/display-decorators.module';

describe('ViewFieldComponent', () => {
  class RouterStub {
    public navigateByUrl() { }
    public get url() { return ''; }
  }

  let component: ViewFieldComponent;
  let fixture: ComponentFixture<ViewFieldComponent>;
  let routerServiceStub: RouterStub;

  beforeEach(async(() => {
    const dataServiceStub = jasmine.createSpyObj('ReferenceDataService', ['getAll']);
    routerServiceStub = new RouterStub();

    @Component({
      selector: 'app-action-button',
      template: ''
    })
    class ActionButtonStubComponent {
      @Input()
      public actionOption: IActionOptions;

      @Input()
      public item: any;
    }

    TestBed.configureTestingModule({
      declarations: [
        ViewFieldComponent,
        ActionButtonStubComponent
      ],
      providers: [
        {
          provide: ReferenceDataService,
          useValue: dataServiceStub
        },
        {
          provide: Router,
          useValue: routerServiceStub
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFieldComponent);
    component = fixture.componentInstance;
    component.value = { path: 'value' };
    component.metaData = {
      path: 'path',
      type: PropertyTypes.input,
    };
    fixture.detectChanges();
  });



  describe('ngOnInit', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call loadDisplayValue', () => {
      // arrange

      const testFixture = TestBed.createComponent(ViewFieldComponent);
      const componentTest = testFixture.componentInstance;
      componentTest.value = { path: 'value' };
      componentTest.metaData = {
        path: 'path',
        type: PropertyTypes.input,
      };
      spyOn(componentTest as any, 'loadDisplayValue').and.callFake(() => { });
      // act
      testFixture.detectChanges();

      // assert
      expect(componentTest['loadDisplayValue']).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {

    it('should read the label from the meta data', () => {
      // arrange
      component.metaData = {
        path: 'path',
        type: PropertyTypes.input,
        templateOptions: {
          label: 'display name'
        }
      };

      // act
      const result = component.displayName;

      // assert
      expect(result).toBe('display name');
    });

    it('should use the path if the label is not defined', () => {
      // arrange
      component.metaData = {
        path: 'Path',
        type: PropertyTypes.input,
        templateOptions: {
        }
      };

      // act
      const result = component.displayName;

      // assert
      expect(result).toBe('Path');
    });

    it('should use the path if template options is not defined', () => {
      // arrange
      component.metaData = {
        path: 'Path',
        type: PropertyTypes.input
      };

      // act
      const result = component.displayName;

      // assert
      expect(result).toBe('Path');
    });

    it('should add spaces between camel cased words', () => {
      // arrange
      component.metaData = {
        path: 'PathCamelCase',
        type: PropertyTypes.input
      };

      // act
      const result = component.displayName;

      // assert
      expect(result).toBe('Path Camel Case');
    });

    it('should capitalize the first letter', () => {
      // arrange
      component.metaData = {
        path: 'path',
        type: PropertyTypes.input
      };

      // act
      const result = component.displayName;

      // assert
      expect(result).toBe('Path');
    });
  });

  describe('displayValue', () => {
    it('should return _displayValue', () => {
      // arrange
      component['_displayValue'] = 'test';

      // act
      const r = component.displayValue;

      // assert
      expect(r).toBe('test');
    });
  });

  describe('loadDisplayValue', () => {
    let resolver: (value?: {} | PromiseLike<{}>) => void;
    let referenceDataService: ReferenceDataService;
    beforeEach(inject([ReferenceDataService], (_referenceDataService: ReferenceDataService) => {
      referenceDataService = _referenceDataService;
      (referenceDataService.getAll as jasmine.Spy).and.returnValue(new Promise((r) => {
        resolver = r;
      }));
    }));

    it('should set value by default', fakeAsync(() => {
      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use the value when reference apis is not defined', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = null;

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should call the reference data api for the display value', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = {
        labelProp: 'test',
        valueProp: 'test2'
      };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(referenceDataService.getAll).toHaveBeenCalledWith({ endpoint: 'test', properties: undefined, type: undefined });
    }));

    it('should call the reference data api with property values ', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test/{propertyName}/something';
      component.metaData.referenceDataReturnType = CorporatePlusMultipleOnceOffPaymentsItem;
      component.referenceDataPathValues = [{ name: 'propertyName', value: '123' }];
      component.metaData.templateOptions = {
        labelProp: 'test',
        valueProp: 'test2'
      };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(referenceDataService.getAll).toHaveBeenCalledWith({
        endpoint: 'test/{propertyName}/something',
        properties: [{ name: 'propertyName', value: '123' }],
        type: CorporatePlusMultipleOnceOffPaymentsItem
      });
    }));

    it('should use value when the display value is null', fakeAsync(() => {
      // arrange
      component['_displayValue'] = 'incorrect';
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = { labelProp: '', valueProp: '' };

      // act
      component['loadDisplayValue']();

      resolver(null);
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when the templateOptions not set', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = null;

      // act
      component['loadDisplayValue']();
      resolver({ displayVal: 'displayVal' });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when the label prop is not set', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = {
        labelProp: null,
        valueProp: '123'
      };

      // act
      component['loadDisplayValue']();
      resolver({ displayVal: 'displayVal' });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when the value prop is not set', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = {
        labelProp: '123',
        valueProp: null
      };

      // act
      component['loadDisplayValue']();
      resolver({ displayVal: 'displayVal' });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when path is wrong', fakeAsync(() => {
      // arrange
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.incorrectPath.moreToTest';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: [
          {
            value: 'test',
            label: 'label'
          }
        ]
      });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value from reference API', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: {
          list: [
            {
              value: 'searchValue',
              label: '123'
            }
          ]
        }
      });
      tick();

      // assert
      expect(component.displayValue).toBe('123');
    }));

    it('should use return value when path is not set', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver([
        {
          value: 'searchValue',
          label: '123'
        }
      ]);
      tick();

      // assert
      expect(component.displayValue).toBe('123');
    }));

    it('should use value when data is not an array', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: {
          list:
          {
            value: 'searchValue',
            label: '123'
          }
        }
      });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when item is not in the list', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: {
          list: [
            {
              value: 'somethingElse',
              label: '123'
            },
            {
              value: 'somethingElse2',
              label: '123'
            }
          ]
        }
      });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when display property does not exist', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'wrongLabel',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: {
          list: [
            {
              value: 'searchValue',
              label: '123'
            }
          ]
        }
      });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should use value when value property is wrong', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'valueWrongProp',
      };

      // act
      component['loadDisplayValue']();
      resolver({
        data: {
          list:
          {
            value: 'searchValue',
            label: '123'
          }
        }
      });
      tick();

      // assert
      expect(component.displayValue).toBe(component.value);
    }));

    it('should not call reference data api when value is null', fakeAsync(() => {
      // arrange
      component.value = null;
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = { labelProp: '', valueProp: '' };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe('-');
      expect(referenceDataService.getAll).not.toHaveBeenCalled();
    }));

    it('should not call reference data api when value is empty', fakeAsync(() => {
      // arrange
      component.value = ' ';
      component.metaData.referenceDataApi = 'test';
      component.metaData.templateOptions = { labelProp: '', valueProp: '' };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe('-');
      expect(referenceDataService.getAll).not.toHaveBeenCalled();
    }));

    it('should have value loading until reference data api return', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.referenceDataApi = 'test';
      component.metaData.referenceDataPath = 'data.list';
      component.metaData.templateOptions = {
        labelProp: 'label',
        valueProp: 'value',
      };

      // act
      component['loadDisplayValue']();

      // assert
      expect(component.displayValue).toBe('Loading...');
      resolver({
        data: {
          list: [
            {
              value: 'searchValue',
              label: '123'
            }
          ]
        }
      });
      tick();
      expect(component.displayValue).toBe('123');
    }));

    it('should look for display values in template options for select types', fakeAsync(() => {
      // arrange
      component.value = 'searchValue';
      component.metaData.type = PropertyTypes.select;
      component.metaData.templateOptions = {
        options: [{
          value: 'searchValue',
          label: 'displayValue'
        }]
      };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe('displayValue');
    }));

    it('should look for use value when display value is not found in options', fakeAsync(() => {
      // arrange
      component.value = 'searchValueNotThere';
      component.metaData.type = PropertyTypes.select;
      component.metaData.templateOptions = {
        options: [{
          value: 'searchValue',
          label: 'displayValue'
        }]
      };

      // act
      component['loadDisplayValue']();
      tick();

      // assert
      expect(component.displayValue).toBe('searchValueNotThere');
    }));
  });
});
