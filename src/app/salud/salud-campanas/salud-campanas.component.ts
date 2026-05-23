import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-salud-campanas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './salud-campanas.component.html',
  styleUrl: './salud-campanas.component.css'
})
export class SaludCampanasComponent implements OnInit {

  // =========================================================
  // DATOS
  // =========================================================

  campanas: any[] = [];
  campanasFiltradas: any[] = [];

  campanaSeleccionada: any = null;

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  filtro = '';
  filtroEstado = '';
  filtroTipo = '';

  vistaFormulario = false;

  // =========================================================
  // API
  // =========================================================

  private apiUrl = '';

  // =========================================================
  // FORMULARIO
  // =========================================================

  formulario: any = this.nuevaCampana();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = window.location.hostname;

    this.apiUrl = `https://backend-siam-production.up.railway.app/api/campanas-salud`;

    this.cargarCampanas();
  }

  // =========================================================
  // NUEVO FORM
  // =========================================================

  nuevaCampana(): any {

    return {

      nombreCampana: '',
      tipoCampana: '',
      descripcion: '',

      lugar: '',
      distrito: '',
      centroPoblado: '',

      fechaInicio: '',
      fechaFin: '',

      responsable: '',
      establecimientoSalud: '',

      objetivo: '',
      servicios: '',
      poblacionObjetivo: '',

      metaAtenciones: 0,
      totalAtendidos: 0,

      estado: 'PROGRAMADA',

      observaciones: '',

      imagen: ''
    };
  }

  // =========================================================
  // CARGAR
  // =========================================================

  cargarCampanas(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({

        next: (data) => {

          this.campanas = data || [];
          this.campanasFiltradas = [...this.campanas];

          this.cargando = false;
        },

        error: (err) => {

          console.error(err);

          this.error =
            'No se pudieron cargar las campañas de salud';

          this.cargando = false;
        }
      });
  }

  // =========================================================
  // REGISTRAR
  // =========================================================

  registrarCampana(): void {

    this.mensaje = '';
    this.error = '';

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    this.http.post<any>(
      this.apiUrl,
      this.formulario
    )
      .pipe(timeout(10000))
      .subscribe({

        next: () => {

          this.guardando = false;

          this.mensaje =
            'Campaña registrada correctamente';

          this.formulario = this.nuevaCampana();

          this.vistaFormulario = false;

          this.cargarCampanas();
        },

        error: (err) => {

          console.error(err);

          this.guardando = false;

          this.error =
            err?.error?.message ||
            'No se pudo registrar la campaña';
        }
      });
  }

  // =========================================================
  // ACTUALIZAR
  // =========================================================

  actualizarCampana(): void {

    this.mensaje = '';
    this.error = '';

    if (!this.campanaSeleccionada?.id) {
      this.error = 'Seleccione una campaña';
      return;
    }

    if (!this.validarFormulario()) {
      return;
    }

    this.guardando = true;

    this.http.put<any>(
      `${this.apiUrl}/${this.campanaSeleccionada.id}`,
      this.formulario
    )
      .pipe(timeout(10000))
      .subscribe({

        next: () => {

          this.guardando = false;

          this.mensaje =
            'Campaña actualizada correctamente';

          this.formulario = this.nuevaCampana();

          this.campanaSeleccionada = null;

          this.vistaFormulario = false;

          this.cargarCampanas();
        },

        error: (err) => {

          console.error(err);

          this.guardando = false;

          this.error =
            err?.error?.message ||
            'No se pudo actualizar la campaña';
        }
      });
  }

  // =========================================================
  // ELIMINAR
  // =========================================================

  eliminarCampana(campana: any): void {

    const confirmar = confirm(
      `¿Eliminar la campaña "${campana.nombreCampana}"?`
    );

    if (!confirmar) return;

    this.http.delete(
      `${this.apiUrl}/${campana.id}`,
      { responseType: 'text' }
    )
      .pipe(timeout(10000))
      .subscribe({

        next: () => {

          this.mensaje =
            'Campaña eliminada correctamente';

          this.cargarCampanas();
        },

        error: (err) => {

          console.error(err);

          this.error =
            err?.error ||
            'No se pudo eliminar la campaña';
        }
      });
  }

  // =========================================================
  // SELECCIONAR
  // =========================================================

  seleccionarCampana(campana: any): void {

    this.campanaSeleccionada = campana;

    this.formulario = {
      ...campana
    };

    this.vistaFormulario = true;

    this.mensaje = '';
    this.error = '';
  }

  // =========================================================
  // NUEVA
  // =========================================================

  nueva(): void {

    this.campanaSeleccionada = null;

    this.formulario = this.nuevaCampana();

    this.vistaFormulario = true;

    this.mensaje = '';
    this.error = '';
  }

  // =========================================================
  // CANCELAR
  // =========================================================

  cancelar(): void {

    this.vistaFormulario = false;

    this.campanaSeleccionada = null;

    this.formulario = this.nuevaCampana();

    this.mensaje = '';
    this.error = '';
  }

  // =========================================================
  // VALIDAR
  // =========================================================

  validarFormulario(): boolean {

    if (!this.formulario.nombreCampana?.trim()) {
      this.error =
        'Ingrese el nombre de la campaña';
      return false;
    }

    if (!this.formulario.tipoCampana?.trim()) {
      this.error =
        'Seleccione el tipo de campaña';
      return false;
    }

    if (!this.formulario.lugar?.trim()) {
      this.error =
        'Ingrese el lugar de la campaña';
      return false;
    }

    if (!this.formulario.fechaInicio) {
      this.error =
        'Seleccione la fecha de inicio';
      return false;
    }

    if (!this.formulario.fechaFin) {
      this.error =
        'Seleccione la fecha fin';
      return false;
    }

    if (
      new Date(this.formulario.fechaFin) <
      new Date(this.formulario.fechaInicio)
    ) {
      this.error =
        'La fecha fin no puede ser menor';
      return false;
    }

    if (!this.formulario.responsable?.trim()) {
      this.error =
        'Ingrese el responsable';
      return false;
    }

    if (!this.formulario.establecimientoSalud?.trim()) {
      this.error =
        'Ingrese el establecimiento';
      return false;
    }

    return true;
  }

  // =========================================================
  // FILTRAR
  // =========================================================

  filtrar(): void {

    let lista = [...this.campanas];

    // TEXTO
    if (this.filtro.trim()) {

      const texto =
        this.filtro.toLowerCase();

      lista = lista.filter(c =>

        c.nombreCampana
          ?.toLowerCase()
          .includes(texto)

        ||

        c.lugar
          ?.toLowerCase()
          .includes(texto)

        ||

        c.distrito
          ?.toLowerCase()
          .includes(texto)
      );
    }

    // ESTADO
    if (this.filtroEstado) {

      lista = lista.filter(c =>
        c.estado === this.filtroEstado
      );
    }

    // TIPO
    if (this.filtroTipo) {

      lista = lista.filter(c =>
        c.tipoCampana === this.filtroTipo
      );
    }

    this.campanasFiltradas = lista;
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

  cambiarEstado(
    campana: any,
    estado: string
  ): void {

    const params = new HttpParams()
      .set('estado', estado);

    this.http.put<any>(
      `${this.apiUrl}/${campana.id}/estado`,
      {},
      { params }
    )
      .pipe(timeout(10000))
      .subscribe({

        next: () => {

          this.mensaje =
            'Estado actualizado';

          this.cargarCampanas();
        },

        error: (err) => {

          console.error(err);

          this.error =
            'No se pudo actualizar el estado';
        }
      });
  }

  // =========================================================
  // SUBIR IMAGEN
  // =========================================================

  onFileSelected(event: any): void {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      this.formulario.imagen =
        reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  // =========================================================
  // COLOR ESTADO
  // =========================================================

  obtenerClaseEstado(
    estado: string
  ): string {

    switch (estado) {

      case 'PROGRAMADA':
        return 'estado-programada';

      case 'EN_PROCESO':
        return 'estado-proceso';

      case 'FINALIZADA':
        return 'estado-finalizada';

      case 'CANCELADA':
        return 'estado-cancelada';

      default:
        return '';
    }
  }

  // =========================================================
  // PROGRESO
  // =========================================================

  obtenerProgreso(campana: any): number {

    if (
      !campana.metaAtenciones ||
      campana.metaAtenciones <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (campana.totalAtendidos /
          campana.metaAtenciones) * 100
      )
    );
  }
}