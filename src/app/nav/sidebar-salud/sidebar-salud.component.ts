import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-salud',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-salud.component.html',
  styleUrl: './sidebar-salud.component.css'
})
export class SidebarSaludComponent implements OnInit {

  usuario: any = null;
  sidebarColapsado = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const session = sessionStorage.getItem('sessionSalud');

    if (session) {
      this.usuario = JSON.parse(session);
    }
  }

  toggleSidebar(): void {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

  irPerfil(): void {
    this.router.navigate(['/salud']);
  }

  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('sessionSalud');
    }

    this.router.navigate(['/login-salud']);
  }
}