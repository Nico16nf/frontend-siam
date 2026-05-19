import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSaludComponent } from './login-salud.component';

describe('LoginSaludComponent', () => {
  let component: LoginSaludComponent;
  let fixture: ComponentFixture<LoginSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSaludComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
