import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-pension-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pension-dashboard.component.html',
  styleUrl: './pension-dashboard.component.css'
})
export class PensionDashboardComponent implements OnInit {

  cargando = false;
  mensaje = '';
  error = '';

  evaluaciones: any[] = [];
  beneficiarios: any[] = [];
  posibles: any[] = [];

  totalEvaluaciones = 0;
  totalBeneficiarios = 0;
  totalPosibles = 0;
  totalSuspendidos = 0;
  totalPendientes = 0;
  montoTotal = 0;

  ultimosPagos: any[] = [];
  recientes: any[] = [];

  private apiUrl = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {

      const host = window.location.hostname;

      this.apiUrl =
        `http://${host}:8080/api/pension65`;

      this.cargarDashboard();
    }
  }

  cargarDashboard(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({

        next: (data) => {

          this.evaluaciones = data || [];

          this.procesarDatos();

          this.cargando = false;
        },

        error: () => {

          this.error =
            'No se pudo cargar el dashboard de Pensión 65';

          this.cargando = false;
        }
      });
  }

  procesarDatos(): void {

    this.totalEvaluaciones =
      this.evaluaciones.length;

    this.beneficiarios =
      this.evaluaciones.filter(
        p => p.beneficiario === true
      );

    this.totalBeneficiarios =
      this.beneficiarios.length;

    this.posibles =
      this.evaluaciones.filter(
        p => p.posibleBeneficiario === true
      );

    this.totalPosibles =
      this.posibles.length;

    this.totalSuspendidos =
      this.evaluaciones.filter(
        p => p.estado === 'SUSPENDIDO'
      ).length;

    this.totalPendientes =
      this.evaluaciones.filter(
        p => p.estado === 'PENDIENTE'
      ).length;

    this.montoTotal =
      this.evaluaciones.reduce(
        (total, p) =>
          total + Number(p.montoUltimoPago || 0),
        0
      );

    this.ultimosPagos =
      this.evaluaciones
        .filter(p => p.fechaUltimoPago)
        .sort((a, b) =>
          new Date(b.fechaUltimoPago).getTime() -
          new Date(a.fechaUltimoPago).getTime()
        )
        .slice(0, 5);

    this.recientes =
      [...this.evaluaciones]
        .reverse()
        .slice(0, 6);
  }

  nombreCompleto(pension: any): string {

    const d =
      pension?.adultoMayor?.datosPersonales;

    if (!d) return 'Sin datos';

    return `
      ${d.nombres || ''}
      ${d.apellidoPaterno || ''}
      ${d.apellidoMaterno || ''}
    `.trim();
  }

  dni(pension: any): string {

    return pension?.adultoMayor
      ?.datosPersonales?.dni || 'Sin DNI';
  }

  distrito(pension: any): string {

    return pension?.adultoMayor
      ?.ubicacionActual?.distrito || 'Sin distrito';
  }

  claseEstado(estado: string): string {

    if (
      estado === 'BENEFICIARIO' ||
      estado === 'ACTIVO'
    ) {
      return 'estado beneficiario';
    }

    if (estado === 'PENDIENTE') {
      return 'estado pendiente';
    }

    if (estado === 'SUSPENDIDO') {
      return 'estado suspendido';
    }

    if (estado === 'NO_CALIFICA') {
      return 'estado no-califica';
    }

    return 'estado sin-evaluar';
  }

  porcentajeBeneficiarios(): number {

    if (this.totalEvaluaciones === 0) {
      return 0;
    }

    return Math.round(
      (this.totalBeneficiarios
        / this.totalEvaluaciones) * 100
    );
  }
}