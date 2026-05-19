import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludVisitasComponent } from './salud-visitas.component';

describe('SaludVisitasComponent', () => {
  let component: SaludVisitasComponent;
  let fixture: ComponentFixture<SaludVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludVisitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
