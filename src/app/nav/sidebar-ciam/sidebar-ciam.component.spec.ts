import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarCiamComponent } from './sidebar-ciam.component';

describe('SidebarCiamComponent', () => {
  let component: SidebarCiamComponent;
  let fixture: ComponentFixture<SidebarCiamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCiamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarCiamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
