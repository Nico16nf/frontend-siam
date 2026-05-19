import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPersonalizarComponent } from './admin-personalizar.component';

describe('AdminPersonalizarComponent', () => {
  let component: AdminPersonalizarComponent;
  let fixture: ComponentFixture<AdminPersonalizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPersonalizarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPersonalizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
