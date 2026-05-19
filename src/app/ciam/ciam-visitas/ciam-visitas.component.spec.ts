import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamVisitasComponent } from './ciam-visitas.component';

describe('CiamVisitasComponent', () => {
  let component: CiamVisitasComponent;
  let fixture: ComponentFixture<CiamVisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamVisitasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamVisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
