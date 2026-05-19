import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-salud-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './salud-historial.component.html',
  styleUrl: './salud-historial.component.css'
})
export class SaludHistorialComponent implements OnInit {

  atenciones: any[] = [];
  atencionesFiltradas: any[] = [];

  atencionSeleccionada: any = null;

  busqueda = '';
  tipoAtencion = 'TODOS';
  medico = '';
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
      this.apiUrl = `http://${host}:8080/api/salud`;
    }
  }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.http.get<any[]>(this.apiUrl)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.atenciones = data || [];
          this.atencionesFiltradas = [...this.atenciones];
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el historial clínico.';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {
    const texto = this.busqueda.trim().toLowerCase();
    const medicoTexto = this.medico.trim().toLowerCase();

    this.atencionesFiltradas = this.atenciones.filter(a => {
      const adulto = a?.adultoMayor;
      const d = adulto?.datosPersonales;

      const nombre = `${d?.nombres || ''} ${d?.apellidoPaterno || ''} ${d?.apellidoMaterno || ''}`.toLowerCase();
      const dni = d?.dni || '';
      const medico = (a?.medicoResponsable || '').toLowerCase();
      const tipo = a?.tipoAtencion || '';
      const fecha = a?.fechaAtencion || '';

      const coincideTexto = !texto || nombre.includes(texto) || dni.includes(texto);
      const coincideMedico = !medicoTexto || medico.includes(medicoTexto);
      const coincideTipo = this.tipoAtencion === 'TODOS' || tipo === this.tipoAtencion;
      const coincideInicio = !this.fechaInicio || fecha >= this.fechaInicio;
      const coincideFin = !this.fechaFin || fecha <= this.fechaFin;

      return coincideTexto && coincideMedico && coincideTipo && coincideInicio && coincideFin;
    });
  }

  seleccionarAtencion(atencion: any): void {
    this.atencionSeleccionada = atencion;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.tipoAtencion = 'TODOS';
    this.medico = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.atencionSeleccionada = null;
    this.atencionesFiltradas = [...this.atenciones];
  }

  nombreCompleto(atencion: any): string {
    const d = atencion?.adultoMayor?.datosPersonales;

    if (!d) return 'Sin paciente';

    return `${d.nombres || ''} ${d.apellidoPaterno || ''} ${d.apellidoMaterno || ''}`.trim();
  }

  dniPaciente(atencion: any): string {
    return atencion?.adultoMayor?.datosPersonales?.dni || '-';
  }

  obtenerEdad(atencion: any): number | string {
    const fecha = atencion?.adultoMayor?.datosPersonales?.fechaNacimiento;

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

  claseTipo(tipo: string): string {
    if (tipo === 'EMERGENCIA') return 'tipo emergencia';
    if (tipo === 'CONTROL') return 'tipo control';
    if (tipo === 'CAMPAÑA') return 'tipo campana';
    if (tipo === 'VISITA_DOMICILIARIA') return 'tipo visita';
    return 'tipo consulta';
  }

  claseSeguimiento(atencion: any): string {
    return atencion?.requiereSeguimiento ? 'seguimiento si' : 'seguimiento no';
  }

  exportarExcel(): void {
    if (this.atencionesFiltradas.length === 0) {
      this.error = 'No hay datos para exportar.';
      return;
    }

    const filas = this.atencionesFiltradas.map(a => ({
      DNI: this.dniPaciente(a),
      Paciente: this.nombreCompleto(a),
      Edad: this.obtenerEdad(a),
      FechaAtencion: a?.fechaAtencion || '',
      Medico: a?.medicoResponsable || '',
      Establecimiento: a?.establecimientoSalud || '',
      TipoAtencion: a?.tipoAtencion || '',
      Diagnostico: a?.diagnostico || '',
      Tratamiento: a?.tratamiento || '',
      Recomendaciones: a?.recomendaciones || '',
      PresionArterial: a?.presionArterial || '',
      Peso: a?.peso || '',
      Talla: a?.talla || '',
      Glucosa: a?.glucosa || '',
      RequiereSeguimiento: a?.requiereSeguimiento ? 'Sí' : 'No',
      ProximoControl: a?.fechaProximoControl || '',
      Observaciones: a?.observaciones || ''
    }));

    const columnas = Object.keys(filas[0]);

    const csv = [
      columnas.join(';'),
      ...filas.map(fila =>
        columnas.map(col => `"${String((fila as any)[col] ?? '').replace(/"/g, '""')}"`).join(';')
      )
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `historial-clinico-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);

    this.mensaje = 'Historial clínico exportado correctamente.';
  }

  imprimir(): void {
    window.print();
  }
}