import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-pension-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pension-reportes.component.html',
  styleUrl: './pension-reportes.component.css'
})
export class PensionReportesComponent implements OnInit {

  evaluaciones: any[] = [];
  reporteFiltrado: any[] = [];

  tipoReporte = 'GENERAL';
  estadoFiltro = 'TODOS';
  busqueda = '';

  cargando = false;
  mensaje = '';
  error = '';

  totalEvaluados = 0;
  totalBeneficiarios = 0;
  totalPosibles = 0;
  totalPendientes = 0;
  totalNoCalifica = 0;
  totalSuspendidos = 0;
  montoTotalPagado = 0;

  private apiUrl = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiUrl = `http://${host}:8080/api/pension65`;
      this.cargarReportes();
    }
  }

  cargarReportes(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.evaluaciones = data || [];
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar los reportes de Pensión 65.';
          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    let lista = [...this.evaluaciones];

    if (this.tipoReporte === 'BENEFICIARIOS') {
      lista = lista.filter(p => p.beneficiario === true);
    }

    if (this.tipoReporte === 'POSIBLES') {
      lista = lista.filter(p => p.posibleBeneficiario === true);
    }

    if (this.tipoReporte === 'PAGOS') {
      lista = lista.filter(p => p.montoUltimoPago && p.montoUltimoPago > 0);
    }

    if (this.estadoFiltro !== 'TODOS') {
      lista = lista.filter(p => p.estado === this.estadoFiltro);
    }

    const texto = this.busqueda.toLowerCase().trim();

    if (texto) {
      lista = lista.filter(p => {
        const adulto = p.adultoMayor || {};
        const d = adulto.datosPersonales || {};

        const nombre = `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.toLowerCase();
        const dni = (d.dni || '').toLowerCase();

        return nombre.includes(texto) || dni.includes(texto);
      });
    }

    this.reporteFiltrado = lista;
    this.calcularResumen();
  }

  calcularResumen(): void {
    this.totalEvaluados = this.reporteFiltrado.length;

    this.totalBeneficiarios = this.reporteFiltrado
      .filter(p => p.beneficiario === true).length;

    this.totalPosibles = this.reporteFiltrado
      .filter(p => p.posibleBeneficiario === true).length;

    this.totalPendientes = this.reporteFiltrado
      .filter(p => p.estado === 'PENDIENTE').length;

    this.totalNoCalifica = this.reporteFiltrado
      .filter(p => p.estado === 'NO_CALIFICA').length;

    this.totalSuspendidos = this.reporteFiltrado
      .filter(p => p.estado === 'SUSPENDIDO').length;

    this.montoTotalPagado = this.reporteFiltrado
      .reduce((total, p) => total + Number(p.montoUltimoPago || 0), 0);
  }

  limpiarFiltros(): void {
    this.tipoReporte = 'GENERAL';
    this.estadoFiltro = 'TODOS';
    this.busqueda = '';
    this.aplicarFiltros();
  }

  nombreCompleto(pension: any): string {
    const d = pension?.adultoMayor?.datosPersonales;

    if (!d) return 'Sin adulto mayor';

    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }

  dni(pension: any): string {
    return pension?.adultoMayor?.datosPersonales?.dni || 'Sin DNI';
  }

  ubicacion(pension: any): string {
    return pension?.adultoMayor?.ubicacionActual?.distrito || 'Sin ubicación';
  }

  claseEstado(estado: string): string {
    if (estado === 'BENEFICIARIO' || estado === 'ACTIVO') return 'estado beneficiario';
    if (estado === 'PENDIENTE') return 'estado pendiente';
    if (estado === 'NO_CALIFICA') return 'estado no-califica';
    if (estado === 'SUSPENDIDO') return 'estado suspendido';
    return 'estado sin-evaluar';
  }

  exportarExcel(): void {
    if (this.reporteFiltrado.length === 0) {
      this.error = 'No hay datos para exportar.';
      return;
    }

    const filas = this.reporteFiltrado.map(p => ({
      DNI: this.dni(p),
      AdultoMayor: this.nombreCompleto(p),
      Ubicacion: this.ubicacion(p),
      Estado: p.estado || 'SIN_EVALUAR',
      Beneficiario: p.beneficiario ? 'Sí' : 'No',
      PosibleBeneficiario: p.posibleBeneficiario ? 'Sí' : 'No',
      FechaAfiliacion: p.fechaAfiliacion || '',
      FechaUltimoPago: p.fechaUltimoPago || '',
      FechaProximoPago: p.fechaProximoPago || '',
      MontoUltimoPago: p.montoUltimoPago || 0,
      Observaciones: p.observaciones || ''
    }));

    const columnas = Object.keys(filas[0]);

    const csv = [
      columnas.join(';'),
      ...filas.map(fila =>
        columnas.map(col =>
          `"${String((fila as any)[col] ?? '').replace(/"/g, '""')}"`
        ).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `reporte-pension65-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);

    this.mensaje = 'Reporte exportado correctamente.';
  }

  imprimirReporte(): void {
    window.print();
  }
}