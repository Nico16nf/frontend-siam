import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamCasoSocialComponent } from './ciam-caso-social.component';

describe('CiamCasoSocialComponent', () => {
  let component: CiamCasoSocialComponent;
  let fixture: ComponentFixture<CiamCasoSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamCasoSocialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamCasoSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
