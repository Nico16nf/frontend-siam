import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamRegistraradultoComponent } from './ciam-registraradulto.component';

describe('CiamRegistraradultoComponent', () => {
  let component: CiamRegistraradultoComponent;
  let fixture: ComponentFixture<CiamRegistraradultoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamRegistraradultoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamRegistraradultoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
