import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-reportes.component.html',
  styleUrl: './admin-reportes.component.css'
})
export class AdminReportesComponent implements OnInit {

  private apiBase = '';

  cargando = false;
  error = '';

  usuarios: any[] = [];
  adultos: any[] = [];
  salud: any[] = [];

  filtro = 'GENERAL';

  totalUsuarios = 0;
  totalAdultos = 0;
  totalSalud = 0;
  adultosActivos = 0;
  adultosInactivos = 0;
  usuariosActivos = 0;
  casosRiesgoAlto = 0;
  casosAbandono = 0;
  pension65 = 0;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.configurarApi();
    this.cargarReportes();
  }

  private configurarApi(): void {
    const host = window.location.hostname;

    this.apiBase =
      host === 'localhost' || host === '127.0.0.1'
        ? 'http://localhost:8080/api'
        : 'https://backend-siam-production.up.railway.app/api';
  }

  cargarReportes(): void {
    this.cargando = true;
    this.error = '';

    this.http.get<any[]>(`${this.apiBase}/usuarios`).subscribe({
      next: usuarios => {
        this.usuarios = usuarios || [];

        this.http.get<any[]>(`${this.apiBase}/adultos-mayores`).subscribe({
          next: adultos => {
            this.adultos = adultos || [];

            this.http.get<any[]>(`${this.apiBase}/salud`).subscribe({
              next: salud => {
                this.salud = salud || [];
                this.procesarDatos();
                this.cargando = false;
              },
              error: () => {
                this.salud = [];
                this.procesarDatos();
                this.cargando = false;
              }
            });
          },
          error: () => {
            this.error = 'No se pudieron cargar los adultos mayores.';
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  private procesarDatos(): void {
    this.totalUsuarios = this.usuarios.length;
    this.totalAdultos = this.adultos.length;
    this.totalSalud = this.salud.length;

    this.usuariosActivos = this.usuarios.filter(u => u.activo === true).length;
    this.adultosActivos = this.adultos.filter(a => a.activo === true).length;
    this.adultosInactivos = this.totalAdultos - this.adultosActivos;

    this.casosRiesgoAlto = this.adultos.filter(a =>
      a.evaluacionIntegral?.nivelRiesgo === 'ALTO'
    ).length;

    this.casosAbandono = this.adultos.filter(a =>
      a.informacionSocial?.situacionAbandono === true
    ).length;

    this.pension65 = this.adultos.filter(a =>
      a.pension65?.beneficiario === true ||
      a.pension65?.posibleBeneficiario === true
    ).length;
  }

  exportarExcel(): void {
    const fecha = new Date().toLocaleDateString('es-PE');

    const resumen = [
      ['REPORTE GENERAL DEL SISTEMA MI ADULTO MAYOR'],
      ['Fecha de generación', fecha],
      [],
      ['Indicador', 'Cantidad'],
      ['Total de usuarios', this.totalUsuarios],
      ['Usuarios activos', this.usuariosActivos],
      ['Total de adultos mayores', this.totalAdultos],
      ['Adultos activos', this.adultosActivos],
      ['Adultos inactivos', this.adultosInactivos],
      ['Atenciones de salud', this.totalSalud],
      ['Casos de riesgo alto', this.casosRiesgoAlto],
      ['Casos de abandono', this.casosAbandono],
      ['Relacionados a Pensión 65', this.pension65],
    ];

    const adultosExcel = this.adultos.map(a => ({
      DNI: a.datosPersonales?.dni || '',
      Nombres: a.datosPersonales?.nombres || '',
      Apellidos: a.datosPersonales?.apellidos || '',
      Sexo: a.datosPersonales?.sexo || '',
      Celular: a.datosPersonales?.celular || '',
      Estado: a.activo ? 'Activo' : 'Inactivo',
      Riesgo: a.evaluacionIntegral?.nivelRiesgo || 'No evaluado',
      Abandono: a.informacionSocial?.situacionAbandono ? 'Sí' : 'No',
      Pension65: a.pension65?.beneficiario ? 'Beneficiario' : 'No'
    }));

    const usuariosExcel = this.usuarios.map(u => ({
      Usuario: u.usuario || '',
      Rol: u.rol || '',
      Estado: u.activo ? 'Activo' : 'Inactivo'
    }));

    const saludExcel = this.salud.map(s => ({
      Fecha: s.fechaAtencion || '',
      Médico: s.medicoResponsable || '',
      Establecimiento: s.establecimientoSalud || '',
      Tipo: s.tipoAtencion || '',
      Diagnóstico: s.diagnostico || '',
      Tratamiento: s.tratamiento || ''
    }));

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumen), 'Resumen');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(adultosExcel), 'Adultos Mayores');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usuariosExcel), 'Usuarios');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(saludExcel), 'Salud');

    XLSX.writeFile(wb, `Reporte_SIAM_${Date.now()}.xlsx`);
  }

  get adultosFiltrados(): any[] {
    if (this.filtro === 'ACTIVOS') return this.adultos.filter(a => a.activo);
    if (this.filtro === 'INACTIVOS') return this.adultos.filter(a => !a.activo);
    if (this.filtro === 'RIESGO') return this.adultos.filter(a => a.evaluacionIntegral?.nivelRiesgo === 'ALTO');
    if (this.filtro === 'ABANDONO') return this.adultos.filter(a => a.informacionSocial?.situacionAbandono);
    return this.adultos;
  }

  nombreAdulto(a: any): string {
    return `${a.datosPersonales?.nombres || ''} ${a.datosPersonales?.apellidos || ''}`.trim();
  }
}