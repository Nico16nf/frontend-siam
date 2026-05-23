import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login-pension',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './login-pension.component.html',
  styleUrl: './login-pension.component.css'
})
export class LoginPensionComponent implements OnInit {

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

    if (!this.esNavegador()) {
      return;
    }

    const host = window.location.hostname;
    const backendHost = host === 'localhost' ? 'localhost' : host;

    this.apiUrl = `https://backend-siam-production.up.railway.app/api/usuarios/login/pension`;

    this.validarSesionExistente();
  }

  iniciarSesion(): void {

    this.mensajeError = '';

    if (!this.esNavegador()) {
      return;
    }

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

          const rol = usuarioLogueado?.rol;

          if (!usuarioLogueado || (rol !== 'PENSION' && rol !== 'PENSION_65')) {
            this.mensajeError = 'No tienes acceso como responsable de Pensión 65';
            sessionStorage.removeItem('sessionPension');
            return;
          }

          const session = {
            id: usuarioLogueado.id,
            usuario: usuarioLogueado.usuario,
            nombres: usuarioLogueado.nombres,
            apellidos: usuarioLogueado.apellidos,
            rol: 'PENSION',
            rolOriginal: rol,
            exp: Date.now() + (60 * 60 * 1000)
          };

          sessionStorage.setItem('sessionPension', JSON.stringify(session));

          this.router.navigate(['/pension'], { replaceUrl: true });
        },

        error: (error) => {

          this.cargando = false;

          console.error('Error login Pensión 65:', error);

          if (error.name === 'TimeoutError') {
            this.mensajeError = 'El servidor no responde. Revisa el puerto 8080.';
            return;
          }

          if (error.status === 0) {
            this.mensajeError = 'No hay conexión con el backend. Revisa CORS, IP o firewall.';
            return;
          }

          if (typeof error.error === 'string') {
            this.mensajeError = error.error;
            return;
          }

          this.mensajeError =
            error?.error?.message ||
            'Usuario o contraseña incorrectos';
        }
      });
  }

  private validarSesionExistente(): void {

    if (!this.esNavegador()) {
      return;
    }

    const session = sessionStorage.getItem('sessionPension');

    if (!session) {
      return;
    }

    try {
      const data = JSON.parse(session);
      const ahora = Date.now();

      if (
        data.exp > ahora &&
        (data.rol === 'PENSION' || data.rol === 'PENSION_65')
      ) {
        this.router.navigate(['/pension'], { replaceUrl: true });
      } else {
        sessionStorage.removeItem('sessionPension');
      }

    } catch {
      sessionStorage.removeItem('sessionPension');
    }
  }

  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}