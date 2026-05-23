import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-visitas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-visitas.component.html',
  styleUrl: './ciam-visitas.component.css'
})
export class CiamVisitasComponent implements OnInit {

  adultosMayores: any[] = [];
  adultosFiltrados: any[] = [];

  adultoSeleccionado: any = null;

  busqueda = '';

  cargando = false;
  guardando = false;

  mensaje = '';
  error = '';

  previewFoto: string | null = null;

  private apiUrl = '';

  visita: any = {
    fechaVisita: '',
    responsableVisita: '',
    cargoResponsable: '',
    motivoVisita: '',
    estadoVivienda: '',
    condicionAdultoMayor: '',
    observaciones: '',
    recomendaciones: '',
    requiereSeguimiento: false,
    fechaProximaVisita: '',
    casoPrioritario: false,
    fotoEvidencia: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      this.apiUrl = `https://backend-siam-production.up.railway.app/api/adultos-mayores`;
    }
  }

  ngOnInit(): void {
    this.listarAdultos();
  }

  listarAdultos(): void {

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

          this.error = 'No se pudo cargar la lista.';
          this.cargando = false;
        }
      });
  }

  filtrar(): void {

    const texto = this.busqueda.toLowerCase().trim();

    this.adultosFiltrados = this.adultosMayores.filter(a => {

      const nombre =
        `${a?.datosPersonales?.nombres || ''} 
         ${a?.datosPersonales?.apellidoPaterno || ''} 
         ${a?.datosPersonales?.apellidoMaterno || ''}`
          .toLowerCase();

      const dni = a?.datosPersonales?.dni || '';

      return nombre.includes(texto) || dni.includes(texto);
    });
  }

  seleccionarAdulto(adulto: any): void {

    this.adultoSeleccionado = adulto;

    this.mensaje = '';
    this.error = '';

    this.resetVisita();

    // PRIORIDAD AUTOMÁTICA
    const social = adulto?.informacionSocial;

    if (
      social?.situacionAbandono ||
      social?.victimaViolencia ||
      social?.viveSolo
    ) {

      this.visita.casoPrioritario = true;
      this.visita.requiereSeguimiento = true;
    }
  }

  resetVisita(): void {

    this.visita = {
      fechaVisita: '',
      responsableVisita: '',
      cargoResponsable: '',
      motivoVisita: '',
      estadoVivienda: '',
      condicionAdultoMayor: '',
      observaciones: '',
      recomendaciones: '',
      requiereSeguimiento: false,
      fechaProximaVisita: '',
      casoPrioritario: false,
      fotoEvidencia: ''
    };

    this.previewFoto = null;
  }

  guardarVisita(): void {

    if (!this.adultoSeleccionado?.id) {

      this.error = 'Seleccione un adulto mayor.';
      return;
    }

    this.guardando = true;

    this.http.post(
      `${this.apiUrl}/${this.adultoSeleccionado.id}/visitas`,
      this.visita
    )
      .pipe(timeout(10000))
      .subscribe({

        next: () => {

          this.mensaje = 'Visita domiciliaria registrada correctamente.';
          this.guardando = false;

          this.resetVisita();
        },

        error: () => {

          this.error = 'No se pudo registrar la visita.';
          this.guardando = false;
        }
      });
  }

  onFileSelected(event: any): void {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      this.previewFoto = reader.result as string;
      this.visita.fotoEvidencia = reader.result;
    };

    reader.readAsDataURL(file);
  }

  nombreCompleto(adulto: any): string {

    const d = adulto?.datosPersonales;

    if (!d) return '';

    return `${d.nombres} ${d.apellidoPaterno} ${d.apellidoMaterno}`;
  }

  obtenerClaseRiesgo(adulto: any): string {

    const riesgo = adulto?.evaluacionIntegral?.nivelRiesgo;

    if (riesgo === 'CRITICO') return 'critico';
    if (riesgo === 'ALTO') return 'alto';
    if (riesgo === 'MEDIO') return 'medio';

    return 'bajo';
  }

  limpiar(): void {

    this.busqueda = '';
    this.adultosFiltrados = [...this.adultosMayores];

    this.adultoSeleccionado = null;

    this.resetVisita();
  }
}