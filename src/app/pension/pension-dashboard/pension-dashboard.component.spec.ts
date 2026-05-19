import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionDashboardComponent } from './pension-dashboard.component';

describe('PensionDashboardComponent', () => {
  let component: PensionDashboardComponent;
  let fixture: ComponentFixture<PensionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
