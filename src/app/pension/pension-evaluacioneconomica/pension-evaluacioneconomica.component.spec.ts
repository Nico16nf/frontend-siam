import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionEvaluacioneconomicaComponent } from './pension-evaluacioneconomica.component';

describe('PensionEvaluacioneconomicaComponent', () => {
  let component: PensionEvaluacioneconomicaComponent;
  let fixture: ComponentFixture<PensionEvaluacioneconomicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionEvaluacioneconomicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionEvaluacioneconomicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
