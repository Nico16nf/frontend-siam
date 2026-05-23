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

  // 🔷 NUEVOS ESTADOS PARA CONTROLAR LA INTERFAZ
  isCollapsed = false;       // Controla el colapso en escritorio
  isMobileActive = false;     // Controla el drawer lateral en móvil

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
    this.closeMobileSidebar(); // Asegura cerrar en móviles al navegar
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.clear();
    }

    this.router.navigate(['/login-admin']);
    this.closeMobileSidebar(); // Asegura cerrar en móviles al salir
  }

  // 🔷 MÉTODOS DE CONTROL PARA LA INTERFAZ (Resuelven los errores de compilación)
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileActive = !this.isMobileActive;
  }

  closeMobileSidebar() {
    this.isMobileActive = false;
  }
}
