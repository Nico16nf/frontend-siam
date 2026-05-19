import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-social',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-social.component.html',
  styleUrl: './ciam-social.component.css'
})
export class CiamSocialComponent implements OnInit {

  adultosMayores: any[] = [];
  adultosFiltrados: any[] = [];

  adultoSeleccionado: any = null;

  busqueda = '';
  filtroRiesgo = 'TODOS';

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
          this.error = 'No se pudo cargar la información social.';
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
      const riesgo = a?.evaluacionIntegral?.nivelRiesgo || 'SIN_RIESGO';

      const coincideTexto = !texto || nombre.includes(texto) || dni.includes(texto);
      const coincideRiesgo = this.filtroRiesgo === 'TODOS' || riesgo === this.filtroRiesgo;

      return coincideTexto && coincideRiesgo;
    });
  }

  seleccionarAdulto(adulto: any): void {
    this.adultoSeleccionado = structuredClone(adulto);
    this.prepararSocial();
    this.mensaje = '';
    this.error = '';
  }

  prepararSocial(): void {
    this.adultoSeleccionado.informacionSocial ??= {};

    const social = this.adultoSeleccionado.informacionSocial;

    social.viveSolo ??= false;
    social.tieneDiscapacidad ??= false;
    social.situacionAbandono ??= false;
    social.victimaViolencia ??= false;
    social.tipoVivienda ??= '';
    social.observacionesSociales ??= '';
  }

  guardarGestionSocial(): void {
    if (!this.adultoSeleccionado?.id) {
      this.error = 'Seleccione un adulto mayor.';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    this.http.put<any>(`${this.apiUrl}/${this.adultoSeleccionado.id}`, this.adultoSeleccionado)
      .pipe(timeout(10000))
      .subscribe({
        next: (actualizado) => {
          this.mensaje = 'Gestión social actualizada correctamente.';
          this.guardando = false;
          this.adultoSeleccionado = actualizado;
          this.listarAdultos();
        },
        error: () => {
          this.error = 'No se pudo guardar la gestión social.';
          this.guardando = false;
        }
      });
  }

  limpiar(): void {
    this.busqueda = '';
    this.filtroRiesgo = 'TODOS';
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

  calcularPuntajeSocial(adulto: any): number {
    const s = adulto?.informacionSocial;
    if (!s) return 0;

    let puntos = 0;

    if (s.viveSolo) puntos += 20;
    if (s.situacionAbandono) puntos += 30;
    if (s.victimaViolencia) puntos += 30;
    if (s.tieneDiscapacidad) puntos += 15;
    if (!s.tipoVivienda || s.tipoVivienda === 'PRECARIA') puntos += 10;

    return Math.min(puntos, 100);
  }

  estadoSocial(adulto: any): string {
    const puntos = this.calcularPuntajeSocial(adulto);

    if (puntos >= 70) return 'Crítico';
    if (puntos >= 45) return 'Alto';
    if (puntos >= 20) return 'Medio';
    return 'Bajo';
  }

  claseEstadoSocial(adulto: any): string {
    const estado = this.estadoSocial(adulto);

    if (estado === 'Crítico') return 'estado critico';
    if (estado === 'Alto') return 'estado alto';
    if (estado === 'Medio') return 'estado medio';
    return 'estado bajo';
  }

  totalViveSolo(): number {
    return this.adultosMayores.filter(a => a?.informacionSocial?.viveSolo).length;
  }

  totalAbandono(): number {
    return this.adultosMayores.filter(a => a?.informacionSocial?.situacionAbandono).length;
  }

  totalViolencia(): number {
    return this.adultosMayores.filter(a => a?.informacionSocial?.victimaViolencia).length;
  }

  totalSinApoyo(): number {
    return this.adultosMayores.filter(a => a?.informacionSocial?.viveSolo || a?.informacionSocial?.situacionAbandono).length;
  }
}