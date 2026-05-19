import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-pension-salud',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pension-salud.component.html',
  styleUrl: './pension-salud.component.css'
})
export class PensionSaludComponent implements OnInit {

  adultos: any[] = [];
  adultosFiltrados: any[] = [];

  adultoSeleccionado: any = null;
  historialSalud: any[] = [];

  busqueda = '';
  cargandoAdultos = false;
  cargandoSalud = false;

  mensaje = '';
  error = '';

  private apiAdultos = '';
  private apiSalud = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiAdultos = `http://${host}:8080/api/adultos-mayores`;
      this.apiSalud = `http://${host}:8080/api/salud`;
      this.listarAdultos();
    }
  }

  listarAdultos(): void {
    this.cargandoAdultos = true;
    this.error = '';
    this.mensaje = '';

    this.http.get<any[]>(this.apiAdultos)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.adultos = (data || []).map(a => this.convertirAdulto(a));
          this.adultosFiltrados = [...this.adultos];
          this.cargandoAdultos = false;
        },
        error: () => {
          this.error = 'No se pudo cargar la lista de adultos mayores.';
          this.cargandoAdultos = false;
        }
      });
  }

  convertirAdulto(adulto: any): any {
    return {
      id: adulto.id,
      dni: adulto.datosPersonales?.dni || '',
      nombres: adulto.datosPersonales?.nombres || '',
      apellidoPaterno: adulto.datosPersonales?.apellidoPaterno || '',
      apellidoMaterno: adulto.datosPersonales?.apellidoMaterno || '',
      edad: this.calcularEdad(adulto.datosPersonales?.fechaNacimiento),
      distrito: adulto.ubicacionActual?.distrito || 'Sin ubicación',
      estadoPension: adulto.pension65?.estado || 'SIN_EVALUAR',
      beneficiario: adulto.pension65?.beneficiario || false,
      riesgo: adulto.evaluacionIntegral?.nivelRiesgo || 'NO EVALUADO'
    };
  }

  filtrar(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.adultosFiltrados = this.adultos.filter(a => {
      const nombre = `${a.nombres} ${a.apellidoPaterno} ${a.apellidoMaterno}`.toLowerCase();
      const dni = a.dni.toLowerCase();

      return nombre.includes(texto) || dni.includes(texto);
    });
  }

  seleccionarAdulto(adulto: any): void {
    this.adultoSeleccionado = adulto;
    this.historialSalud = [];
    this.error = '';
    this.mensaje = '';
    this.cargarHistorialSalud(adulto.id);
  }

  cargarHistorialSalud(adultoMayorId: number): void {
    this.cargandoSalud = true;

    this.http.get<any[]>(`${this.apiSalud}/adulto/${adultoMayorId}`)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.historialSalud = data || [];

          if (this.historialSalud.length === 0) {
            this.mensaje = 'Este adulto mayor no tiene historial médico registrado.';
          }

          this.cargandoSalud = false;
        },
        error: () => {
          this.error = 'No se pudo cargar el historial de salud.';
          this.cargandoSalud = false;
        }
      });
  }

  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  claseRiesgo(riesgo: string): string {
    if (riesgo === 'CRITICO') return 'riesgo critico';
    if (riesgo === 'ALTO') return 'riesgo alto';
    if (riesgo === 'MEDIO') return 'riesgo medio';
    return 'riesgo bajo';
  }
}