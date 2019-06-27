import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SideBarComponent } from './side-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../auth.service';
import { HideRouteWithScopeDirective } from '../admin/shared/shared.module';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        HideRouteWithScopeDirective,
        SideBarComponent
      ],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj(['hasScope'])
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
