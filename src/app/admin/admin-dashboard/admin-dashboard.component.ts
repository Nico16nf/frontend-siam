import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  usuario: any;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.validarSesion();
  }

  private validarSesion(): void {

    const session = sessionStorage.getItem('sessionAdmin');

    if (!session) {
      this.router.navigate(['/login-admin'], { replaceUrl: true });
      return;
    }

    try {
      const data = JSON.parse(session);
      const ahora = Date.now();

      if (data.exp < ahora || data.rol !== 'ADMIN') {
        sessionStorage.removeItem('sessionAdmin');
        this.router.navigate(['/login-admin'], { replaceUrl: true });
        return;
      }

      this.usuario = data;

    } catch {
      sessionStorage.removeItem('sessionAdmin');
      this.router.navigate(['/login-admin'], { replaceUrl: true });
    }
  }
}