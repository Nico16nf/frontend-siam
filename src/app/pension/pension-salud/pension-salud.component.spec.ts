import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionSaludComponent } from './pension-salud.component';

describe('PensionSaludComponent', () => {
  let component: PensionSaludComponent;
  let fixture: ComponentFixture<PensionSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionSaludComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
