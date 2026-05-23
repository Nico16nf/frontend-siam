import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-reportes.component.html',
  styleUrl: './ciam-reportes.component.css'
})
export class CiamReportesComponent implements OnInit {

  adultosMayores: any[] = [];
  reporteFiltrado: any[] = [];

  tipoReporte = 'GENERAL';
  busqueda = '';
  riesgo = 'TODOS';
  sisfoh = 'TODOS';
  fechaInicio = '';
  fechaFin = '';

  cargando = false;
  error = '';
  mensaje = '';

  private apiUrl = '';

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
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.adultosMayores = data || [];
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar los reportes.';
          this.cargando = false;
        }
      });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.trim().toLowerCase();

    this.reporteFiltrado = this.adultosMayores.filter(a => {
      const d = a?.datosPersonales;
      const nombre = `${d?.nombres || ''} ${d?.apellidoPaterno || ''} ${d?.apellidoMaterno || ''}`.toLowerCase();
      const dni = d?.dni || '';

      const riesgoActual = a?.evaluacionIntegral?.nivelRiesgo || 'NO_EVALUADO';
      const sisfohActual = a?.sisfoh?.clasificacionSocioeconomica || 'SIN_CLASIFICAR';
      const fechaRegistro = a?.fechaRegistro || '';

      const coincideTexto = !texto || nombre.includes(texto) || dni.includes(texto);
      const coincideRiesgo = this.riesgo === 'TODOS' || riesgoActual === this.riesgo;
      const coincideSisfoh = this.sisfoh === 'TODOS' || sisfohActual === this.sisfoh;

      const coincideFechaInicio = !this.fechaInicio || fechaRegistro >= this.fechaInicio;
      const coincideFechaFin = !this.fechaFin || fechaRegistro <= this.fechaFin;

      return coincideTexto && coincideRiesgo && coincideSisfoh && coincideFechaInicio && coincideFechaFin;
    });
  }

  limpiarFiltros(): void {
    this.tipoReporte = 'GENERAL';
    this.busqueda = '';
    this.riesgo = 'TODOS';
    this.sisfoh = 'TODOS';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.aplicarFiltros();
  }

  nombreCompleto(a: any): string {
    const d = a?.datosPersonales;
    if (!d) return 'Sin nombre';
    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }

  edad(a: any): number | string {
    const fecha = a?.datosPersonales?.fechaNacimiento;
    if (!fecha) return '-';

    const nacimiento = new Date(fecha);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  obtenerFilasReporte(): any[] {
    return this.reporteFiltrado.map(a => ({
      DNI: a?.datosPersonales?.dni || '',
      Nombres: this.nombreCompleto(a),
      Edad: this.edad(a),
      Sexo: a?.datosPersonales?.sexo || '',
      Celular: a?.datosPersonales?.celular || '',
      Direccion: a?.ubicacionActual?.direccion || '',
      Distrito: a?.ubicacionActual?.distrito || '',
      SISFOH: a?.sisfoh?.clasificacionSocioeconomica || 'SIN CLASIFICAR',
      PuntajeSISFOH: a?.sisfoh?.puntajeSisfoh || 0,
      VencimientoSISFOH: a?.sisfoh?.fechaVencimiento || '',
      Riesgo: a?.evaluacionIntegral?.nivelRiesgo || 'NO EVALUADO',
      ViveSolo: a?.informacionSocial?.viveSolo ? 'Sí' : 'No',
      Abandono: a?.informacionSocial?.situacionAbandono ? 'Sí' : 'No',
      Violencia: a?.informacionSocial?.victimaViolencia ? 'Sí' : 'No',
      Discapacidad: a?.informacionSocial?.tieneDiscapacidad ? 'Sí' : 'No',
      TipoVivienda: a?.informacionSocial?.tipoVivienda || '',
      Pension65: a?.pension65?.posibleBeneficiario ? 'Posible beneficiario' : 'No califica / pendiente',
      AtencionesSalud: a?.atencionesSalud?.length || 0,
      Visitas: a?.visitasDomiciliarias?.length || 0,
      DerivacionesSalud: a?.derivacionesSalud?.length || 0,
      FechaRegistro: a?.fechaRegistro || ''
    }));
  }

  exportarExcel(): void {
    const filas = this.obtenerFilasReporte();
    if (filas.length === 0) {
      this.error = 'No hay datos para exportar.';
      return;
    }

    const columnas = Object.keys(filas[0]);
    const csv = [
      columnas.join(';'),
      ...filas.map(fila =>
        columnas.map(col => `"${String(fila[col] ?? '').replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `reporte-ciam-${this.tipoReporte.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    this.mensaje = 'Reporte exportado correctamente para Excel.';
  }

  imprimirReporte(): void {
    window.print();
  }
}