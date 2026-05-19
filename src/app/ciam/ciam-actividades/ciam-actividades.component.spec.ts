import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamActividadesComponent } from './ciam-actividades.component';

describe('CiamActividadesComponent', () => {
  let component: CiamActividadesComponent;
  let fixture: ComponentFixture<CiamActividadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamActividadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamActividadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
