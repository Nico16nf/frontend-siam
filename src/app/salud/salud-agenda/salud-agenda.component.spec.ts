import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludAgendaComponent } from './salud-agenda.component';

describe('SaludAgendaComponent', () => {
  let component: SaludAgendaComponent;
  let fixture: ComponentFixture<SaludAgendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludAgendaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludAgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
