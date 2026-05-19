import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionVisitasComponent } from './pension-visitas.component';

describe('PensionVisitasComponent', () => {
  let component: PensionVisitasComponent;
  let fixture: ComponentFixture<PensionVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionVisitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
