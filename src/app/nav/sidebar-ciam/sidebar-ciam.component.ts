import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-ciam',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-ciam.component.html',
  styleUrl: './sidebar-ciam.component.css'
})
export class SidebarCiamComponent implements OnInit {

  abierto = false;

  usuario: any = {
    nombres: 'Responsable CIAM',
    rol: 'CIAM'
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const session = sessionStorage.getItem('sessionCiam');

    if (session) {
      try {
        this.usuario = JSON.parse(session);
      } catch {
        this.usuario = {
          nombres: 'Responsable CIAM',
          rol: 'CIAM'
        };
      }
    }
  }

  toggleMenu(): void {
    this.abierto = !this.abierto;
  }

  cerrarMenu(): void {
    this.abierto = false;
  }

  irPerfil(): void {
    this.cerrarMenu();
    this.router.navigate(['/ciam/perfil']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('sessionCiam');
      localStorage.removeItem('rol');
    }

    this.router.navigate(['/login-ciam']);
  }
}