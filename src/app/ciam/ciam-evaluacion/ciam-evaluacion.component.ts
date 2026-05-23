import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-evaluacion',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-evaluacion.component.html',
  styleUrl: './ciam-evaluacion.component.css'
})
export class CiamEvaluacionComponent implements OnInit {

  adultosMayores: any[] = [];
  adultosFiltrados: any[] = [];

  adultoSeleccionado: any = null;

  busqueda = '';
  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  private apiUrl = '';

  estadosFisicos = [
    'Movilidad adecuada',
    'Movilidad limitada',
    'Dificultad para caminar',
    'Requiere apoyo para desplazarse',
    'Postrado o dependiente'
  ];

  estadosMentales = [
    'Orientado',
    'Olvidos frecuentes',
    'Deterioro cognitivo leve',
    'Confusión frecuente',
    'Requiere evaluación médica'
  ];

  estadosEmocionales = [
    'Estable',
    'Tristeza frecuente',
    'Ansiedad',
    'Aislamiento emocional',
    'Requiere acompañamiento'
  ];

  estadosSociales = [
    'Buen apoyo familiar',
    'Apoyo familiar limitado',
    'Vive solo',
    'Situación de abandono',
    'Riesgo social alto'
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiUrl = `https://backend-siam-production.up.railway.app/api/adultos-mayores`;
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
    this.adultoSeleccionado = structuredClone(adulto);
    this.prepararEvaluacion();
    this.mensaje = '';
    this.error = '';
  }

  prepararEvaluacion(): void {
    this.adultoSeleccionado.evaluacionIntegral ??= {};

    const e = this.adultoSeleccionado.evaluacionIntegral;

    e.estadoFisico ??= '';
    e.estadoMental ??= '';
    e.estadoEmocional ??= '';
    e.estadoSocial ??= '';
  }

  guardarEvaluacion(): void {
    if (!this.adultoSeleccionado?.id) {
      this.error = 'Seleccione un adulto mayor.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.http.put<any>(
      `${this.apiUrl}/${this.adultoSeleccionado.id}`,
      this.adultoSeleccionado
    )
      .pipe(timeout(10000))
      .subscribe({
        next: (actualizado) => {
          this.mensaje = 'Evaluación integral registrada correctamente.';
          this.guardando = false;
          this.adultoSeleccionado = actualizado;
          this.listarAdultos();
        },
        error: () => {
          this.error = 'No se pudo guardar la evaluación integral.';
          this.guardando = false;
        }
      });
  }

  limpiar(): void {
    this.busqueda = '';
    this.adultoSeleccionado = null;
    this.mensaje = '';
    this.error = '';
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

  calcularProgreso(adulto: any): number {
    const e = adulto?.evaluacionIntegral;
    if (!e) return 0;

    let total = 0;

    if (e.estadoFisico) total++;
    if (e.estadoMental) total++;
    if (e.estadoEmocional) total++;
    if (e.estadoSocial) total++;

    return Math.round((total / 4) * 100);
  }

  estadoEvaluacion(adulto: any): string {
    const progreso = this.calcularProgreso(adulto);

    if (progreso === 100) return 'Completa';
    if (progreso >= 50) return 'En proceso';

    return 'Pendiente';
  }

  claseEstadoEvaluacion(adulto: any): string {
    const progreso = this.calcularProgreso(adulto);

    if (progreso === 100) return 'estado completo';
    if (progreso >= 50) return 'estado proceso';

    return 'estado pendiente';
  }

  totalEvaluados(): number {
    return this.adultosMayores.filter(a => this.calcularProgreso(a) === 100).length;
  }

  totalPendientes(): number {
    return this.adultosMayores.filter(a => this.calcularProgreso(a) < 100).length;
  }

  totalRiesgoAlto(): number {
    return this.adultosMayores.filter(a => {
      const r = a?.evaluacionIntegral?.nivelRiesgo;
      return r === 'ALTO' || r === 'CRITICO';
    }).length;
  }
}