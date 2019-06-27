import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelWrapperComponent } from './panel-wrapper.component';
import { FormlyModule } from '@ngx-formly/core';

describe('PanelWrapperComponent', () => {
  let component: PanelWrapperComponent;
  let fixture: ComponentFixture<PanelWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot({
          wrappers: [
            { name: 'panel', component: PanelWrapperComponent },
          ],
        }),
      ],
      declarations: [ PanelWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelWrapperComponent);
    component = fixture.componentInstance;
    component.field = {templateOptions: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
