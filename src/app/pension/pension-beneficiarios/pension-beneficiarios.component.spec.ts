import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionBeneficiariosComponent } from './pension-beneficiarios.component';

describe('PensionBeneficiariosComponent', () => {
  let component: PensionBeneficiariosComponent;
  let fixture: ComponentFixture<PensionBeneficiariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionBeneficiariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionBeneficiariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
