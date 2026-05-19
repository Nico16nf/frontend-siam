import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-busqueda.component.html',
  styleUrl: './ciam-busqueda.component.css'
})
export class CiamBusquedaComponent implements OnInit {

  dni = '';

  adultosMayores: any[] = [];
  adultosFiltrados: any[] = [];

  adultoMayor: any = null;
  adultoSeleccionado: any = null;
  adultoEditando: any = null;

  mostrarPanelClasificacion = false;
  modoEdicion = false;

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  private apiUrl = '';

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
    this.listarAdultosMayores();
  }

  // =========================
  // LISTAR
  // =========================

  listarAdultosMayores(): void {

    this.cargando = true;

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

  // =========================
  // BUSCAR POR DNI
  // =========================

  buscarPorDni(): void {

    this.error = '';
    this.mensaje = '';

    const texto = this.dni.trim();

    if (!texto) {

      this.adultosFiltrados = [...this.adultosMayores];
      return;
    }

    this.adultosFiltrados = this.adultosMayores.filter(a =>
      a?.datosPersonales?.dni?.includes(texto)
    );

    if (this.adultosFiltrados.length === 0) {

      this.error = 'No se encontraron resultados.';
    } else {

      this.mensaje = `Se encontraron ${this.adultosFiltrados.length} resultado(s).`;
    }
  }

  // =========================
  // VER DETALLE
  // =========================

  verDetalle(adulto: any): void {

    this.adultoMayor = adulto;

    this.modoEdicion = false;
    this.mostrarPanelClasificacion = false;

    this.error = '';
    this.mensaje = 'Detalle cargado correctamente.';
  }

  // =========================
  // EDITAR
  // =========================

  editarDatos(adulto: any): void {

    this.adultoEditando = structuredClone(adulto);

    this.prepararObjetos(this.adultoEditando);

    this.adultoMayor = adulto;

    this.modoEdicion = true;
    this.mostrarPanelClasificacion = false;

    this.error = '';
    this.mensaje = 'Modo edición activado.';
  }

  guardarEdicion(): void {

    if (!this.adultoEditando?.id) {

      this.error = 'No existe un adulto seleccionado.';
      return;
    }

    this.guardando = true;

    this.http.put<any>(
      `${this.apiUrl}/${this.adultoEditando.id}`,
      this.adultoEditando
    )
    .pipe(timeout(10000))
    .subscribe({

      next: (data) => {

        this.guardando = false;

        this.mensaje = 'Datos actualizados correctamente.';

        this.adultoMayor = data;

        this.modoEdicion = false;

        this.adultoEditando = null;

        this.listarAdultosMayores();
      },

      error: () => {

        this.guardando = false;

        this.error = 'No se pudo actualizar la información.';
      }
    });
  }

  cancelarEdicion(): void {

    this.modoEdicion = false;
    this.adultoEditando = null;
  }

  // =========================
  // FOTO
  // =========================

  seleccionarFotoEdicion(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const archivo = input.files[0];

    if (!archivo.type.startsWith('image/')) {

      this.error = 'Seleccione una imagen válida.';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {

      this.adultoEditando.datosPersonales.foto =
        reader.result as string;
    };

    reader.readAsDataURL(archivo);
  }

  // =========================
  // CLASIFICACIÓN
  // =========================

  abrirClasificacion(adulto: any): void {

    this.adultoSeleccionado = structuredClone(adulto);

    this.prepararObjetos(this.adultoSeleccionado);

    this.adultoMayor = adulto;

    this.mostrarPanelClasificacion = true;
    this.modoEdicion = false;

    this.error = '';
    this.mensaje = '';
  }

  guardarClasificacion(): void {

    if (!this.adultoSeleccionado?.id) {

      this.error = 'Seleccione un adulto mayor.';
      return;
    }

    this.guardando = true;

    this.http.put<any>(
      `${this.apiUrl}/${this.adultoSeleccionado.id}`,
      this.adultoSeleccionado
    )
    .pipe(timeout(10000))
    .subscribe({

      next: (data) => {

        this.guardando = false;

        this.mensaje =
          'Clasificación socioeconómica actualizada correctamente.';

        this.mostrarPanelClasificacion = false;

        this.adultoMayor = data;

        this.listarAdultosMayores();
      },

      error: () => {

        this.guardando = false;

        this.error =
          'No se pudo guardar la clasificación.';
      }
    });
  }

  cerrarClasificacion(): void {

    this.mostrarPanelClasificacion = false;
    this.adultoSeleccionado = null;
  }

  // =========================
  // DESACTIVAR
  // =========================

  desactivar(adulto: any): void {

    if (!adulto?.id) return;

    const confirmar = confirm(
      `¿Deseas desactivar a ${this.obtenerNombreCompletoLista(adulto)}?`
    );

    if (!confirmar) return;

    this.http.delete(
      `${this.apiUrl}/${adulto.id}`,
      { responseType: 'text' }
    )
    .pipe(timeout(10000))
    .subscribe({

      next: () => {

        this.mensaje =
          'Adulto mayor desactivado correctamente.';

        this.listarAdultosMayores();
      },

      error: () => {

        this.error =
          'No se pudo desactivar el adulto mayor.';
      }
    });
  }

  // =========================
  // LIMPIAR
  // =========================

  limpiar(): void {

    this.dni = '';

    this.adultoMayor = null;
    this.adultoSeleccionado = null;
    this.adultoEditando = null;

    this.modoEdicion = false;
    this.mostrarPanelClasificacion = false;

    this.error = '';
    this.mensaje = '';

    this.adultosFiltrados = [...this.adultosMayores];
  }

  // =========================
  // PREPARAR OBJETOS
  // =========================

  prepararObjetos(adulto: any): void {

    adulto.datosPersonales ??= {};
    adulto.lugarNacimiento ??= {};
    adulto.ubicacionActual ??= {};
    adulto.informacionSocial ??= {};
    adulto.sisfoh ??= {};
    adulto.evaluacionIntegral ??= {};
    adulto.pension65 ??= {};

    const s = adulto.sisfoh;
    const social = adulto.informacionSocial;

    s.tieneIngresos ??= false;
    s.ingresoMensual ??= 0;

    s.viviendaPropia ??= false;

    s.tieneAgua ??= false;
    s.tieneLuz ??= false;
    s.tieneDesague ??= false;

    s.recibeApoyoFamiliar ??= false;

    s.viveSolo ??= false;
    s.discapacidad ??= false;

    s.enfermedadCronica ??= false;

    s.situacionAbandono ??= false;

    s.cantidadDependientes ??= 0;

    social.viveSolo ??= false;
    social.tieneDiscapacidad ??= false;
    social.situacionAbandono ??= false;
    social.victimaViolencia ??= false;

    social.tipoVivienda ??= '';
    social.observacionesSociales ??= '';
  }

  // =========================
  // NOMBRE COMPLETO
  // =========================

  obtenerNombreCompleto(): string {
    return this.obtenerNombreCompletoLista(this.adultoMayor);
  }

  obtenerNombreCompletoLista(adulto: any): string {

    const d = adulto?.datosPersonales;

    if (!d) return 'Sin nombre';

    return `
      ${d.nombres || ''}
      ${d.apellidoPaterno || ''}
      ${d.apellidoMaterno || ''}
    `.trim();
  }

  // =========================
  // EDAD
  // =========================

  obtenerEdad(adulto: any): number | string {

    const fecha =
      adulto?.datosPersonales?.fechaNacimiento;

    if (!fecha) return '-';

    const nacimiento = new Date(fecha);
    const hoy = new Date();

    let edad =
      hoy.getFullYear() - nacimiento.getFullYear();

    const mes =
      hoy.getMonth() - nacimiento.getMonth();

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

  // =========================
  // CUMPLIMIENTO
  // =========================

  calcularCumplimientoVisual(adulto: any): number {

    const s = adulto?.sisfoh;

    if (!s) return 0;

    let completados = 0;

    const total = 11;

    if (s.tieneIngresos !== null) completados++;
    if (s.ingresoMensual !== null) completados++;

    if (s.viviendaPropia !== null) completados++;

    if (s.tieneAgua !== null) completados++;
    if (s.tieneLuz !== null) completados++;
    if (s.tieneDesague !== null) completados++;

    if (s.recibeApoyoFamiliar !== null) completados++;

    if (s.viveSolo !== null) completados++;

    if (s.discapacidad !== null) completados++;

    if (s.enfermedadCronica !== null) completados++;

    if (s.situacionAbandono !== null) completados++;

    return Math.round((completados / total) * 100);
  }

  obtenerEstadoCumplimiento(adulto: any): string {

    const porcentaje =
      this.calcularCumplimientoVisual(adulto);

    if (porcentaje >= 90) return 'Completo';

    if (porcentaje >= 50) return 'En proceso';

    return 'Pendiente';
  }

  obtenerClaseCumplimiento(adulto: any): string {

    const porcentaje =
      this.calcularCumplimientoVisual(adulto);

    if (porcentaje >= 90)
      return 'cumplimiento completo';

    if (porcentaje >= 50)
      return 'cumplimiento proceso';

    return 'cumplimiento pendiente';
  }

  // =========================
  // RIESGO
  // =========================

  obtenerClaseRiesgoAdulto(adulto: any): string {

    const riesgo =
      adulto?.evaluacionIntegral?.nivelRiesgo;

    if (riesgo === 'CRITICO')
      return 'riesgo critico';

    if (riesgo === 'ALTO')
      return 'riesgo alto';

    if (riesgo === 'MEDIO')
      return 'riesgo medio';

    return 'riesgo bajo';
  }

  obtenerClaseRiesgo(): string {
    return this.obtenerClaseRiesgoAdulto(this.adultoMayor);
  }

  // =========================
  // SISFOH
  // =========================

  obtenerClaseSisfohAdulto(adulto: any): string {

    const clasificacion =
      adulto?.sisfoh?.clasificacionSocioeconomica;

    if (clasificacion === 'POBRE_EXTREMO')
      return 'sisfoh extremo';

    if (clasificacion === 'POBRE')
      return 'sisfoh pobre';

    if (clasificacion === 'NO_POBRE')
      return 'sisfoh nopobre';

    return 'sisfoh sin';
  }

  obtenerClaseSisfoh(): string {
    return this.obtenerClaseSisfohAdulto(this.adultoMayor);
  }

  // =========================
  // FECHA SISFOH
  // =========================

  obtenerFechaVencimientoSisfoh(adulto: any): string {

    return adulto?.sisfoh?.fechaVencimiento
      || 'Sin fecha';
  }

  diasParaVencerSisfoh(adulto: any): number | null {

    const fecha =
      adulto?.sisfoh?.fechaVencimiento;

    if (!fecha) return null;

    const hoy = new Date();

    const vencimiento = new Date(fecha);

    hoy.setHours(0, 0, 0, 0);

    vencimiento.setHours(0, 0, 0, 0);

    const diferencia =
      vencimiento.getTime() - hoy.getTime();

    return Math.ceil(
      diferencia / (1000 * 60 * 60 * 24)
    );
  }

  obtenerTextoAlertaSisfoh(adulto: any): string {

    const dias =
      this.diasParaVencerSisfoh(adulto);

    if (dias === null)
      return 'Sin fecha';

    if (dias < 0)
      return 'Vencido';

    if (dias <= 30)
      return `Vence en ${dias} día(s)`;

    return 'Vigente';
  }

  obtenerClaseAlertaSisfoh(adulto: any): string {

    const dias =
      this.diasParaVencerSisfoh(adulto);

    if (dias === null)
      return 'alerta-sisfoh sin-fecha';

    if (dias < 0)
      return 'alerta-sisfoh vencido';

    if (dias <= 30)
      return 'alerta-sisfoh por-vencer';

    return 'alerta-sisfoh vigente';
  }

}