import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-salud-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './salud-pacientes.component.html',
  styleUrl: './salud-pacientes.component.css'
})
export class SaludPacientesComponent implements OnInit {

  derivaciones: any[] = [];
  derivacionesFiltradas: any[] = [];

  derivacionSeleccionada: any = null;
  adultoSeleccionado: any = null;

  busqueda = '';
  filtroEstado = 'PENDIENTE';

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  private apiDerivaciones = '';
  private apiAdultos = '';

  atencion: any = this.nuevaAtencion();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiDerivaciones = `http://${host}:8080/api/derivaciones-salud`;
      this.apiAdultos = `http://${host}:8080/api/adultos-mayores`;
    }
  }

  ngOnInit(): void {
    this.cargarPendientes();
  }

  nuevaAtencion(): any {
    const hoy = new Date().toISOString().substring(0, 10);

    return {
      fechaAtencion: hoy,
      medicoResponsable: '',
      establecimientoSalud: '',
      tipoAtencion: '',
      diagnostico: '',
      tratamiento: '',
      recomendaciones: '',
      presionArterial: '',
      peso: null,
      talla: null,
      glucosa: null,
      requiereSeguimiento: false,
      fechaProximoControl: '',
      observaciones: ''
    };
  }

  cargarPendientes(): void {
    this.filtroEstado = 'PENDIENTE';
    this.cargarDerivaciones(`${this.apiDerivaciones}/pendientes`);
  }

  cargarAtendidas(): void {
    this.filtroEstado = 'ATENDIDO';
    this.cargarDerivaciones(`${this.apiDerivaciones}/atendidas`);
  }

  cargarTodas(): void {
    this.filtroEstado = 'TODOS';
    this.cargarDerivaciones(this.apiDerivaciones);
  }

  cargarDerivaciones(url: string): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.http.get<any[]>(url)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.derivaciones = data || [];
          this.derivacionesFiltradas = [...this.derivaciones];
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar los pacientes derivados.';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.derivacionesFiltradas = this.derivaciones.filter(d => {
      const adulto = d?.adultoMayor;
      const dp = adulto?.datosPersonales;

      const nombre = `${dp?.nombres || ''} ${dp?.apellidoPaterno || ''} ${dp?.apellidoMaterno || ''}`.toLowerCase();
      const dni = dp?.dni || '';

      return !texto || nombre.includes(texto) || dni.includes(texto);
    });
  }

  seleccionarDerivacion(derivacion: any): void {
    this.derivacionSeleccionada = derivacion;
    this.adultoSeleccionado = derivacion?.adultoMayor || null;

    this.mensaje = '';
    this.error = '';

    if (!this.adultoSeleccionado) {
      this.error = 'La derivación no trae datos del adulto mayor. Revisa que DerivacionSalud no tenga @JsonIgnore en adultoMayor.';
      return;
    }

    this.atencion = this.nuevaAtencion();

    const session = sessionStorage.getItem('sessionSalud');

    if (session) {
      const user = JSON.parse(session);
      this.atencion.medicoResponsable = `${user?.nombres || ''} ${user?.apellidos || ''}`.trim();
    }

    if (derivacion?.medicoAsignado && !this.atencion.medicoResponsable) {
      this.atencion.medicoResponsable = derivacion.medicoAsignado;
    }

    setTimeout(() => {
      document.getElementById('formAtencion')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  registrarAtencion(): void {
    if (!this.adultoSeleccionado?.id) {
      this.error = 'Seleccione un paciente derivado.';
      return;
    }

    if (this.derivacionSeleccionada?.estado !== 'PENDIENTE') {
      this.error = 'Esta derivación ya no está pendiente.';
      return;
    }

    if (!this.atencion.medicoResponsable?.trim()) {
      this.error = 'Ingrese el médico responsable.';
      return;
    }

    if (!this.atencion.establecimientoSalud?.trim()) {
      this.error = 'Ingrese el establecimiento de salud.';
      return;
    }

    if (!this.atencion.tipoAtencion?.trim()) {
      this.error = 'Seleccione el tipo de atención.';
      return;
    }

    if (!this.atencion.diagnostico?.trim()) {
      this.error = 'Ingrese el diagnóstico.';
      return;
    }

    if (!this.atencion.tratamiento?.trim()) {
      this.error = 'Ingrese el tratamiento.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.http.post<any>(
      `${this.apiAdultos}/${this.adultoSeleccionado.id}/salud`,
      this.atencion
    )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.marcarDerivacionAtendida();
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo registrar la atención médica.';
          this.guardando = false;
        }
      });
  }

  marcarDerivacionAtendida(): void {
    const params = new HttpParams().set('estado', 'ATENDIDO');

    this.http.put<any>(
      `${this.apiDerivaciones}/${this.derivacionSeleccionada.id}/estado`,
      null,
      { params }
    )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensaje = 'Atención registrada y derivación marcada como atendida.';
          this.guardando = false;
          this.derivacionSeleccionada = null;
          this.adultoSeleccionado = null;
          this.atencion = this.nuevaAtencion();
          this.cargarPendientes();
        },
        error: () => {
          this.error = 'La atención se registró, pero no se pudo actualizar la derivación.';
          this.guardando = false;
        }
      });
  }

  cancelarDerivacion(derivacion: any): void {
    if (!confirm('¿Deseas cancelar esta derivación?')) return;

    const params = new HttpParams().set('estado', 'CANCELADO');

    this.http.put<any>(
      `${this.apiDerivaciones}/${derivacion.id}/estado`,
      null,
      { params }
    )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensaje = 'Derivación cancelada correctamente.';
          this.cargarPendientes();
        },
        error: () => {
          this.error = 'No se pudo cancelar la derivación.';
        }
      });
  }

  nombreCompletoAdulto(adulto: any): string {
    const d = adulto?.datosPersonales;
    if (!d) return 'Sin datos del adulto mayor';
    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }

  obtenerRiesgo(adulto: any): string {
    return adulto?.evaluacionIntegral?.nivelRiesgo || 'NO EVALUADO';
  }

  claseRiesgo(adulto: any): string {
    const riesgo = this.obtenerRiesgo(adulto);

    if (riesgo === 'CRITICO') return 'riesgo critico';
    if (riesgo === 'ALTO') return 'riesgo alto';
    if (riesgo === 'MEDIO') return 'riesgo medio';

    return 'riesgo bajo';
  }

  limpiar(): void {
    this.busqueda = '';
    this.derivacionesFiltradas = [...this.derivaciones];
    this.derivacionSeleccionada = null;
    this.adultoSeleccionado = null;
    this.mensaje = '';
    this.error = '';
    this.atencion = this.nuevaAtencion();
  }
}