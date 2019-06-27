import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormPropertiesService } from './form-properties.service';
import { FormPropertyTypes } from '../models/form-property-types.enum';
import { ReferenceDataService } from '../../resources/reference-api/services/reference-data.service';
import { FormGroup, FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { PropertyTypes, DisplayOptions } from '../../display-decorators/display-decorators.module';
import { Observable } from 'rxjs';
import { GetBranchCodesByBankCodeResponse } from '../../resources/reference-api/reference-api.module';
import { CorporatePlusMultipleOnceOffPaymentsItem } from '../../resources/bank-api/bank-api.module';

describe('FormPropertiesService', () => {
  beforeEach(() => {

    const referenceServiceStub = jasmine.createSpyObj(['getAll']);
    TestBed.configureTestingModule({
      providers: [
        FormPropertiesService,
        {
          provide: ReferenceDataService,
          useValue: referenceServiceStub
        }
      ],

    });
  });

  it('should be created', inject([FormPropertiesService], (service: FormPropertiesService) => {
    expect(service).toBeTruthy();
  }));

  describe('displayToFormProperties', () => {
    it('should call displayToFormProperty for each property', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const options = [{
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.input,
        hooks: {},
        validators: {},
        className: 'class1'
      },
      {
        key: 'key2',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.input,
        hooks: {},
        validators: {},
        className: 'class2'
      }];

      // act
      const results = service.displayToFormProperties(options);

      // assert
      const r1 = {} as FormlyFieldConfig;
      r1.key = 'key1';
      r1.templateOptions = {};
      r1.type = FormPropertyTypes.input;
      r1.hooks = {};
      r1.validators = {};
      r1.className = 'class1';

      const r2 = {} as FormlyFieldConfig;
      r2.key = 'key2';
      r2.templateOptions = {};
      r2.type = FormPropertyTypes.input;
      r2.validators = {};
      r2.hooks = {};
      r2.className = 'class2';
      expect(results as any).toEqual([r1, r2]);
    }));
  });
  describe('displayToFormProperty', () => {

    it('should convert input type', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.input
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.input);
    }));

    it('should convert checkbox type', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.checkbox
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.checkbox);
    }));

    it('should convert select type', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.select
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.select);
    }));

    it('should convert search select type', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.searchSelect
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.searchSelect);
    }));

    describe('searchSelect', () => {
      let service: FormPropertiesService;
      let dataService: ReferenceDataService;

      function awaitStream(stream$: Observable<any>, skipTime?: number) {
        let response = null;
        stream$.subscribe(data => {
          response = data;
        });
        if (skipTime) {
          jasmine.clock().tick(skipTime);
        }
        return response;
      }

      beforeEach(inject([FormPropertiesService, ReferenceDataService],
        (_service: FormPropertiesService, _dataService: ReferenceDataService) => {
          service = _service;
          dataService = _dataService;
        }));

      it('should convert select with references API values', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver([{ value: 'val', label: '123' }]);
        tick();

        // assert
        const data = awaitStream(result.templateOptions.options as Observable<any[]>);
        expect(data).toEqual([
          { value: 'val', label: '123' }
        ]);
      }));

      it('should show a loading message', () => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);

        // assert
        expect(result.templateOptions.loading).toBeTruthy();
        expect(result.templateOptions.disabled).toBeTruthy();
      });

      it('should take away loading message', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
            required: true
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver([{ value: 'val', label: '123' }]);
        tick();

        // assert
        expect(result.templateOptions.loading).toBeFalsy();
        expect(result.templateOptions.disabled).toBeFalsy();
      }));

      it('should use the path variable if set', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          referenceDataPath: 'data.list',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver({ data: { list: [{ value: 'val', label: '123' }] } });
        tick();

        // assert
        const data = awaitStream(result.templateOptions.options as Observable<any[]>);
        expect(data).toEqual([
          { value: 'val', label: '123' }
        ]);
      }));

      it('should use filter options', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          referenceDataPath: 'data.list',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
          referenceDataFilter: (v) => v.value !== 'val',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver({ data: { list: [{ value: 'val', label: '123' }, { value: 'val2', label: '333' }] } });
        tick();

        // assert
        const data = awaitStream(result.templateOptions.options as Observable<any[]>);
        expect(data).toEqual([
          { value: 'val2', label: '333' }
        ]);
      }));

      it('should handle incorrect paths', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          referenceDataPath: 'data.list.notRealPath.withDepth',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver({ data: { list: [{ value: 'val', label: '123' }] } });
        tick();

        // assert
        const data = awaitStream(result.templateOptions.options as Observable<any[]>);
        expect(data).toEqual([
        ]);
      }));

      it('should handle non arrays in return from the API', fakeAsync(() => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          referenceDataPath: 'data.list',
          templateOptions: {
            valueProp: 'value',
            labelProp: 'label',
          },
          type: PropertyTypes.searchSelect,
          referenceDataApi: 'test',
        };

        let resolver;
        const promise = new Promise((resolve, _reject) => { resolver = resolve; });
        (dataService.getAll as jasmine.Spy).and.returnValue(promise);

        // act
        const result = service['displayToFormProperty'](displayProperty);
        result.lifecycle.onInit(null, result);
        resolver({ data: { list: { value: 'val', label: '123' } } });
        tick();

        // assert
        const data = awaitStream(result.templateOptions.options as Observable<any[]>);
        expect(data).toEqual([{ value: 'val', label: '123' }]);
      }));

      describe('dependent drop downs', () => {
        let result: FormlyFieldConfig;
        const bankCodeField = new FormControl();
        const branchCodeField = new FormControl();
        const countryCodeField = new FormControl();
        const form = new FormGroup({
          bankCode: bankCodeField,
          branchCode: branchCodeField,
          countryCode: countryCodeField
        });
        let displayProperty: DisplayOptions;
        let dataResolver: (value: any) => void;

        beforeEach(() => {
          displayProperty = {
            key: 'branchCode',
            path: 'branchCode',
            templateOptions: {
              valueProp: 'value',
              labelProp: 'label',
            },
            type: PropertyTypes.searchSelect,
            referenceDataApi: 'bankCodes/{bankCode}/branchCodes',
            referenceDataPath: 'data.branchCodes',
            referenceDataReturnType: GetBranchCodesByBankCodeResponse,
            referenceDataPathVariables: [
              { name: 'bankCode', pathInObject: 'bankCode' },
              { name: 'countryCode', pathInObject: 'countryCode' }
            ],
          };

          const promise = new Promise((r) => { dataResolver = r; });
          (dataService.getAll as jasmine.Spy).and.returnValue(promise);

          result = service['displayToFormProperty'](displayProperty) as FormlyFieldConfig;
          result.formControl = branchCodeField;

        });

        it('should disable the drop down', () => {
          // assert
          expect(result.templateOptions.disabled).toBeTruthy();
        });

        describe('initialised', () => {

          beforeEach(() => {
            result.lifecycle.onInit(form, result);
          });

          afterEach(() => {
            result.lifecycle.onDestroy();
          });

          it('should clear the value when dependent change is detected', () => {
            // act
            bankCodeField.setValue('test');

            // assert
            expect(branchCodeField.value).toBe(null);
          });

          it('should call the api with the correct path values', () => {
            // act
            bankCodeField.setValue('newCode');

            // assert
            expect(dataService.getAll).toHaveBeenCalledWith({
              endpoint: 'bankCodes/{bankCode}/branchCodes',
              properties: [
                { name: 'bankCode', value: 'newCode' },
                { name: 'countryCode', value: null }
              ],
              type: GetBranchCodesByBankCodeResponse
            });
          });

          it('should not call the api for null values', () => {
            // act
            bankCodeField.setValue(null);

            // assert
            expect(dataService.getAll).not.toHaveBeenCalled();
            expect(result.templateOptions.disabled).toBeTruthy();
            expect(result.templateOptions.loading).toBeFalsy();
          });

          it('should not call the api for empty values', () => {
            // act
            bankCodeField.setValue('');

            // assert
            expect(dataService.getAll).not.toHaveBeenCalled();
            expect(result.templateOptions.disabled).toBeTruthy();
            expect(result.templateOptions.loading).toBeFalsy();
          });

          it('should call the api with the correct path values is not a string', () => {
            // act
            bankCodeField.setValue(123);

            // assert
            expect(dataService.getAll).toHaveBeenCalledWith(
              {
                endpoint: 'bankCodes/{bankCode}/branchCodes',
                properties: [
                  { name: 'bankCode', value: '123' },
                  { name: 'countryCode', value: null }
                ],
                type: GetBranchCodesByBankCodeResponse
              });
          });

          it('should handle null path values', fakeAsync(() => {
            // arrange
            spyOn(service as any, 'getPathValues').and.returnValue(null);

            // act
            bankCodeField.setValue('newCode');
            tick();

            // assert
            expect(result.templateOptions.disabled).toBeTruthy();
            expect(result.templateOptions.loading).toBeFalsy();
            const data = awaitStream(result.templateOptions.options as Observable<any[]>);
            expect(data).toEqual([]);
          }));

          it('should handle null path values for required fields', fakeAsync(() => {
            // arrange
            displayProperty.templateOptions.required = true;
            spyOn(service as any, 'getPathValues').and.returnValue(null);

            // act
            bankCodeField.setValue('newCode');
            tick();

            // assert
            expect(result.templateOptions.disabled).toBeTruthy();
            expect(result.templateOptions.loading).toBeFalsy();
            const data = awaitStream(result.templateOptions.options as Observable<any[]>);
            expect(data).toEqual([]);
          }));

          it('should unsubscribe to change on destroy', () => {
            // act
            bankCodeField.setValue(123);

            // assert
            expect(dataService.getAll).toHaveBeenCalledTimes(1);

            // act
            result.lifecycle.onDestroy();
            bankCodeField.setValue(123);
            bankCodeField.setValue(123);
            bankCodeField.setValue(123);

            // assert
            expect(dataService.getAll).toHaveBeenCalledTimes(1);
          });

          it('should keep set value if in reference list', fakeAsync(() => {
            branchCodeField.setValue(111);

            // act
            bankCodeField.setValue('newBankCode');
            dataResolver({
              data: {
                branchCodes: [
                  {
                    value: 111,
                    label: 'branch code'
                  }
                ]
              }
            });
            tick();

            // assert
            expect(branchCodeField.value).toEqual(111);
          }));

          it('should not keep set value if not in reference list', fakeAsync(() => {
            branchCodeField.setValue(111);

            // act
            bankCodeField.setValue('newBankCode');
            dataResolver({
              data: {
                branchCodes: [
                  {
                    value: 222,
                    label: 'branch code'
                  }
                ]
              }
            });
            tick();

            // assert
            expect(branchCodeField.value).toEqual(null);
          }));

          describe('getPathValues', () => {
            it('should handle null reference values', () => {
              // act
              const pathValues = service['getPathValues']({ referenceDataPathVariables: null } as DisplayOptions, null);

              // assert
              expect(pathValues).toBeNull();
            });
          });
        });
      });

      describe('with getDataMethod', () => {
        it('should load date from get data method', fakeAsync(() => {
          // arrange
          const field = { templateOptions: { options: null } };
          let resolver: (value) => void;
          const displayProperty: DisplayOptions = {
            key: 'branchCode',
            path: 'branchCode',
            templateOptions: {
              valueProp: 'value',
              labelProp: 'label',
            },
            type: PropertyTypes.searchSelect,
            getDataMethod: () => {
              return new Promise((resolve) => {
                resolver = resolve;
              });
            }
          };

          // act
          const result = service['displayToFormProperty'](displayProperty);
          result.lifecycle.onInit(null, field);
          resolver(['test']);
          tick();

          // assert
          field.templateOptions.options.subscribe((value) => {
            expect(value).toEqual(['test']);
          });

        }));

        it('should set disabled and loading correctly', fakeAsync(() => {
          // arrange
          const field = { templateOptions: { options: null } };
          let resolver: (value) => void;
          const displayProperty: DisplayOptions = {
            key: 'branchCode',
            path: 'branchCode',
            templateOptions: {
              valueProp: 'value',
              labelProp: 'label',
            },
            type: PropertyTypes.searchSelect,
            getDataMethod: () => {
              return new Promise((resolve) => {
                resolver = resolve;
              });
            }
          };

          // act
          const result = service['displayToFormProperty'](displayProperty);
          expect(result.templateOptions.disabled).toBeTruthy();
          expect(result.templateOptions.loading).toBeTruthy();

          result.lifecycle.onInit(null, field);
          resolver(['test']);
          tick();

          // assert
          expect(result.templateOptions.disabled).toBeFalsy();
          expect(result.templateOptions.loading).toBeFalsy();
        }));
      });
    });

    it('should set properties for classes', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.class,
        childOptions: [
          {
            key: 'keyChild',
            templateOptions: {},
            type: PropertyTypes.input
          } as DisplayOptions
        ]
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);
      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBeUndefined();
      expect(result.wrappers).toEqual(['panel']);
      expect(result.fieldGroup.length).toBe(1);
      expect(result.fieldGroup[0].key).toBe(displayProperty.childOptions[0].key);
      expect(result.fieldGroup[0].templateOptions).toBe(displayProperty.childOptions[0].templateOptions);
      expect(result.fieldGroup[0].type).toBe(FormPropertyTypes.input);
    }));

    it('should not set properties for classes when children is not set',
      inject([FormPropertiesService], (service: FormPropertiesService) => {
        // arrange
        const displayProperty: DisplayOptions = {
          key: 'key1',
          path: 'test',
          templateOptions: {},
          type: PropertyTypes.class,
          childOptions: null
        };

        // act
        const result = service['displayToFormProperty'](displayProperty);
        // assert
        expect(result.key).toBe(displayProperty.key);
        expect(result.templateOptions).toBe(displayProperty.templateOptions);
        expect(result.type).toBeUndefined();
        expect(result.wrappers).toEqual(['panel']);
        expect(result.fieldGroup.length).toBe(0);
      }));

    it('should handle array types', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      spyOn(console, 'warn');

      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: PropertyTypes.array,
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(console.warn).toHaveBeenCalledWith('Unsupported array of basic type');

      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBeUndefined();
    }));

    it('should handle array types of classes', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      spyOn(console, 'warn');

      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        templateOptions: {
        },
        type: PropertyTypes.array,
        childOptions: [
          {
            key: 'key2',
            path: 'tes2',
            templateOptions: {
            },
            type: PropertyTypes.input,
          }
        ]
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.objectArray);
      expect(result.templateOptions.class).toBe(CorporatePlusMultipleOnceOffPaymentsItem);
      expect(result.fieldArray.fieldGroup[0].key).toEqual('key2');
      expect(result.fieldArray.fieldGroup[0].templateOptions).toEqual({});
      expect(result.fieldArray.fieldGroup[0].type).toEqual(FormPropertyTypes.input);
    }));

    it('should handle array types of classes without child options', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      spyOn(console, 'warn');

      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        templateOptions: {
        },
        type: PropertyTypes.array,
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.objectArray);
      expect(result.templateOptions.class).toBe(CorporatePlusMultipleOnceOffPaymentsItem);
    }));

    it('should handle unsuported types', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      spyOn(console, 'warn');

      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        templateOptions: {},
        type: 'unknown'
      } as any;

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(console.warn).toHaveBeenCalledWith('Unsupported entry type unknown');

      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBeUndefined();
    }));
    it('should handle none types', inject([FormPropertiesService], (service: FormPropertiesService) => {
      // arrange
      spyOn(console, 'warn');

      const displayProperty: DisplayOptions = {
        key: 'key1',
        path: 'test',
        class: CorporatePlusMultipleOnceOffPaymentsItem,
        templateOptions: {
        },
        type: PropertyTypes.none,
      };

      // act
      const result = service['displayToFormProperty'](displayProperty);

      // assert
      expect(result.key).toBe(displayProperty.key);
      expect(result.templateOptions).toBe(displayProperty.templateOptions);
      expect(result.type).toBe(FormPropertyTypes.none);
    }));

  });
});
