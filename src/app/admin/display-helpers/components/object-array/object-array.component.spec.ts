import { async, TestBed, ComponentFixture } from '@angular/core/testing';
import { ObjectArrayComponent } from './object-array.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FieldArrayType } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { HttpClient } from '@angular/common/http';
import { CorporatePlusMultipleOnceOffPaymentsItem } from 'src/app/admin/resources/bank-api/bank-api.module';

describe('ObjectArrayComponent', () => {
  let component: ObjectArrayComponent;
  let fixture: ComponentFixture<ObjectArrayComponent>;

  beforeEach(async(() => {
    const httpServiceStub = jasmine.createSpyObj(['test']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        FormlyModule.forRoot({

        }),
        FormlyBootstrapModule,
      ],
      declarations: [ObjectArrayComponent],
      providers: [
        {
          provide: HttpClient,
          useValue: httpServiceStub
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectArrayComponent);
    component = fixture.componentInstance;
    component.field = { templateOptions: {} };
    spyOnProperty(component, 'options', 'get').and.returnValue({ showError: () => { } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create model on add', () => {
    // arrange
    spyOnProperty(component, 'model').and.returnValue([]);
    component.model = [];
    component.model.push({});
    component.field = {
      fieldGroup: [{
        formControl: jasmine.createSpyObj(['setValue'])
      }]
    };
    spyOn(FieldArrayType.prototype, 'add').and.stub();

    const value = { class: CorporatePlusMultipleOnceOffPaymentsItem };
    Object.defineProperty(component, 'to', { get: () => value });

    // act
    component.add();

    // assert
    expect((component.field.fieldGroup[0].formControl.setValue as jasmine.Spy).calls.first()
      .args[0] instanceof CorporatePlusMultipleOnceOffPaymentsItem).toBeTruthy();
  });
});
