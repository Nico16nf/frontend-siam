import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludHistorialComponent } from './salud-historial.component';

describe('SaludHistorialComponent', () => {
  let component: SaludHistorialComponent;
  let fixture: ComponentFixture<SaludHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
