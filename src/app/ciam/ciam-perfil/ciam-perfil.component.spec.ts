import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CiamPerfilComponent } from './ciam-perfil.component';

describe('CiamPerfilComponent', () => {
  let component: CiamPerfilComponent;
  let fixture: ComponentFixture<CiamPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CiamPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CiamPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
