import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-navbar-general',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule // 👈 SOLUCIÓN
  ],
  templateUrl: './navbar-general.component.html',
  styleUrl: './navbar-general.component.css'
})
export class NavbarGeneralComponent {

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}