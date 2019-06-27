import { async, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { ModelHelper } from 'src/app/admin/display-decorators/helpers/model.helper';
import { DataFormats } from 'src/app/admin/display-decorators/models/data-formats.enum';
import { CsvExportService } from './csv-service.service';
import { FormPropertiesService } from './service-exports';

describe('CsvExportService', () => {
  let service: CsvExportService;

  beforeEach(async(() => {
    const serviceStub = jasmine.createSpyObj(['displayToFormProperties', 'getFieldReferenceData']);

    TestBed.configureTestingModule({
      declarations: [

      ],
      imports: [

      ],
      providers: [
        CsvExportService,
        {
          provide: FormPropertiesService,
          useValue: serviceStub
        }
      ]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(CsvExportService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('dataToCsv', () => {
    let anchor: HTMLAnchorElement;
    let formPropertiesService: FormPropertiesService;
    beforeEach(inject([FormPropertiesService], (fps: FormPropertiesService) => {
      formPropertiesService = fps;
      spyOn(ModelHelper, 'GetDisplayProperties').and.returnValue([
        {
          key: 'a',
          templateOptions: {},
        },
        {
          key: 'b',
          templateOptions: {},
        },
        {
          key: 'c',
          templateOptions: {},
        }
      ]);

      anchor = jasmine.createSpyObj(['setAttribute', 'click']);
      spyOn(document, 'createElement').and.returnValue(anchor);
      spyOn(document.body, 'appendChild').and.stub();
      spyOn(document.body, 'removeChild').and.stub();
    }));

    it('should download a csv file', fakeAsync(() => {
      // act
      let tested = false;
      service.dataToCsv([{ a: 1, b: 2, c: 3 } as any, { a: 3, b: 4, c: 5 } as any], 'test').then((result) => {
        expect(result).toBeTruthy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(anchor.href).toBe(encodeURI('data:application/csv;charset=utf-8,"a";"b";"c"\n1;2;3\n3;4;5'));
      expect(anchor.setAttribute).toHaveBeenCalledWith('download', 'test.csv');
      expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
      expect(anchor.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(anchor);
    }));

    it('should convert data correctly', fakeAsync(() => {
      // arrange

      (ModelHelper.GetDisplayProperties as jasmine.Spy).and.returnValue([
        {
          key: 'a',
          templateOptions: {
            format: DataFormats.date
          },
        },
        {
          key: 'b',
          templateOptions: {
            format: DataFormats.dateTime
          },
        },
        {
          key: 'c',
          templateOptions: {},
        }
      ]);
      // act
      let tested = false;
      service.dataToCsv([
        { a: '20190101', b: '20190101 122233', c: 3 } as any,
        { a: '20190302', b: '20180203 010000', c: 5 } as any
      ], 'test').then((result) => {
        expect(result).toBeTruthy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect(anchor.href)
        .toBe(encodeURI('data:application/csv;charset=utf-8,"a";"b";"c"\n"'
          + '2019-01-01";"2019-01-01 12:22:33";3\n'
          + '"2019-03-02";"2018-02-03 01:00:00";5'));
    }));

    it('should convert reference data correctly', fakeAsync(() => {
      // arrange
      (formPropertiesService.getFieldReferenceData as jasmine.Spy).and.returnValue([
        { value: 'exists', label: 'exists label' },
        { value: 'other', label: 'other label' }
      ]);

      (ModelHelper.GetDisplayProperties as jasmine.Spy).and.returnValue([
        {
          key: 'a',
          referenceDataApi: 'referenceApi',
          templateOptions: {
            labelProp: 'label',
            valueProp: 'value'
          },
        },
        {
          key: 'b',
          templateOptions: {},
        },
        {
          key: 'c',
          templateOptions: {},
        }
      ]);
      // act
      let tested = false;
      service.dataToCsv([{ a: 'exists', b: 2, c: 3 } as any, { a: 'invalid', b: 4, c: 5 } as any], 'test').then((result) => {
        expect(result).toBeTruthy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect(anchor.href).toBe(encodeURI('data:application/csv;charset=utf-8,"a";"b";"c"\n"exists - exists label";2;3\n"invalid";4;5'));
    }));

    it('should download handle exceptions', fakeAsync(() => {
      // arrange
      (document.body.appendChild as jasmine.Spy).and.throwError('test error');
      spyOn(console, 'error').and.stub();
      // act
      let tested = false;
      service.dataToCsv([{ a: 1, b: 2, c: 3 } as any, { a: 3, b: 4, c: 5 } as any], 'test').then((result) => {
        expect(result).toBeFalsy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect((console.error as jasmine.Spy).calls.first().args[0].message).toEqual('test error');

    }));

    it('should handle empty data', fakeAsync(() => {
      // arrange
      spyOn(console, 'error').and.stub();

      // act
      let tested = false;
      service.dataToCsv([], 'test').then((result) => {
        expect(result).toBeFalsy();
        tested = true;
      });
      tick();

      // assert
      expect(tested).toBeTruthy();
      expect((console.error as jasmine.Spy).calls.first().args[0].message)
        .toEqual('Data should not be empty or the "fields" option should be included');

    }));
  });
});
