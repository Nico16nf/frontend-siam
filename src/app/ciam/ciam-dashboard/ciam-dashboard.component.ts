import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './ciam-dashboard.component.html',
  styleUrl: './ciam-dashboard.component.css'
})
export class CiamDashboardComponent implements OnInit {

  // LISTAS
  adultosMayores: any[] = [];
  derivacionesPendientes: any[] = [];

  // ESTADÍSTICAS GENERALES
  totalAdultos = 0;
  totalHombres = 0;
  totalMujeres = 0;

  // RIESGO
  riesgoBajo = 0;
  riesgoMedio = 0;
  riesgoAlto = 0;
  riesgoCritico = 0;

  // SOCIAL
  vivenSolos = 0;
  abandono = 0;
  violencia = 0;
  discapacidad = 0;

  // SISFOH
  pobresExtremos = 0;
  pobres = 0;
  noPobres = 0;

  // P65
  pension65 = 0;

  // SALUD
  totalAtenciones = 0;
  totalVisitas = 0;
  totalDerivaciones = 0;

  // ALERTAS
  alertas: any[] = [];

  // CONTROL
  cargando = false;
  error = '';

  private apiUrl = '';
  private apiDerivaciones = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    if (isPlatformBrowser(this.platformId)) {

      const host = window.location.hostname;

      this.apiUrl =
        `https://backend-siam-production.up.railway.app/api/adultos-mayores`;

      this.apiDerivaciones =
        `https://backend-siam-production.up.railway.app/api/derivaciones-salud`;
    }
  }

  ngOnInit(): void {

    this.cargarDashboard();
  }

  cargarDashboard(): void {

    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({

        next: (data) => {

          this.adultosMayores = data || [];

          this.calcularIndicadores();

          this.generarAlertas();

          this.cargarDerivacionesPendientes();

          this.cargando = false;
        },

        error: () => {

          this.error =
            'No se pudo cargar el dashboard del CIAM';

          this.cargando = false;
        }
      });
  }

  cargarDerivacionesPendientes(): void {

    this.http.get<any[]>(
      `${this.apiDerivaciones}/pendientes`
    )
      .pipe(timeout(10000))
      .subscribe({

        next: (data) => {

          this.derivacionesPendientes = data || [];
        },

        error: () => {

          this.derivacionesPendientes = [];
        }
      });
  }

  calcularIndicadores(): void {

    // RESET

    this.totalAdultos = 0;
    this.totalHombres = 0;
    this.totalMujeres = 0;

    this.riesgoBajo = 0;
    this.riesgoMedio = 0;
    this.riesgoAlto = 0;
    this.riesgoCritico = 0;

    this.vivenSolos = 0;
    this.abandono = 0;
    this.violencia = 0;
    this.discapacidad = 0;

    this.pobresExtremos = 0;
    this.pobres = 0;
    this.noPobres = 0;

    this.pension65 = 0;

    this.totalAtenciones = 0;
    this.totalVisitas = 0;
    this.totalDerivaciones = 0;

    // RECORRIDO

    this.totalAdultos = this.adultosMayores.length;

    this.adultosMayores.forEach(adulto => {

      // SEXO

      const sexo =
        adulto?.datosPersonales?.sexo;

      if (sexo === 'MASCULINO') {
        this.totalHombres++;
      }

      if (sexo === 'FEMENINO') {
        this.totalMujeres++;
      }

      // RIESGO

      const riesgo =
        adulto?.evaluacionIntegral?.nivelRiesgo;

      switch (riesgo) {

        case 'BAJO':
          this.riesgoBajo++;
          break;

        case 'MEDIO':
          this.riesgoMedio++;
          break;

        case 'ALTO':
          this.riesgoAlto++;
          break;

        case 'CRITICO':
          this.riesgoCritico++;
          break;
      }

      // SOCIAL

      const social =
        adulto?.informacionSocial;

      if (social?.viveSolo) {
        this.vivenSolos++;
      }

      if (social?.situacionAbandono) {
        this.abandono++;
      }

      if (social?.victimaViolencia) {
        this.violencia++;
      }

      if (social?.tieneDiscapacidad) {
        this.discapacidad++;
      }

      // SISFOH

      const sisfoh =
        adulto?.sisfoh?.clasificacionSocioeconomica;

      switch (sisfoh) {

        case 'POBRE_EXTREMO':
          this.pobresExtremos++;
          break;

        case 'POBRE':
          this.pobres++;
          break;

        case 'NO_POBRE':
          this.noPobres++;
          break;
      }

      // PENSION 65

      if (adulto?.pension65?.posibleBeneficiario) {
        this.pension65++;
      }

      // SALUD

      this.totalAtenciones +=
        adulto?.atencionesSalud?.length || 0;

      // VISITAS

      this.totalVisitas +=
        adulto?.visitasDomiciliarias?.length || 0;

      // DERIVACIONES

      this.totalDerivaciones +=
        adulto?.derivacionesSalud?.length || 0;
    });
  }

  generarAlertas(): void {

    this.alertas = [];

    this.adultosMayores.forEach(adulto => {

      const nombre =
        this.obtenerNombreCompleto(adulto);

      const riesgo =
        adulto?.evaluacionIntegral?.nivelRiesgo;

      const social =
        adulto?.informacionSocial;

      const sisfoh =
        adulto?.sisfoh;

      // CRÍTICOS

      if (riesgo === 'CRITICO') {

        this.alertas.push({
          tipo: 'critico',
          icono: 'warning',
          mensaje:
            `${nombre} presenta riesgo CRÍTICO`
        });
      }

      // ABANDONO

      if (social?.situacionAbandono) {

        this.alertas.push({
          tipo: 'abandono',
          icono: 'report',
          mensaje:
            `${nombre} presenta situación de abandono`
        });
      }

      // VIOLENCIA

      if (social?.victimaViolencia) {

        this.alertas.push({
          tipo: 'violencia',
          icono: 'gpp_bad',
          mensaje:
            `${nombre} presenta posible violencia familiar`
        });
      }

      // SISFOH

      if (sisfoh?.fechaVencimiento) {

        const hoy = new Date();

        const vencimiento =
          new Date(sisfoh.fechaVencimiento);

        const diferencia =
          Math.ceil(
            (vencimiento.getTime() - hoy.getTime())
            / (1000 * 60 * 60 * 24)
          );

        if (diferencia <= 30 && diferencia >= 0) {

          this.alertas.push({
            tipo: 'sisfoh',
            icono: 'event_busy',
            mensaje:
              `SISFOH de ${nombre} vence en ${diferencia} días`
          });
        }
      }
    });
  }

  obtenerNombreCompleto(adulto: any): string {

    const d =
      adulto?.datosPersonales;

    if (!d) return 'Sin nombre';

    return `
      ${d.nombres || ''}
      ${d.apellidoPaterno || ''}
      ${d.apellidoMaterno || ''}
    `.replace(/\s+/g, ' ').trim();
  }

  obtenerEdad(adulto: any): number | string {

    const fecha =
      adulto?.datosPersonales?.fechaNacimiento;

    if (!fecha) return '-';

    const nacimiento =
      new Date(fecha);

    const hoy =
      new Date();

    let edad =
      hoy.getFullYear()
      - nacimiento.getFullYear();

    const mes =
      hoy.getMonth()
      - nacimiento.getMonth();

    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() < nacimiento.getDate()
      )
    ) {
      edad--;
    }

    return edad;
  }

  porcentaje(valor: number): number {

    if (this.totalAdultos === 0) {
      return 0;
    }

    return Math.round(
      (valor / this.totalAdultos) * 100
    );
  }

  claseRiesgo(riesgo: string): string {

    switch (riesgo) {

      case 'CRITICO':
        return 'critico';

      case 'ALTO':
        return 'alto';

      case 'MEDIO':
        return 'medio';

      default:
        return 'bajo';
    }
  }

  recargar(): void {

    this.cargarDashboard();
  }
}