import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent implements OnInit {

  usuario = '';
  password = '';
  mensajeError = '';
  cargando = false;

  private apiUrl = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = window.location.hostname;
    const backendHost = host === 'localhost' ? 'localhost' : host;

    this.apiUrl = `https://backend-siam-production.up.railway.app/api/usuarios/login/admin`;

    console.log('API URL:', this.apiUrl);

    const session = sessionStorage.getItem('sessionAdmin');

    if (!session) return;

    try {
      const data = JSON.parse(session);
      const ahora = new Date().getTime();

      if (data.exp > ahora && data.rol === 'ADMIN') {
        if (this.router.url !== '/admin') {
          this.router.navigate(['/admin'], { replaceUrl: true });
        }
      } else {
        sessionStorage.removeItem('sessionAdmin');
      }
    } catch {
      sessionStorage.removeItem('sessionAdmin');
    }
  }

  iniciarSesion(): void {
    this.mensajeError = '';

    if (!this.usuario.trim() || !this.password.trim()) {
      this.mensajeError = 'Ingrese usuario y contraseña';
      return;
    }

    if (!this.apiUrl) {
      this.mensajeError = 'No se pudo conectar con el servidor';
      return;
    }

    this.cargando = true;

    const params = new HttpParams()
      .set('usuario', this.usuario.trim())
      .set('password', this.password.trim());

    this.http.post<any>(this.apiUrl, null, { params })
      .pipe(timeout(8000))
      .subscribe({
        next: (usuarioLogueado) => {
          this.cargando = false;

          if (!usuarioLogueado || usuarioLogueado.rol !== 'ADMIN') {
            this.mensajeError = 'No tienes acceso como administrador';
            sessionStorage.removeItem('sessionAdmin');
            return;
          }

          const session = {
            id: usuarioLogueado.id,
            usuario: usuarioLogueado.usuario,
            nombres: usuarioLogueado.nombres,
            apellidos: usuarioLogueado.apellidos,
            rol: usuarioLogueado.rol,
            exp: new Date().getTime() + (60 * 60 * 1000)
          };

          sessionStorage.setItem('sessionAdmin', JSON.stringify(session));

          if (this.router.url !== '/admin') {
            this.router.navigate(['/admin'], { replaceUrl: true });
          }
        },

        error: (error) => {
          this.cargando = false;

          console.error('Error login:', error);

          if (error.name === 'TimeoutError') {
            this.mensajeError = 'El servidor no responde. Revisa la IP, puerto 8080 o firewall.';
            return;
          }

          if (error.status === 0) {
            this.mensajeError = 'No hay conexión con el backend. Revisa CORS, IP o firewall.';
            return;
          }

          this.mensajeError =
            error?.error?.message ||
            error?.error ||
            'Usuario o contraseña incorrectos';
        }
      });
  }
}
