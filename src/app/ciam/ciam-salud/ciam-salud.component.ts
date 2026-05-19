import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-salud',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-salud.component.html',
  styleUrl: './ciam-salud.component.css'
})
export class CiamSaludComponent implements OnInit {

  adultosMayores: any[] = [];
  adultosFiltrados: any[] = [];

  adultoSeleccionado: any = null;

  busqueda = '';
  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  private apiUrl = '';

  derivacion: any = {
    responsableCiam: '',
    motivoDerivacion: '',
    observaciones: '',
    prioridadAlta: false,
    medicoAsignado: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiUrl = `http://${host}:8080/api/adultos-mayores`;
    }
  }

  ngOnInit(): void {
    this.listarAdultos();
  }

  listarAdultos(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.adultosMayores = data || [];
          this.adultosFiltrados = [...this.adultosMayores];
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudo cargar la lista de adultos mayores.';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.adultosFiltrados = this.adultosMayores.filter(a => {
      const d = a?.datosPersonales;
      const nombre = `${d?.nombres || ''} ${d?.apellidoPaterno || ''} ${d?.apellidoMaterno || ''}`.toLowerCase();
      const dni = d?.dni || '';

      return !texto || nombre.includes(texto) || dni.includes(texto);
    });
  }

  seleccionarAdulto(adulto: any): void {
    this.adultoSeleccionado = adulto;
    this.mensaje = '';
    this.error = '';

    this.derivacion = {
      responsableCiam: '',
      motivoDerivacion: this.sugerirMotivoDerivacion(adulto),
      observaciones: this.generarObservacionSugerida(adulto),
      prioridadAlta: this.esPrioridadAlta(adulto),
      medicoAsignado: ''
    };
  }

  derivarASalud(): void {
    if (!this.adultoSeleccionado?.id) {
      this.error = 'Seleccione un adulto mayor para derivar.';
      return;
    }

    if (!this.derivacion.responsableCiam.trim()) {
      this.error = 'Ingrese el responsable CIAM.';
      return;
    }

    if (!this.derivacion.motivoDerivacion.trim()) {
      this.error = 'Ingrese el motivo de derivación.';
      return;
    }

    if (!this.derivacion.observaciones.trim()) {
      this.error = 'Ingrese las observaciones.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.http.post<any>(
      `${this.apiUrl}/${this.adultoSeleccionado.id}/derivar-salud`,
      this.derivacion
    )
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensaje = 'Adulto mayor derivado correctamente al módulo de Salud.';
          this.guardando = false;
          this.limpiarFormulario();
          this.listarAdultos();
        },
        error: (err) => {
          this.error = err?.error?.message || 'No se pudo realizar la derivación.';
          this.guardando = false;
        }
      });
  }

  limpiarFormulario(): void {
    this.derivacion = {
      responsableCiam: '',
      motivoDerivacion: '',
      observaciones: '',
      prioridadAlta: false,
      medicoAsignado: ''
    };
  }

  limpiarTodo(): void {
    this.busqueda = '';
    this.adultoSeleccionado = null;
    this.mensaje = '';
    this.error = '';
    this.limpiarFormulario();
    this.adultosFiltrados = [...this.adultosMayores];
  }

  nombreCompleto(adulto: any): string {
    const d = adulto?.datosPersonales;
    if (!d) return 'Sin nombre';
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

  esPrioridadAlta(adulto: any): boolean {
    const riesgo = adulto?.evaluacionIntegral?.nivelRiesgo;
    const social = adulto?.informacionSocial;

    return riesgo === 'CRITICO' ||
      riesgo === 'ALTO' ||
      social?.situacionAbandono ||
      social?.victimaViolencia ||
      social?.viveSolo ||
      social?.tieneDiscapacidad;
  }

  sugerirMotivoDerivacion(adulto: any): string {
    const riesgo = adulto?.evaluacionIntegral?.nivelRiesgo;
    const social = adulto?.informacionSocial;

    if (riesgo === 'CRITICO') return 'Riesgo crítico identificado por CIAM';
    if (riesgo === 'ALTO') return 'Riesgo alto identificado por CIAM';
    if (social?.victimaViolencia) return 'Posible violencia familiar';
    if (social?.situacionAbandono) return 'Situación de abandono';
    if (social?.viveSolo) return 'Adulto mayor vive solo';
    if (social?.tieneDiscapacidad) return 'Adulto mayor con discapacidad';

    return '';
  }

  generarObservacionSugerida(adulto: any): string {
    const partes: string[] = [];
    const social = adulto?.informacionSocial;
    const evalua = adulto?.evaluacionIntegral;

    if (evalua?.estadoFisico) partes.push(`Estado físico: ${evalua.estadoFisico}`);
    if (evalua?.estadoMental) partes.push(`Estado mental: ${evalua.estadoMental}`);
    if (evalua?.estadoEmocional) partes.push(`Estado emocional: ${evalua.estadoEmocional}`);
    if (evalua?.estadoSocial) partes.push(`Estado social: ${evalua.estadoSocial}`);

    if (social?.viveSolo) partes.push('Vive solo');
    if (social?.situacionAbandono) partes.push('Situación de abandono');
    if (social?.victimaViolencia) partes.push('Posible violencia familiar');
    if (social?.tieneDiscapacidad) partes.push('Tiene discapacidad');

    return partes.join('. ');
  }

  tieneDerivacionPendiente(adulto: any): boolean {
    return adulto?.derivacionesSalud?.some((d: any) => d?.estado === 'PENDIENTE') || false;
  }
}