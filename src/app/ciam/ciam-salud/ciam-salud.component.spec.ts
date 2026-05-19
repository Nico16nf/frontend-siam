import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamSaludComponent } from './ciam-salud.component';

describe('CiamSaludComponent', () => {
  let component: CiamSaludComponent;
  let fixture: ComponentFixture<CiamSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamSaludComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
