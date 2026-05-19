import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HttpClient,
  HttpClientModule,
  HttpParams
} from '@angular/common/http';

import { Router } from '@angular/router';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-login-salud',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login-salud.component.html',
  styleUrl: './login-salud.component.css'
})
export class LoginSaludComponent implements OnInit {

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

    const backendHost =
      host === 'localhost'
        ? 'localhost'
        : host;

    this.apiUrl =
      `http://${backendHost}:8080/api/usuarios/login/salud`;

    console.log('API URL SALUD:', this.apiUrl);

    this.validarSesionExistente();
  }

  iniciarSesion(): void {

    this.mensajeError = '';

    if (!this.esNavegador()) {
      return;
    }

    if (
      !this.usuario.trim() ||
      !this.password.trim()
    ) {

      this.mensajeError =
        'Ingrese usuario y contraseña';

      return;
    }

    if (!this.apiUrl) {

      this.mensajeError =
        'No se pudo conectar con el servidor';

      return;
    }

    this.cargando = true;

    const params = new HttpParams()
      .set('usuario', this.usuario.trim())
      .set('password', this.password.trim());

    this.http.post<any>(
      this.apiUrl,
      null,
      { params }
    )
    .pipe(timeout(8000))
    .subscribe({

      next: (usuarioLogueado) => {

        this.cargando = false;

        if (
          !usuarioLogueado ||
          usuarioLogueado.rol !== 'SALUD'
        ) {

          this.mensajeError =
            'No tienes acceso como personal de salud';

          sessionStorage.removeItem('sessionSalud');

          return;
        }

        const session = {

          id: usuarioLogueado.id,

          usuario: usuarioLogueado.usuario,

          nombres: usuarioLogueado.nombres,

          apellidos: usuarioLogueado.apellidos,

          rol: usuarioLogueado.rol,

          exp:
            new Date().getTime()
            + (60 * 60 * 1000)
        };

        sessionStorage.setItem(
          'sessionSalud',
          JSON.stringify(session)
        );

        this.router.navigate(
          ['/salud'],
          { replaceUrl: true }
        );
      },

      error: (error) => {

        this.cargando = false;

        console.error(
          'Error login SALUD:',
          error
        );

        if (error.name === 'TimeoutError') {

          this.mensajeError =
            'El servidor no responde. Revisa IP, puerto 8080 o firewall.';

          return;
        }

        if (error.status === 0) {

          this.mensajeError =
            'No hay conexión con el backend. Revisa CORS o firewall.';

          return;
        }

        if (typeof error.error === 'string') {

          this.mensajeError =
            error.error;

          return;
        }

        this.mensajeError =
          error?.error?.message
          || 'Usuario o contraseña incorrectos';
      }
    });
  }

  private validarSesionExistente(): void {

    const session =
      sessionStorage.getItem('sessionSalud');

    if (!session) {
      return;
    }

    try {

      const data =
        JSON.parse(session);

      const ahora =
        new Date().getTime();

      if (
        data.exp > ahora &&
        data.rol === 'SALUD'
      ) {

        this.router.navigate(
          ['/salud'],
          { replaceUrl: true }
        );

      } else {

        sessionStorage.removeItem('sessionSalud');
      }

    } catch {

      sessionStorage.removeItem('sessionSalud');
    }
  }

  private esNavegador(): boolean {

    return isPlatformBrowser(this.platformId);
  }
}