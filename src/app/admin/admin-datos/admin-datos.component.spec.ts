import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDatosComponent } from './admin-datos.component';

describe('AdminDatosComponent', () => {
  let component: AdminDatosComponent;
  let fixture: ComponentFixture<AdminDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDatosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
