import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-salud-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './salud-dashboard.component.html',
  styleUrl: './salud-dashboard.component.css'
})
export class SaludDashboardComponent implements OnInit {

  adultos: any[] = [];
  derivaciones: any[] = [];
  atenciones: any[] = [];
  visitasMedicas: any[] = [];
  campanas: any[] = [];

  cargando = false;
  error = '';

  totalAdultos = 0;
  totalDerivaciones = 0;
  derivacionesPendientes = 0;
  derivacionesAtendidas = 0;

  totalAtenciones = 0;
  totalVisitas = 0;
  visitasSeguimiento = 0;
  visitasReferencia = 0;

  totalCampanas = 0;
  campanasProgramadas = 0;
  campanasProceso = 0;
  campanasFinalizadas = 0;

  riesgoAlto = 0;
  riesgoCritico = 0;

  private apiBase = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = window.location.hostname;
    this.apiBase = `https://backend-siam-production.up.railway.app/api`;

    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.error = '';

    Promise.all([
      this.http.get<any[]>(`${this.apiBase}/adultos-mayores`).pipe(timeout(10000)).toPromise(),
      this.http.get<any[]>(`${this.apiBase}/derivaciones-salud`).pipe(timeout(10000)).toPromise(),
      this.http.get<any[]>(`${this.apiBase}/salud`).pipe(timeout(10000)).toPromise(),
      this.http.get<any[]>(`${this.apiBase}/visitas-medicas`).pipe(timeout(10000)).toPromise(),
      this.http.get<any[]>(`${this.apiBase}/campanas-salud`).pipe(timeout(10000)).toPromise()
    ])
    .then(([adultos, derivaciones, atenciones, visitas, campanas]) => {
      this.adultos = adultos || [];
      this.derivaciones = derivaciones || [];
      this.atenciones = atenciones || [];
      this.visitasMedicas = visitas || [];
      this.campanas = campanas || [];

      this.calcularDatos();
      this.cargando = false;
    })
    .catch(err => {
      console.error(err);
      this.error = 'No se pudo cargar el dashboard de salud.';
      this.cargando = false;
    });
  }

  calcularDatos(): void {
    this.totalAdultos = this.adultos.length;

    this.totalDerivaciones = this.derivaciones.length;
    this.derivacionesPendientes = this.derivaciones.filter(d => d.estado === 'PENDIENTE').length;
    this.derivacionesAtendidas = this.derivaciones.filter(d => d.estado === 'ATENDIDO').length;

    this.totalAtenciones = this.atenciones.length;

    this.totalVisitas = this.visitasMedicas.length;
    this.visitasSeguimiento = this.visitasMedicas.filter(v => v.requiereSeguimiento).length;
    this.visitasReferencia = this.visitasMedicas.filter(v => v.requiereReferencia).length;

    this.totalCampanas = this.campanas.length;
    this.campanasProgramadas = this.campanas.filter(c => c.estado === 'PROGRAMADA').length;
    this.campanasProceso = this.campanas.filter(c => c.estado === 'EN_PROCESO').length;
    this.campanasFinalizadas = this.campanas.filter(c => c.estado === 'FINALIZADA').length;

    this.riesgoAlto = this.adultos.filter(a => a?.evaluacionIntegral?.nivelRiesgo === 'ALTO').length;
    this.riesgoCritico = this.adultos.filter(a => a?.evaluacionIntegral?.nivelRiesgo === 'CRITICO').length;
  }

  porcentaje(valor: number, total: number): number {
    if (!total || total <= 0) return 0;
    return Math.round((valor / total) * 100);
  }

  ultimasAtenciones(): any[] {
    return this.atenciones.slice(0, 5);
  }

  proximasCampanas(): any[] {
    return this.campanas
      .filter(c => c.estado === 'PROGRAMADA' || c.estado === 'EN_PROCESO')
      .slice(0, 4);
  }

  nombrePaciente(atencion: any): string {
    const d = atencion?.adultoMayor?.datosPersonales;
    if (!d) return 'Paciente no disponible';
    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }
}