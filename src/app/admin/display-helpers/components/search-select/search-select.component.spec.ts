import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchSelectComponent } from './search-select.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';

describe('SearchSelectComponent', () => {
  let component: SearchSelectComponent;
  let fixture: ComponentFixture<SearchSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgSelectModule,
        FormsModule,
        FormlyModule.forRoot()
      ],
      declarations: [SearchSelectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSelectComponent);
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

  it('should set empty value on clear', () => {
    // arrange
    spyOn(component.field.formControl, 'setValue');

    // act
    component.onClear();

    // assert
    expect(component.field.formControl.setValue).toHaveBeenCalledWith(null);
  });

  it('should set the model value if different from form', () => {
    // arrange
    component.currentValue = '123',
      spyOnProperty(component.field.formControl, 'value', 'get').and.returnValue('234');

    // act
    component.ngDoCheck();

    // assert
    expect(component.currentValue).toBe('234');
  });

  it('should not the model when the values are the same', () => {
    // arrange
    component.currentValue = '123',
      spyOnProperty(component.field.formControl, 'value', 'get').and.returnValue('123');

    // act
    component.ngDoCheck();

    // assert
    expect(component.currentValue).toBe('123');
  });

  it('should set the value on the form', () => {
    // arrange
    spyOn(component.field.formControl, 'setValue');

    // act
    component.onChange({ value: 'test' });

    // assert
    expect(component.field.formControl.setValue).toHaveBeenCalledWith('test');
  });

  it('should set null on null', () => {
    // arrange
    spyOn(component.field.formControl, 'setValue');

    // act
    component.onChange(null);

    // assert
    expect(component.field.formControl.setValue).toHaveBeenCalledWith(null);
  });

  describe('customSearch', () => {
    it('should return true when search matches label', () => {
      // arrange
      component.to.labelProp = 'label';
      component.to.labelProp = 'value';

      // act
      const result = component.customSearch('test', { value: '123', label: 'asd test ads' });

      // assert
      expect(result).toBeTruthy();
    });

    it('should return true when search matches value', () => {
      // arrange
      component.to.labelProp = 'label';
      component.to.labelProp = 'value';

      // act
      const result = component.customSearch('23', { value: '123', label: 'asd test ads' });

      // assert
      expect(result).toBeTruthy();
    });

    it('should return false when search does not match value or label', () => {
      // arrange
      component.to.labelProp = 'label';
      component.to.labelProp = 'value';

      // act
      const result = component.customSearch('not', { value: '123', label: 'asd test ads' });

      // assert
      expect(result).toBeFalsy();
    });

    it('should return true when search matches non string value', () => {
      // arrange
      component.to.labelProp = 'label';
      component.to.labelProp = 'value';

      // act
      const result = component.customSearch('23', { value: 123, label: 'asd test ads' });

      // assert
      expect(result).toBeTruthy();
    });
  });
});
