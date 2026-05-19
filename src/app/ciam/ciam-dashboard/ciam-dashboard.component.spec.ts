import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamDashboardComponent } from './ciam-dashboard.component';

describe('CiamDashboardComponent', () => {
  let component: CiamDashboardComponent;
  let fixture: ComponentFixture<CiamDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
