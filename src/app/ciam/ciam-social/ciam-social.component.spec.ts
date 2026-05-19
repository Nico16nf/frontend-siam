import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamSocialComponent } from './ciam-social.component';

describe('CiamSocialComponent', () => {
  let component: CiamSocialComponent;
  let fixture: ComponentFixture<CiamSocialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamSocialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamSocialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
