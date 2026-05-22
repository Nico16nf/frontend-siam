import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-admin.component.html',
  styleUrl: './sidebar-admin.component.css'
})
export class SidebarAdminComponent {

  usuario: any = null;
  sidebarAbierto = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    if (isPlatformBrowser(this.platformId)) {
      const data = sessionStorage.getItem('sessionAdmin');
      this.usuario = data ? JSON.parse(data) : null;
    }
  }

  toggleSidebar(): void {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebar(): void {
    this.sidebarAbierto = false;
  }

  irPerfil(): void {
    this.cerrarSidebar();
    this.router.navigate(['/admin/perfil']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }

    this.router.navigate(['/login-admin']);
  }
}
