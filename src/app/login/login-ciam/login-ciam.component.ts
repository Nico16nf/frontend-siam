import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login-ciam',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login-ciam.component.html',
  styleUrl: './login-ciam.component.css'
})
export class LoginCiamComponent implements OnInit {

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

    this.apiUrl = `http://${backendHost}:8080/api/usuarios/login/ciam`;

    console.log('API URL CIAM:', this.apiUrl);

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

          if (!usuarioLogueado || usuarioLogueado.rol !== 'CIAM') {
            this.mensajeError = 'No tienes acceso como responsable CIAM';
            sessionStorage.removeItem('sessionCiam');
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

          sessionStorage.setItem('sessionCiam', JSON.stringify(session));

          this.router.navigate(['/ciam'], { replaceUrl: true });
        },

        error: (error) => {

          this.cargando = false;

          console.error('Error login CIAM:', error);

          if (error.name === 'TimeoutError') {
            this.mensajeError = 'El servidor no responde. Revisa la IP, puerto 8080 o firewall.';
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

    const session = sessionStorage.getItem('sessionCiam');

    if (!session) {
      return;
    }

    try {

      const data = JSON.parse(session);
      const ahora = new Date().getTime();

      if (data.exp > ahora && data.rol === 'CIAM') {
        this.router.navigate(['/ciam'], { replaceUrl: true });
      } else {
        sessionStorage.removeItem('sessionCiam');
      }

    } catch {
      sessionStorage.removeItem('sessionCiam');
    }
  }

  private esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}