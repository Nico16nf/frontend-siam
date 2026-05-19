import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludDashboardComponent } from './salud-dashboard.component';

describe('SaludDashboardComponent', () => {
  let component: SaludDashboardComponent;
  let fixture: ComponentFixture<SaludDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
