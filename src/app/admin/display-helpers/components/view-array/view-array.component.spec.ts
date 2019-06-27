import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewArrayComponent } from './view-array.component';
import { IActionOptions } from '../../models/export-models';
import { ReferenceDataService } from '../../../resources/reference-api/services/reference-data.service';
import {
  CorporatePlusMultipleOnceOffPaymentsItem,
  CorporatePlusMultipleOnceOffPaymentResponse
} from '../../../resources/bank-api/bank-api.module';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { PropertyTypes, DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';

describe('ViewArrayComponent', () => {
  class RouterStub {
    public navigateByUrl() { }
    public get url() { return ''; }
  }

  let component: ViewArrayComponent;
  let fixture: ComponentFixture<ViewArrayComponent>;
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

    @Component({
      selector: 'app-view-field',
      template: ''
    })
    class ViewFieldComponentStubComponent {
      @Input()
      metaData: DisplayOptions;

      @Input()
      value: any;

      @Input()
      referenceDataPathValues: Array<{ name: string, value: string }>;
    }

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
        ViewArrayComponent,
        ActionButtonStubComponent,
        ViewFieldComponentStubComponent,
        ViewClassComponentStubComponent
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
    fixture = TestBed.createComponent(ViewArrayComponent);
    component = fixture.componentInstance;
    component.value = [{ path: 'value' }];
    component.metaData = {
      path: 'array',
      class: CorporatePlusMultipleOnceOffPaymentsItem,
      childOptions: [{
        path: 'path',
        type: PropertyTypes.input
      }],
      type: PropertyTypes.array,
    };

    fixture.detectChanges();
  });



  describe('ngOnInit', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call checkActionOptions', () => {
      // arrange
      const testFixture = TestBed.createComponent(ViewArrayComponent);
      const componentTest = testFixture.componentInstance;
      componentTest.value = [{ path: 'value' }];

      componentTest.metaData = {
        path: 'array',
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        childOptions: [{
          path: 'path',
          type: PropertyTypes.input
        }],
        type: PropertyTypes.array,
      };
      spyOn(componentTest as any, 'checkActionOptions').and.callFake(() => { });

      // act
      testFixture.detectChanges();

      // assert
      expect(componentTest['checkActionOptions']).toHaveBeenCalled();
    });
  });

  describe('displayName', () => {

    it('should read the label from the meta data', () => {
      // arrange
      component.metaData = {
        path: 'path',
        type: PropertyTypes.array,
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


  describe('getPathValues', () => {
    it('should return null if referenceDataPathValues is not defined', () => {
      // arrange
      const testMetaData = {
      } as DisplayOptions;
      // act
      const result = component.getPathValues(testMetaData, {});

      // assert
      expect(result).toBeNull();
    });

    it('should return null if path values from the object', () => {
      // arrange
      const testMetaData = {
        referenceDataPathVariables: [
          { name: 'testProp1', pathInObject: 'testPropValue' },
          { name: 'testProp2', pathInObject: 'testPropValueOther' }
        ]
      } as DisplayOptions;

      const value = {
        testPropValue: 123
      };
      // act
      const result = component.getPathValues(testMetaData, value);

      // assert
      expect(result).toEqual([{ name: 'testProp1', value: '123' }, { name: 'testProp2', value: null }]);
    });
  });

  describe('checkActionOptions', () => {
    it('should set relevant options to [] when action options is null', () => {
      // arrange
      component.actionOptions = null;

      // act
      component['checkActionOptions']();

      // assert
      expect(component.relevantActionOptions).toEqual([]);
    });

    it('should set matching action options on relevantActionOptions', () => {
      // arrange
      component.metaData = {
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        path: 'test',
        type: PropertyTypes.class
      };

      const matchedOption = {
        navigationObject: CorporatePlusMultipleOnceOffPaymentsItem
      } as any as IActionOptions;

      const unMatchedOption = {
        navigationObject: CorporatePlusMultipleOnceOffPaymentResponse
      } as any as IActionOptions;

      component.actionOptions = [
        unMatchedOption, matchedOption
      ];

      // act
      component['checkActionOptions']();

      // assert
      expect(component.relevantActionOptions).toEqual([matchedOption]);
    });
  });
  describe('getPathValues', () => {
    it('should return null if referenceDataPathValues is not defined', () => {
      // arrange
      const testMetaData = {
      } as DisplayOptions;
      // act
      const result = component.getPathValues(testMetaData, {});

      // assert
      expect(result).toBeNull();
    });

    it('should return null if path values from the object', () => {
      // arrange
      const testMetaData = {
        referenceDataPathVariables: [
          { name: 'testProp1', pathInObject: 'testPropValue' },
          { name: 'testProp2', pathInObject: 'testPropValueOther' }
        ]
      } as DisplayOptions;

      const value = {
        testPropValue: 123
      };
      // act
      const result = component.getPathValues(testMetaData, value);

      // assert
      expect(result).toEqual([{ name: 'testProp1', value: '123' }, { name: 'testProp2', value: null }]);
    });
  });
});
