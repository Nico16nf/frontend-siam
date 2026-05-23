import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-salud-visitas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './salud-visitas.component.html',
  styleUrl: './salud-visitas.component.css'
})
export class SaludVisitasComponent implements OnInit {

  visitas: any[] = [];
  visitasFiltradas: any[] = [];

  visitaSeleccionada: any = null;

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';
  filtro = '';

  private apiUrl = '';

  formulario: any = this.nuevoFormulario();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = window.location.hostname;
    this.apiUrl = `https://backend-siam-production.up.railway.app/api`;

    this.cargarAdultosMayores();
  }

  nuevoFormulario(): any {
    return {
      medicoResponsable: '',
      establecimientoSalud: '',
      motivoVisita: '',
      evaluacionMedica: '',
      diagnosticoPresuntivo: '',
      tratamientoIndicado: '',
      recomendaciones: '',
      presionArterial: '',
      peso: null,
      talla: null,
      glucosa: null,
      temperatura: null,
      frecuenciaCardiaca: null,
      saturacionOxigeno: null,
      requiereReferencia: false,
      referenciaA: '',
      requiereSeguimiento: false,
      fechaProximaVisita: '',
      observaciones: ''
    };
  }

  cargarAdultosMayores(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(`${this.apiUrl}/adultos-mayores/activos`)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.visitas = data;
            this.visitasFiltradas = [...this.visitas];
            this.cargando = false;
          } else {
            this.cargarTodosAdultosMayores();
          }
        },
        error: () => {
          this.cargarTodosAdultosMayores();
        }
      });
  }

  cargarTodosAdultosMayores(): void {
    this.http.get<any[]>(`${this.apiUrl}/adultos-mayores`)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.visitas = data || [];
          this.visitasFiltradas = [...this.visitas];
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando adultos mayores:', err);
          this.error = 'No se pudieron cargar los adultos mayores.';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {
    const texto = this.filtro.toLowerCase().trim();

    if (!texto) {
      this.visitasFiltradas = [...this.visitas];
      return;
    }

    this.visitasFiltradas = this.visitas.filter(adulto => {
      const datos = adulto?.datosPersonales;

      const nombre = `${datos?.nombres || ''} ${datos?.apellidoPaterno || ''} ${datos?.apellidoMaterno || ''}`.toLowerCase();

      const dni = datos?.dni?.toLowerCase() || '';

      return nombre.includes(texto) || dni.includes(texto);
    });
  }

  seleccionarAdulto(adulto: any): void {
    this.visitaSeleccionada = adulto;
    this.mensaje = '';
    this.error = '';
    this.formulario = this.nuevoFormulario();

    const session = sessionStorage.getItem('sessionSalud');

    if (session) {
      try {
        const user = JSON.parse(session);
        this.formulario.medicoResponsable =
          `${user?.nombres || ''} ${user?.apellidos || ''}`.trim();
      } catch {
        this.formulario.medicoResponsable = '';
      }
    }
  }

  registrarVisita(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.visitaSeleccionada?.id) {
      this.error = 'Seleccione un adulto mayor.';
      return;
    }

    if (!this.formulario.medicoResponsable?.trim()) {
      this.error = 'Ingrese el médico responsable.';
      return;
    }

    if (!this.formulario.establecimientoSalud?.trim()) {
      this.error = 'Ingrese el establecimiento de salud.';
      return;
    }

    if (!this.formulario.motivoVisita?.trim()) {
      this.error = 'Ingrese el motivo de visita.';
      return;
    }

    if (!this.formulario.evaluacionMedica?.trim()) {
      this.error = 'Ingrese la evaluación médica.';
      return;
    }

    this.guardando = true;

    this.http.post(
      `${this.apiUrl}/visitas-medicas/${this.visitaSeleccionada.id}`,
      this.formulario
    )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mensaje = 'Visita médica registrada correctamente.';
          this.formulario = this.nuevoFormulario();
        },
        error: (err) => {
          this.guardando = false;
          console.error(err);
          this.error = err?.error?.message || 'No se pudo registrar la visita médica.';
        }
      });
  }

  limpiar(): void {
    this.filtro = '';
    this.visitaSeleccionada = null;
    this.mensaje = '';
    this.error = '';
    this.formulario = this.nuevoFormulario();
    this.visitasFiltradas = [...this.visitas];
  }

  obtenerNombreCompleto(adulto: any): string {
    const d = adulto?.datosPersonales;

    if (!d) return 'Sin datos';

    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }

  obtenerEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  obtenerClaseRiesgo(adulto: any): string {
    const riesgo = adulto?.evaluacionIntegral?.nivelRiesgo;

    switch (riesgo) {
      case 'CRITICO':
        return 'riesgo-critico';
      case 'ALTO':
        return 'riesgo-alto';
      case 'MEDIO':
        return 'riesgo-medio';
      default:
        return 'riesgo-bajo';
    }
  }
}