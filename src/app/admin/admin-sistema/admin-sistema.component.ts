import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-sistema.component.html',
  styleUrl: './admin-sistema.component.css'
})
export class AdminSistemaComponent {

  apiUrl = '';
  mensaje = '';
  error = '';
  cargando = false;

  rutaArchivo = '';
  frecuencia = 'DIARIO';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      const backendHost = host === 'localhost' ? 'localhost' : host;

      this.apiUrl = `http://${backendHost}:8080/api/admin/datos`;
    }
  }

  limpiarMensajes() {
    this.mensaje = '';
    this.error = '';
  }

  backupManual() {
    this.limpiarMensajes();
    this.cargando = true;

    this.http.post<any>(`${this.apiUrl}/backup`, {}).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = `${res.mensaje}. Archivo: ${res.archivo}`;
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al generar backup';
      }
    });
  }

  restaurarBaseDatos() {
    this.limpiarMensajes();

    if (!this.rutaArchivo.trim()) {
      this.error = 'Ingrese la ruta del archivo backup';
      return;
    }

    this.cargando = true;

    this.http.post<any>(
      `${this.apiUrl}/restaurar`,
      null,
      { params: { rutaArchivo: this.rutaArchivo.trim() } }
    ).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = res.mensaje || 'Base de datos restaurada correctamente';
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al restaurar base de datos';
      }
    });
  }

  configurarBackupAutomatico() {
    this.limpiarMensajes();
    this.cargando = true;

    this.http.post<any>(
      `${this.apiUrl}/backup-automatico`,
      null,
      { params: { frecuencia: this.frecuencia } }
    ).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = res.mensaje || 'Backup automático configurado';
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al configurar backup automático';
      }
    });
  }

  exportarBaseCompleta() {
    this.limpiarMensajes();
    this.cargando = true;

    this.http.get<any>(`${this.apiUrl}/exportar`).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = `Base exportada correctamente. Archivo: ${res.archivo}`;
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al exportar base completa';
      }
    });
  }

  migrarDatos() {
    this.limpiarMensajes();
    this.cargando = true;

    this.http.post<any>(`${this.apiUrl}/migrar`, {}).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = res.mensaje || 'Migración ejecutada correctamente';
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al migrar datos';
      }
    });
  }

  limpiarDuplicados() {
    this.limpiarMensajes();
    this.cargando = true;

    this.http.delete<any>(`${this.apiUrl}/duplicados`).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensaje = res.mensaje || 'Registros duplicados eliminados';
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.error = err.error?.message || err.error?.mensaje || 'Error al limpiar duplicados';
      }
    });
  }
}