import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludPacientesComponent } from './salud-pacientes.component';

describe('SaludPacientesComponent', () => {
  let component: SaludPacientesComponent;
  let fixture: ComponentFixture<SaludPacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludPacientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludPacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
