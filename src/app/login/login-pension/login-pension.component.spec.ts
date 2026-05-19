import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPensionComponent } from './login-pension.component';

describe('LoginPensionComponent', () => {
  let component: LoginPensionComponent;
  let fixture: ComponentFixture<LoginPensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPensionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
