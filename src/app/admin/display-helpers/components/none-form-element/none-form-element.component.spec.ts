import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoneFormElementComponent } from './none-form-element.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

describe('NoneFormElementComponent', () => {
  let component: NoneFormElementComponent;
  let fixture: ComponentFixture<NoneFormElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgSelectModule,
        FormsModule,
        FormlyModule.forRoot()
      ],
      declarations: [NoneFormElementComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoneFormElementComponent);
    component = fixture.componentInstance;

    // set template options
    Object.defineProperty(component, 'to', { get: () => ({ valueProp: 'value', labelProp: 'label' }) });

    // set field
    component.field = {

      formControl: {
        setValue: () => { },
        get value() {
          return null;
        }
      } as any
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
