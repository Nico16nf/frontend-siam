import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSeguridadComponent } from './admin-seguridad.component';

describe('AdminSeguridadComponent', () => {
  let component: AdminSeguridadComponent;
  let fixture: ComponentFixture<AdminSeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSeguridadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
