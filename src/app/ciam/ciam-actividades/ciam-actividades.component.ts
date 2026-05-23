import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

interface ActividadCiam {
  id?: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  lugar: string;
  fecha: string;
  responsable: string;
  cupos: number | null;
  activa?: boolean;
}

@Component({
  selector: 'app-ciam-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-actividades.component.html',
  styleUrl: './ciam-actividades.component.css'
})
export class CiamActividadesComponent implements OnInit {

  actividades: ActividadCiam[] = [];
  cargando = false;
  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  private apiUrl = '';

  actividad: ActividadCiam = {
    nombre: '',
    tipo: '',
    descripcion: '',
    lugar: '',
    fecha: '',
    responsable: '',
    cupos: null,
    activa: true
  };

  tiposActividad: string[] = [
    'Gimnasia',
    'Taller de memoria',
    'Campaña médica',
    'Danza',
    'Manualidades',
    'Terapia física',
    'Charla educativa',
    'Integración social',
    'Paseo recreativo',
    'Taller digital'
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = window.location.hostname;
    const backendHost = host === 'localhost'
      ? 'localhost:8080'
      : 'backend-siam-production.up.railway.app';

    const protocol = host === 'localhost' ? 'http' : 'https';

    this.apiUrl = `https://backend-siam-production.up.railway.app/api/actividades-ciam`;

    this.listarActividades();
  }

  listarActividades(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.http.get<ActividadCiam[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.actividades = data;
          this.cargando = false;
        },
        error: () => {
          this.mensajeError = 'No se pudieron cargar las actividades del CIAM.';
          this.cargando = false;
        }
      });
  }

  crearActividad(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.validarFormulario()) return;

    this.guardando = true;

    this.http.post<ActividadCiam>(this.apiUrl, this.actividad)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensajeExito = 'Actividad CIAM registrada correctamente.';
          this.guardando = false;
          this.limpiarFormulario();
          this.listarActividades();
        },
        error: () => {
          this.mensajeError = 'No se pudo registrar la actividad. Verifica el backend.';
          this.guardando = false;
        }
      });
  }

  eliminarActividad(id?: number): void {
    if (!id) return;

    const confirmar = confirm('¿Deseas eliminar esta actividad del CIAM?');
    if (!confirmar) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensajeExito = 'Actividad eliminada correctamente.';
          this.listarActividades();
        },
        error: () => {
          this.mensajeError = 'No se pudo eliminar la actividad.';
        }
      });
  }

  validarFormulario(): boolean {
    if (!this.actividad.nombre.trim()) {
      this.mensajeError = 'El nombre de la actividad es obligatorio.';
      return false;
    }

    if (!this.actividad.tipo.trim()) {
      this.mensajeError = 'Selecciona el tipo de actividad.';
      return false;
    }

    if (!this.actividad.fecha) {
      this.mensajeError = 'La fecha de la actividad es obligatoria.';
      return false;
    }

    if (!this.actividad.lugar.trim()) {
      this.mensajeError = 'El lugar es obligatorio.';
      return false;
    }

    if (!this.actividad.responsable.trim()) {
      this.mensajeError = 'El responsable es obligatorio.';
      return false;
    }

    if (this.actividad.cupos !== null && this.actividad.cupos < 0) {
      this.mensajeError = 'Los cupos no pueden ser negativos.';
      return false;
    }

    return true;
  }

  limpiarFormulario(): void {
    this.actividad = {
      nombre: '',
      tipo: '',
      descripcion: '',
      lugar: '',
      fecha: '',
      responsable: '',
      cupos: null,
      activa: true
    };
  }

  totalActivas(): number {
    return this.actividades.filter(a => a.activa).length;
  }

  totalInactivas(): number {
    return this.actividades.filter(a => !a.activa).length;
  }
}