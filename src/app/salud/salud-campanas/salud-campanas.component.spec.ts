import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaludCampanasComponent } from './salud-campanas.component';

describe('SaludCampanasComponent', () => {
  let component: SaludCampanasComponent;
  let fixture: ComponentFixture<SaludCampanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaludCampanasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaludCampanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
