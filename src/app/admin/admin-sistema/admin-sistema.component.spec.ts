import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSistemaComponent } from './admin-sistema.component';

describe('AdminSistemaComponent', () => {
  let component: AdminSistemaComponent;
  let fixture: ComponentFixture<AdminSistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSistemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
