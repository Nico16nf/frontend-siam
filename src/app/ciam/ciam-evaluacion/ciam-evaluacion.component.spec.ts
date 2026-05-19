import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamEvaluacionComponent } from './ciam-evaluacion.component';

describe('CiamEvaluacionComponent', () => {
  let component: CiamEvaluacionComponent;
  let fixture: ComponentFixture<CiamEvaluacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamEvaluacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
