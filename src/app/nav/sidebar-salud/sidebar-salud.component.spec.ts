import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSaludComponent } from './sidebar-salud.component';

describe('SidebarSaludComponent', () => {
  let component: SidebarSaludComponent;
  let fixture: ComponentFixture<SidebarSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSaludComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
