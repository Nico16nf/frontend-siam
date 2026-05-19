import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamBusquedaComponent } from './ciam-busqueda.component';

describe('CiamBusquedaComponent', () => {
  let component: CiamBusquedaComponent;
  let fixture: ComponentFixture<CiamBusquedaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamBusquedaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
