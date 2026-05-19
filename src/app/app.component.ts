import {
  Component,
  Inject,
  PLATFORM_ID
} from '@angular/core';

import {
  Router,
  NavigationEnd,
  RouterOutlet
} from '@angular/router';

import {
  isPlatformBrowser,
  CommonModule
} from '@angular/common';

import { NavbarGeneralComponent } from './nav/navbar-general/navbar-general.component';
import { SidebarAdminComponent } from './nav/sidebar-admin/sidebar-admin.component';
import { SidebarCiamComponent } from './nav/sidebar-ciam/sidebar-ciam.component';
import { SidebarSaludComponent } from './nav/sidebar-salud/sidebar-salud.component';
import { SidebarPesionComponent } from './nav/sidebar-pesion/sidebar-pesion.component';
import { FooterComponent } from './nav/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    NavbarGeneralComponent,

    SidebarAdminComponent,
    SidebarCiamComponent,
    SidebarSaludComponent,
    SidebarPesionComponent,

    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  mostrarNavbarFooter = true;

  esAdmin = false;
  esCiam = false;
  esSalud = false;
  esPension = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID)
    private platformId: Object
  ) {

    this.router.events.subscribe(event => {

      if (!(event instanceof NavigationEnd)) {
        return;
      }

      const ruta = event.urlAfterRedirects;
      const esBrowser = isPlatformBrowser(this.platformId);

      let sessionAdmin: any = null;
      let sessionCiam: any = null;
      let sessionSalud: any = null;
      let sessionPension: any = null;

      if (esBrowser) {

        const dataAdmin = sessionStorage.getItem('sessionAdmin');
        const dataCiam = sessionStorage.getItem('sessionCiam');
        const dataSalud = sessionStorage.getItem('sessionSalud');
        const dataPension = sessionStorage.getItem('sessionPension');

        sessionAdmin = dataAdmin ? JSON.parse(dataAdmin) : null;
        sessionCiam = dataCiam ? JSON.parse(dataCiam) : null;
        sessionSalud = dataSalud ? JSON.parse(dataSalud) : null;
        sessionPension = dataPension ? JSON.parse(dataPension) : null;
      }

      const ahora = Date.now();

      if (ruta.startsWith('/admin')) {
        if (
          !esBrowser ||
          !sessionAdmin ||
          sessionAdmin.exp < ahora ||
          sessionAdmin.rol !== 'ADMIN'
        ) {
          if (esBrowser) {
            sessionStorage.removeItem('sessionAdmin');
          }

          this.router.navigate(['/login-admin']);
          return;
        }
      }

      if (ruta.startsWith('/ciam')) {
        if (
          !esBrowser ||
          !sessionCiam ||
          sessionCiam.exp < ahora ||
          sessionCiam.rol !== 'CIAM'
        ) {
          if (esBrowser) {
            sessionStorage.removeItem('sessionCiam');
          }

          this.router.navigate(['/login-ciam']);
          return;
        }
      }

      if (ruta.startsWith('/salud')) {
        if (
          !esBrowser ||
          !sessionSalud ||
          sessionSalud.exp < ahora ||
          sessionSalud.rol !== 'SALUD'
        ) {
          if (esBrowser) {
            sessionStorage.removeItem('sessionSalud');
          }

          this.router.navigate(['/login-salud']);
          return;
        }
      }

      if (ruta.startsWith('/pension')) {
        if (
          !esBrowser ||
          !sessionPension ||
          sessionPension.exp < ahora ||
          sessionPension.rol !== 'PENSION'
        ) {
          if (esBrowser) {
            sessionStorage.removeItem('sessionPension');
          }

          this.router.navigate(['/login-pension']);
          return;
        }
      }

      this.esAdmin = ruta.startsWith('/admin');
      this.esCiam = ruta.startsWith('/ciam');
      this.esSalud = ruta.startsWith('/salud');
      this.esPension = ruta.startsWith('/pension');

      this.mostrarNavbarFooter =
        !this.esAdmin &&
        !this.esCiam &&
        !this.esSalud &&
        !this.esPension;
    });
  }
}