import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarPesionComponent } from './sidebar-pesion.component';

describe('SidebarPesionComponent', () => {
  let component: SidebarPesionComponent;
  let fixture: ComponentFixture<SidebarPesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarPesionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarPesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
