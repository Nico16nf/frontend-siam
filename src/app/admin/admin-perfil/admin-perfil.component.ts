import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-perfil.component.html',
  styleUrl: './admin-perfil.component.css'
})
export class AdminPerfilComponent implements OnInit {

  apiUrl = '';
  mensaje = '';
  error = '';
  previewImage: string | null = null;
  editando = false;
  perfilOriginal: any = null;

  perfil: any = {
    id: null,
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    foto: '',
    rol: '',
    usuario: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const host = window.location.hostname;
    const backendHost = host === 'localhost' ? 'localhost' : host;
    this.apiUrl = `backend-siam-production.up.railway.app/api/usuarios`;

    this.cargarPerfil();
  }

  cargarPerfil() {
    this.mensaje = '';
    this.error = '';

    const session = sessionStorage.getItem('sessionAdmin');

    if (!session) {
      this.error = 'No hay sesión activa';
      return;
    }

    const data = JSON.parse(session);
    const id = data.id;
    const usuarioSesion = data.usuario;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (usuarios) => {
        const encontrado = usuarios.find(u =>
          String(u.id) === String(id) || u.usuario === usuarioSesion
        );

        if (!encontrado) {
          this.error = 'No se encontró el perfil del usuario logueado';
          return;
        }

        this.perfil = {
          ...encontrado,
          password: ''
        };

        this.previewImage = encontrado.foto || null;
        this.perfilOriginal = JSON.parse(JSON.stringify(this.perfil));
        this.editando = false;
      },
      error: () => {
        this.error = 'Error al cargar el perfil';
      }
    });
  }

  activarEdicion() {
    this.mensaje = '';
    this.error = '';
    this.perfilOriginal = JSON.parse(JSON.stringify(this.perfil));
    this.editando = true;
  }

  cancelarEdicion() {
    this.mensaje = '';
    this.error = '';
    this.perfil = JSON.parse(JSON.stringify(this.perfilOriginal));
    this.previewImage = this.perfil.foto || null;
    this.editando = false;
  }

  onFileSelected(event: any) {
    this.error = '';

    if (!this.editando) return;

    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes';
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      this.previewImage = base64;
      this.perfil.foto = base64;
    };

    reader.readAsDataURL(file);
  }

  actualizarPerfil() {
    this.mensaje = '';
    this.error = '';

    if (!this.perfil.id) {
      this.error = 'No existe ID de usuario para actualizar';
      return;
    }

    if (!this.perfil.password || this.perfil.password.trim().length < 6) {
      this.error = 'Para guardar cambios debes ingresar una contraseña de mínimo 6 caracteres';
      return;
    }

    const usuarioActualizado = {
      nombres: this.perfil.nombres.trim(),
      apellidos: this.perfil.apellidos.trim(),
      dni: this.perfil.dni.trim(),
      email: this.perfil.email.trim(),
      telefono: this.perfil.telefono?.trim() ? this.perfil.telefono.trim() : null,
      foto: this.perfil.foto || null,
      rol: this.perfil.rol,
      usuario: this.perfil.usuario.trim(),
      password: this.perfil.password.trim()
    };

    this.http.put(`${this.apiUrl}/${this.perfil.id}`, usuarioActualizado).subscribe({
      next: (resp: any) => {
        this.mensaje = 'Perfil actualizado correctamente';

        const session = sessionStorage.getItem('sessionAdmin');

        if (session) {
          const data = JSON.parse(session);

          sessionStorage.setItem('sessionAdmin', JSON.stringify({
            ...data,
            id: resp?.id || this.perfil.id,
            usuario: resp?.usuario || this.perfil.usuario,
            nombres: resp?.nombres || this.perfil.nombres,
            apellidos: resp?.apellidos || this.perfil.apellidos,
            rol: resp?.rol || this.perfil.rol
          }));
        }

        this.perfil.password = '';
        this.perfilOriginal = JSON.parse(JSON.stringify(this.perfil));
        this.previewImage = this.perfil.foto || null;
        this.editando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || err.error || 'Error al actualizar el perfil';
      }
    });
  }
}
