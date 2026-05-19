import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionPagosComponent } from './pension-pagos.component';

describe('PensionPagosComponent', () => {
  let component: PensionPagosComponent;
  let fixture: ComponentFixture<PensionPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionPagosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PensionPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
