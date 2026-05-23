import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { timeout } from 'rxjs';

@Component({
  selector: 'app-ciam-registraradulto',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ciam-registraradulto.component.html',
  styleUrl: './ciam-registraradulto.component.css'
})
export class CiamRegistraradultoComponent {

  apiUrl = '';

  cargando = false;

  tieneResponsable = false;

  previewFoto: string | null = null;

  adultoMayor: any = {

    datosPersonales: {
      dni: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      sexo: '',
      fechaNacimiento: '',
      celular: '',
      correo: '',
      estadoCivil: '',
      foto: ''
    },

    lugarNacimiento: {
      departamentoNacimiento: '',
      provinciaNacimiento: '',
      distritoNacimiento: '',
      comunidadNacimiento: ''
    },

    ubicacionActual: {
      departamento: '',
      provincia: '',
      distrito: '',
      centroPoblado: '',
      comunidad: '',
      direccion: ''
    },

    responsableFamiliar: null
  };

  responsableFamiliar: any = {

    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    celular: '',
    correo: '',
    parentesco: '',
    viveConAdultoMayor: false,

    ubicacionActual: {
      departamento: '',
      provincia: '',
      distrito: '',
      centroPoblado: '',
      comunidad: '',
      direccion: ''
    }
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

    if (isPlatformBrowser(this.platformId)) {

      const host = window.location.hostname;

      this.apiUrl =
        `https://backend-siam-production.up.railway.app/api/adultos-mayores`;
    }
  }

  // =====================================================
  // 🔷 SELECCIONAR FOTO
  // =====================================================

  seleccionarFoto(event: any): void {

    const archivo = event.target.files[0];

    if (!archivo) return;

    const reader = new FileReader();

    reader.onload = () => {

      this.previewFoto = reader.result as string;

      this.adultoMayor
        .datosPersonales
        .foto = reader.result;
    };

    reader.readAsDataURL(archivo);
  }

  // =====================================================
  // 🔷 REGISTRAR ADULTO MAYOR
  // =====================================================

  registrarAdultoMayor(): void {

    if (this.cargando) return;

    // 🔷 RESPONSABLE OPCIONAL
    if (this.tieneResponsable) {

      this.adultoMayor.responsableFamiliar =
        this.responsableFamiliar;

    } else {

      this.adultoMayor.responsableFamiliar = null;
    }

    this.cargando = true;

    this.http.post(
      this.apiUrl,
      this.adultoMayor
    )
    .pipe(timeout(15000))
    .subscribe({

      next: () => {

        alert('Adulto mayor registrado correctamente');

        this.limpiarFormulario();

        this.cargando = false;
      },

      error: (error) => {

        console.error(error);

        alert(
          error?.error?.message ||
          'Error al registrar adulto mayor'
        );

        this.cargando = false;
      }
    });
  }

  // =====================================================
  // 🔷 LIMPIAR FORMULARIO
  // =====================================================

  limpiarFormulario(): void {

    this.previewFoto = null;

    this.tieneResponsable = false;

    this.adultoMayor = {

      datosPersonales: {
        dni: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        sexo: '',
        fechaNacimiento: '',
        celular: '',
        correo: '',
        estadoCivil: '',
        foto: ''
      },

      lugarNacimiento: {
        departamentoNacimiento: '',
        provinciaNacimiento: '',
        distritoNacimiento: '',
        comunidadNacimiento: ''
      },

      ubicacionActual: {
        departamento: '',
        provincia: '',
        distrito: '',
        centroPoblado: '',
        comunidad: '',
        direccion: ''
      },

      responsableFamiliar: null
    };

    this.responsableFamiliar = {

      dni: '',
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      celular: '',
      correo: '',
      parentesco: '',
      viveConAdultoMayor: false,

      ubicacionActual: {
        departamento: '',
        provincia: '',
        distrito: '',
        centroPoblado: '',
        comunidad: '',
        direccion: ''
      }
    };
  }
}