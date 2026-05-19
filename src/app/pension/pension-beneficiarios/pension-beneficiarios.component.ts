import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-pension-beneficiarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pension-beneficiarios.component.html',
  styleUrl: './pension-beneficiarios.component.css'
})
export class PensionBeneficiariosComponent implements OnInit {

  beneficiarios: any[] = [];
  beneficiariosFiltrados: any[] = [];

  busqueda = '';
  cargando = false;
  error = '';
  mensaje = '';

  private apiPension = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiPension = `http://${host}:8080/api/pension65`;
      this.listarBeneficiarios();
    }
  }

  listarBeneficiarios(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';

    this.http.get<any[]>(`${this.apiPension}/beneficiarios`)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.beneficiarios = (data || [])
            .filter(p => p.beneficiario === true)
            .map(p => this.convertirBeneficiario(p));

          this.beneficiariosFiltrados = [...this.beneficiarios];

          if (this.beneficiarios.length === 0) {
            this.mensaje = 'No hay beneficiarios activos registrados.';
          }

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar beneficiarios:', err);
          this.error = 'No se pudo cargar la lista de beneficiarios.';
          this.cargando = false;
        }
      });
  }

  convertirBeneficiario(pension: any): any {
    const adulto = pension.adultoMayor || {};
    const datos = adulto.datosPersonales || {};

    return {
      idPension: pension.id,
      idAdulto: adulto.id,

      dni: datos.dni || '',
      nombres: datos.nombres || '',
      apellidoPaterno: datos.apellidoPaterno || '',
      apellidoMaterno: datos.apellidoMaterno || '',

      estado: pension.estado || 'BENEFICIARIO',
      beneficiario: pension.beneficiario || false,

      fechaAfiliacion: pension.fechaAfiliacion || 'No registrada',
      fechaUltimoPago: pension.fechaUltimoPago || 'Sin pago',
      fechaProximoPago: pension.fechaProximoPago || 'No programado',

      montoUltimoPago: pension.montoUltimoPago || 0,
      montoProximoPago: pension.montoProximoPago || 350,

      observaciones: pension.observaciones || 'Sin observaciones'
    };
  }

  filtrar(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.beneficiariosFiltrados = this.beneficiarios.filter(b => {
      const dni = b.dni.toLowerCase();
      const nombre = `${b.nombres} ${b.apellidoPaterno} ${b.apellidoMaterno}`.toLowerCase();

      return dni.includes(texto) || nombre.includes(texto);
    });
  }

  registrarPago(beneficiario: any): void {
    this.error = '';
    this.mensaje = '';

    this.http.put<any>(`${this.apiPension}/pago/${beneficiario.idAdulto}`, {})
      .pipe(timeout(10000))
      .subscribe({
        next: () => {
          this.mensaje = 'Pago registrado correctamente.';
          this.listarBeneficiarios();
        },
        error: () => {
          this.error = 'No se pudo registrar el pago.';
        }
      });
  }

  claseEstado(estado: string): string {
    if (estado === 'ACTIVO' || estado === 'BENEFICIARIO') {
      return 'estado activo';
    }

    return 'estado';
  }
}