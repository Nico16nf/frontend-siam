import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionReportesComponent } from './pension-reportes.component';

describe('PensionReportesComponent', () => {
  let component: PensionReportesComponent;
  let fixture: ComponentFixture<PensionReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
