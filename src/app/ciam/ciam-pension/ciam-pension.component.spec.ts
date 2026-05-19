import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamPensionComponent } from './ciam-pension.component';

describe('CiamPensionComponent', () => {
  let component: CiamPensionComponent;
  let fixture: ComponentFixture<CiamPensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamPensionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamPensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
