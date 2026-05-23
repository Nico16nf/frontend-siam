import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, timeout, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  usuario: any;
  cargando = true;
  error = '';

  private apiBase = '';
  private intervaloSidebar?: any;
  private sub?: Subscription;

  sidebarColapsado = false;

  usuarios: any[] = [];
  adultos: any[] = [];
  atencionesSalud: any[] = [];

  totalUsuarios = 0;
  usuariosActivos = 0;
  usuariosInactivos = 0;

  totalAdultos = 0;
  adultosActivos = 0;
  adultosInactivos = 0;

  totalAtencionesSalud = 0;
  totalDerivaciones = 0;
  casosRiesgoAlto = 0;
  casosAbandono = 0;
  posiblesPension65 = 0;

  usuariosPorRol = {
    ADMIN: 0,
    CIAM: 0,
    SALUD: 0,
    PENSION_65: 0
  };

  adultosRecientes: any[] = [];
  usuariosRecientes: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.configurarApi();
    this.validarSesion();
    this.detectarSidebar();
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    if (this.intervaloSidebar) clearInterval(this.intervaloSidebar);
    if (this.sub) this.sub.unsubscribe();
  }

  private configurarApi(): void {
    const host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
      this.apiBase = 'http://localhost:8080/api';
    } else {
      this.apiBase = 'https://backend-siam-production.up.railway.app/api';
    }
  }

  private detectarSidebar(): void {
    this.sidebarColapsado =
      document.body.classList.contains('sidebar-collapsed') ||
      document.body.classList.contains('sidebar-colapsado');

    this.intervaloSidebar = setInterval(() => {
      this.sidebarColapsado =
        document.body.classList.contains('sidebar-collapsed') ||
        document.body.classList.contains('sidebar-colapsado');
    }, 300);
  }

  private validarSesion(): void {
    const session = sessionStorage.getItem('sessionAdmin');

    if (!session) {
      this.router.navigate(['/login-admin'], { replaceUrl: true });
      return;
    }

    try {
      const data = JSON.parse(session);
      const ahora = Date.now();

      if (data.exp < ahora || data.rol !== 'ADMIN') {
        sessionStorage.removeItem('sessionAdmin');
        this.router.navigate(['/login-admin'], { replaceUrl: true });
        return;
      }

      this.usuario = data;

    } catch {
      sessionStorage.removeItem('sessionAdmin');
      this.router.navigate(['/login-admin'], { replaceUrl: true });
    }
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.error = '';

    this.sub = forkJoin({
      usuarios: this.http.get<any[]>(`${this.apiBase}/usuarios`).pipe(timeout(10000)),
      adultos: this.http.get<any[]>(`${this.apiBase}/adultos-mayores`).pipe(timeout(10000)),
      salud: this.http.get<any[]>(`${this.apiBase}/salud`).pipe(timeout(10000))
    }).subscribe({
      next: ({ usuarios, adultos, salud }) => {
        this.usuarios = usuarios || [];
        this.adultos = adultos || [];
        this.atencionesSalud = salud || [];

        this.procesarUsuarios();
        this.procesarAdultos();

        this.totalAtencionesSalud = this.atencionesSalud.length;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la información del dashboard.';
        this.cargando = false;
      }
    });
  }

  private procesarUsuarios(): void {
    this.totalUsuarios = this.usuarios.length;
    this.usuariosActivos = this.usuarios.filter(u => u.activo === true).length;
    this.usuariosInactivos = this.totalUsuarios - this.usuariosActivos;

    this.usuariosPorRol = {
      ADMIN: this.usuarios.filter(u => u.rol === 'ADMIN').length,
      CIAM: this.usuarios.filter(u => u.rol === 'CIAM').length,
      SALUD: this.usuarios.filter(u => u.rol === 'SALUD').length,
      PENSION_65: this.usuarios.filter(u => u.rol === 'PENSION_65').length
    };

    this.usuariosRecientes = [...this.usuarios].slice(-5).reverse();
  }

  private procesarAdultos(): void {
    this.totalAdultos = this.adultos.length;
    this.adultosActivos = this.adultos.filter(a => a.activo === true).length;
    this.adultosInactivos = this.totalAdultos - this.adultosActivos;

    this.casosRiesgoAlto = this.adultos.filter(a =>
      a.evaluacionIntegral?.nivelRiesgo === 'ALTO'
    ).length;

    this.casosAbandono = this.adultos.filter(a =>
      a.informacionSocial?.situacionAbandono === true
    ).length;

    this.posiblesPension65 = this.adultos.filter(a =>
      a.pension65?.posibleBeneficiario === true ||
      a.pension65?.beneficiario === true
    ).length;

    this.totalDerivaciones = this.adultos.reduce((total, a) => {
      if (Array.isArray(a.derivacionesSalud)) return total + a.derivacionesSalud.length;
      if (a.derivacionSalud) return total + 1;
      return total;
    }, 0);

    this.adultosRecientes = [...this.adultos].slice(-5).reverse();
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('sessionAdmin');
    this.router.navigate(['/login-admin'], { replaceUrl: true });
  }

  irA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  getNombreAdulto(adulto: any): string {
    const nombres = adulto?.datosPersonales?.nombres || '';
    const apellidos = adulto?.datosPersonales?.apellidos || '';
    return `${nombres} ${apellidos}`.trim() || 'Sin nombre';
  }

  getDniAdulto(adulto: any): string {
    return adulto?.datosPersonales?.dni || 'Sin DNI';
  }
}