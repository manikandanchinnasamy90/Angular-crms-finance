import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClassComponent } from './view-class.component';
import { IActionOptions } from '../../models/export-models';
import { Component, Input } from '@angular/core';
import { ApiModelBase } from '../../../resources/bank-api/bank-api.module';
import { DisplayOptions, ModelHelper } from 'src/app/admin/display-decorators/display-decorators.module';
import { ActionButtonComponent } from '../action-button/action-button.component';

describe('ViewClassComponent', () => {
  let component: ViewClassComponent;
  let fixture: ComponentFixture<ViewClassComponent>;
  const inputObject = {} as any as ApiModelBase;
  const metadata: Array<DisplayOptions> = [];

  beforeEach(async(() => {

    @Component({
      selector: 'app-view-field',
      template: ''
    })
    class ViewFieldStubComponent {
      @Input()
      metaData: DisplayOptions;

      @Input()
      value: any;

      @Input()
      referenceDataPathValues: Array<{ name: string, value: string }>;
    }

    @Component({
      selector: 'app-view-array',
      template: ''
    })
    class ViewArrayStubComponent {
      @Input()
      metaData: DisplayOptions;

      @Input()
      value: any;

      @Input()
      actionOptions: IActionOptions[];
    }

    @Component({
      selector: 'app-view-array-table',
      template: ''
    })
    class ViewArrayTableStubComponent {
      @Input()
      metaData: DisplayOptions;

      @Input()
      value: any;

      @Input()
      actionOptions: IActionOptions[];
    }

    spyOn(ModelHelper, 'GetDisplayProperties').and.returnValue(metadata);

    TestBed.configureTestingModule({
      declarations: [
        ViewFieldStubComponent,
        ViewArrayStubComponent,
        ViewArrayTableStubComponent,
        ViewClassComponent,
        ActionButtonComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClassComponent);
    component = fixture.componentInstance;
    component.object = inputObject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the metadata for the input variable', () => {
    expect(ModelHelper.GetDisplayProperties).toHaveBeenCalledWith(inputObject);
    expect(component.metaData).toBe(metadata);
  });

  it('should check for null metadata before init', () => {
    // arrange
    this.metaData = null;

    // act
    component.ngOnInit();

    // assert
    // no error => pass
  });

  describe('getPathValues', () => {
    it('should return null if referenceDataPathValues is not defined', () => {
      // arrange
      const testMetaData = {
      } as DisplayOptions;
      // act
      const result = component.getPathValues(testMetaData);

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

      component.object = {
        testPropValue: 123
      };
      // act
      const result = component.getPathValues(testMetaData);

      // assert
      expect(result).toEqual([{ name: 'testProp1', value: '123' }, { name: 'testProp2', value: null }]);
    });
  });
});
