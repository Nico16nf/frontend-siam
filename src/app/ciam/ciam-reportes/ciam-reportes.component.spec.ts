import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamReportesComponent } from './ciam-reportes.component';

describe('CiamReportesComponent', () => {
  let component: CiamReportesComponent;
  let fixture: ComponentFixture<CiamReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
