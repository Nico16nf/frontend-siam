import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginCiamComponent } from './login-ciam.component';

describe('LoginCiamComponent', () => {
  let component: LoginCiamComponent;
  let fixture: ComponentFixture<LoginCiamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCiamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginCiamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
