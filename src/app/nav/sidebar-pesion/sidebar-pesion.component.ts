import {
  Component,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-pesion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar-pesion.component.html',
  styleUrl: './sidebar-pesion.component.css'
})
export class SidebarPesionComponent {

  sidebarColapsado = false;

  usuario: any = null;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {

    if (isPlatformBrowser(this.platformId)) {

      const session =
        sessionStorage.getItem('sessionPension');

      if (session) {
        this.usuario = JSON.parse(session);
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarColapsado =
      !this.sidebarColapsado;
  }

  irPerfil(): void {
    this.router.navigate(['/pension']);
  }

  cerrarSesion(): void {

    sessionStorage.removeItem('sessionPension');

    this.router.navigate(['/login-pension']);
  }
}