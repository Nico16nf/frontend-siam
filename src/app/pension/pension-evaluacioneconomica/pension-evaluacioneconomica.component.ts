import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-pension-evaluacioneconomica',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './pension-evaluacioneconomica.component.html',
  styleUrl: './pension-evaluacioneconomica.component.css'
})
export class PensionEvaluacioneconomicaComponent implements OnInit {

  adultos: any[] = [];
  adultosFiltrados: any[] = [];

  busqueda = '';
  filtroEstado = 'TODOS';

  adultoSeleccionado: any = null;
  evaluacionResultado: any = null;

  cargando = false;
  evaluando = false;

  mensaje = '';
  error = '';

  private apiPension = '';
  private apiAdultos = '';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiPension = `http://${host}:8080/api/pension65`;
      this.apiAdultos = `http://${host}:8080/api/adultos-mayores`;
      this.listarAdultos();
    }
  }

  listarAdultos(): void {
    this.cargando = true;
    this.error = '';
    this.mensaje = '';
    this.adultoSeleccionado = null;
    this.evaluacionResultado = null;

    this.http.get<any[]>(this.apiAdultos)
      .pipe(timeout(10000))
      .subscribe({
        next: (data) => {
          this.adultos = (data || []).map(adulto => this.convertirAdulto(adulto));
          this.adultosFiltrados = [...this.adultos];
          this.cargando = false;

          if (this.adultos.length === 0) {
            this.mensaje = 'No hay adultos mayores registrados.';
          }
        },
        error: (err) => {
          console.error('Error al cargar adultos mayores:', err);
          this.error = 'No se pudo cargar la lista de adultos mayores.';
          this.cargando = false;
        }
      });
  }

  convertirAdulto(adulto: any): any {
    return {
      id: adulto.id,

      // Se fuerza activo en el frontend para permitir selección.
      // El backend también debe permitir activar o evaluar.
      activo: true,

      dni: adulto.datosPersonales?.dni || '',
      nombres: adulto.datosPersonales?.nombres || '',
      apellidoPaterno: adulto.datosPersonales?.apellidoPaterno || '',
      apellidoMaterno: adulto.datosPersonales?.apellidoMaterno || '',

      edad: this.calcularEdad(adulto.datosPersonales?.fechaNacimiento),

      distrito: adulto.ubicacionActual?.distrito || 'Sin ubicación',

      clasificacionSisfoh:
        adulto.sisfoh?.clasificacionSocioeconomica || 'SIN_SISFOH',

      sisfohVigente:
        adulto.sisfoh?.sisfohVigente || false,

      estadoPension:
        adulto.pension65?.estado || 'SIN_EVALUAR',

      beneficiario:
        adulto.pension65?.beneficiario || false,

      posibleBeneficiario:
        adulto.pension65?.posibleBeneficiario || false
    };
  }

  filtrar(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.adultosFiltrados = this.adultos.filter(adulto => {
      const dni = adulto.dni?.toLowerCase() || '';
      const nombres = adulto.nombres?.toLowerCase() || '';
      const paterno = adulto.apellidoPaterno?.toLowerCase() || '';
      const materno = adulto.apellidoMaterno?.toLowerCase() || '';
      const estado = adulto.estadoPension || 'SIN_EVALUAR';

      const coincideTexto =
        dni.includes(texto) ||
        nombres.includes(texto) ||
        paterno.includes(texto) ||
        materno.includes(texto);

      const coincideEstado =
        this.filtroEstado === 'TODOS' ||
        estado === this.filtroEstado;

      return coincideTexto && coincideEstado;
    });
  }

  seleccionarAdulto(adulto: any): void {
    adulto.activo = true;

    this.adultoSeleccionado = adulto;
    this.evaluacionResultado = null;
    this.mensaje = '';
    this.error = '';
  }

  evaluarAdulto(): void {
    if (!this.adultoSeleccionado?.id) {
      this.error = 'Seleccione un adulto mayor para evaluar.';
      return;
    }

    this.adultoSeleccionado.activo = true;

    this.evaluando = true;
    this.error = '';
    this.mensaje = '';

    const body = {
      observaciones: 'Evaluación económica automática para Pensión 65'
    };

    this.http.post<any>(
      `${this.apiPension}/evaluar/${this.adultoSeleccionado.id}`,
      body
    )
      .pipe(timeout(10000))
      .subscribe({
        next: (resp) => {
          this.evaluacionResultado = resp;

          this.mensaje = resp.beneficiario
            ? 'El adulto mayor fue evaluado como BENEFICIARIO de Pensión 65.'
            : 'Evaluación realizada. El adulto mayor no califica como beneficiario.';

          this.actualizarAdultoEnLista(this.adultoSeleccionado.id, resp);
          this.evaluando = false;
        },
        error: (err) => {
          console.error('Error al evaluar Pensión 65:', err);

          this.error =
            err.error?.message ||
            'No se pudo realizar la evaluación económica. Revisa el service de Pensión 65.';

          this.evaluando = false;
        }
      });
  }

  registrarPago(adultoMayorId: number): void {
    this.error = '';
    this.mensaje = '';

    this.http.put<any>(`${this.apiPension}/pago/${adultoMayorId}`, {})
      .pipe(timeout(10000))
      .subscribe({
        next: (resp) => {
          this.evaluacionResultado = resp;
          this.mensaje = 'Pago registrado correctamente.';
          this.actualizarAdultoEnLista(adultoMayorId, resp);
        },
        error: (err) => {
          console.error('Error al registrar pago:', err);
          this.error = 'No se pudo registrar el pago.';
        }
      });
  }

  actualizarAdultoEnLista(adultoMayorId: number, pension65: any): void {
    const nuevoEstado = pension65?.estado || 'SIN_EVALUAR';

    this.adultos = this.adultos.map(adulto => {
      if (adulto.id === adultoMayorId) {
        return {
          ...adulto,
          activo: true,
          estadoPension: nuevoEstado,
          beneficiario: pension65?.beneficiario || false,
          posibleBeneficiario: pension65?.posibleBeneficiario || false
        };
      }

      return adulto;
    });

    if (this.adultoSeleccionado?.id === adultoMayorId) {
      this.adultoSeleccionado = {
        ...this.adultoSeleccionado,
        activo: true,
        estadoPension: nuevoEstado,
        beneficiario: pension65?.beneficiario || false,
        posibleBeneficiario: pension65?.posibleBeneficiario || false
      };
    }

    this.filtrar();
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

  obtenerEstado(adulto: any): string {
    return adulto?.estadoPension || 'SIN_EVALUAR';
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'BENEFICIARIO':
      case 'ACTIVO':
        return 'estado beneficiario';

      case 'PENDIENTE':
        return 'estado pendiente';

      case 'NO_CALIFICA':
        return 'estado no-califica';

      case 'SUSPENDIDO':
        return 'estado suspendido';

      case 'INACTIVO':
        return 'estado suspendido';

      default:
        return 'estado sin-evaluar';
    }
  }
}