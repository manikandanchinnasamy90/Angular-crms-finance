import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewArrayTableComponent } from './view-array-table.component';
import { IActionOptions } from '../../models/export-models';
import { ReferenceDataService } from '../../../resources/reference-api/services/reference-data.service';
import { CorporatePlusMultipleOnceOffPaymentsItem } from '../../../resources/bank-api/bank-api.module';
import { Router } from '@angular/router';
import { Component, Input } from '@angular/core';
import { PropertyTypes, DisplayOptions } from 'src/app/admin/display-decorators/display-decorators.module';
import { DateTimePipe } from '../../pipes/dateTime.pipe';
import { DatePipe } from '../../pipes/date.pipe';
import { CurrencyPipe } from '../../pipes/currency.pipe.';

describe('ViewArrayTableComponent', () => {
  class RouterStub {
    public navigateByUrl() { }
    public get url() { return ''; }
  }

  let component: ViewArrayTableComponent;
  let fixture: ComponentFixture<ViewArrayTableComponent>;
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
      onlyValue: boolean;

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
        ViewArrayTableComponent,
        ActionButtonStubComponent,
        ViewFieldComponentStubComponent,
        ViewClassComponentStubComponent,
        DatePipe,
        DateTimePipe,
        CurrencyPipe,
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
    fixture = TestBed.createComponent(ViewArrayTableComponent);
    component = fixture.componentInstance;
    component.value = [{ path: 'value' }];
    component.metaData = {
      path: 'array',
      class: CorporatePlusMultipleOnceOffPaymentsItem,
      childOptions: [{
        path: 'path',
        templateOptions: {},
        type: PropertyTypes.input
      }],
      type: PropertyTypes.array,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isValid', () => {
    it('should check required', () => {
      expect(component.isValid(null, { required: true })).toEqual('Value is required');
      expect(component.isValid(null, {})).toEqual('');
      expect(component.isValid(123, {})).toEqual('');
      expect(component.isValid(123, { required: true })).toEqual('');
    });

    it('should check pattern', () => {
      expect(component.isValid(null, { pattern: /^\d{1,5}$/ })).toEqual('');
      expect(component.isValid('not valid', { pattern: /^\d{1,5}$/ })).toEqual('Invalid value');
      expect(component.isValid('123', { pattern: /^\d{1,5}$/ })).toEqual('');
    });

    it('should check minLength', () => {
      expect(component.isValid(null, { minLength: 3 })).toEqual('');
      expect(component.isValid('2', { minLength: 3 })).toEqual('Minimum length of 3 characters allowed');
      expect(component.isValid('123', { minLength: 3 })).toEqual('');
    });

    it('should check maxLength', () => {
      expect(component.isValid(null, { maxLength: 3 })).toEqual('');
      expect(component.isValid('2', { maxLength: 3 })).toEqual('');
      expect(component.isValid('1234', { maxLength: 3 })).toEqual('Maximum length of 3 characters allowed');
    });

    it('should check min', () => {
      expect(component.isValid(null, { min: 3 })).toEqual('');
      expect(component.isValid(2, { min: 3 })).toEqual('Minimum value allowed is 3');
      expect(component.isValid(3, { min: 3 })).toEqual('');
    });

    it('should check min with 0', () => {
      expect(component.isValid(1, { min: 0 })).toEqual('');
    });

    it('should check min with decimals', () => {
      expect(component.isValid(-0.1, { min: 0 })).toEqual('Minimum value allowed is 0');
    });

    it('should check max', () => {
      expect(component.isValid(null, { max: 3 })).toEqual('');
      expect(component.isValid(2, { max: 3 })).toEqual('');
      expect(component.isValid(4, { max: 3 })).toEqual('Maximum value allowed is 3');
    });

    it('should check max with 0', () => {
      expect(component.isValid(-1, { max: 0 })).toEqual('');
    });

    it('should check max with decimals', () => {
      expect(component.isValid(0.1, { max: 0 })).toEqual('Maximum value allowed is 0');
    });

    it('should check multiple values', () => {
      expect(component.isValid(3, {
        min: 2,
        max: 4
      })).toEqual('');

      expect(component.isValid(4, {
        min: 5,
        max: 3
      })).toEqual('Minimum value allowed is 5');

      expect(component.isValid('123', {
        pattern: /^\d{1,5}$/,
        maxLength: 3
      })).toEqual('');

      expect(component.isValid('1234', {
        pattern: /^\d{1,5}$/,
        maxLength: 3
      })).toEqual('Maximum length of 3 characters allowed');
    });
  });

});
