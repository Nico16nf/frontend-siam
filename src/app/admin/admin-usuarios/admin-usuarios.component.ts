import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.css'
})
export class AdminUsuariosComponent implements OnInit {

  apiUrl = '';

  usuarios: any[] = [];

  previewImage: string | null = null;

  modoEdicion = false;
  usuarioSeleccionadoId: number | null = null;

  verPassword = false;

  mensaje = '';
  error = '';

  roles: string[] = ['ADMIN', 'CIAM', 'SALUD', 'PENSION_65'];

  usuario = {
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    foto: '',
    rol: '',
    usuario: '',
    password: '',
    activo: true,
    bloqueado: false,
    intentosFallidos: 0
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

    this.listarUsuarios();
  }

  listarUsuarios() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al listar usuarios';
      }
    });
  }

  onFileSelected(event: any) {
    this.error = '';

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
      this.usuario.foto = base64;
    };

    reader.readAsDataURL(file);
  }

  guardar() {
    if (this.modoEdicion) {
      this.actualizarUsuario();
    } else {
      this.crearUsuario();
    }
  }

  crearUsuario() {
    this.mensaje = '';
    this.error = '';

    const nuevoUsuario = {
      nombres: this.usuario.nombres.trim(),
      apellidos: this.usuario.apellidos.trim(),
      dni: this.usuario.dni.trim(),
      email: this.usuario.email.trim(),
      telefono: this.usuario.telefono?.trim() || null,
      foto: this.usuario.foto || null,
      rol: this.usuario.rol,
      usuario: this.usuario.usuario.trim(),
      password: this.usuario.password.trim(),
      activo: true,
      bloqueado: false,
      intentosFallidos: 0
    };

    this.http.post(this.apiUrl, nuevoUsuario).subscribe({
      next: () => {
        this.mensaje = 'Usuario creado correctamente';
        this.limpiarFormulario();
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || err.error || 'Error al crear usuario';
      }
    });
  }

  editarUsuario(u: any) {
    this.modoEdicion = true;
    this.usuarioSeleccionadoId = u.id;

    this.usuario = {
      nombres: u.nombres || '',
      apellidos: u.apellidos || '',
      dni: u.dni || '',
      email: u.email || '',
      telefono: u.telefono || '',
      foto: u.foto || '',
      rol: u.rol || '',
      usuario: u.usuario || '',
      password: u.password || '',
      activo: u.activo,
      bloqueado: u.bloqueado,
      intentosFallidos: u.intentosFallidos || 0
    };

    this.previewImage = u.foto || null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  actualizarUsuario() {
    this.mensaje = '';
    this.error = '';

    if (!this.usuarioSeleccionadoId) {
      this.error = 'No hay usuario seleccionado';
      return;
    }

    const datosActualizados = {
      nombres: this.usuario.nombres.trim(),
      apellidos: this.usuario.apellidos.trim(),
      dni: this.usuario.dni.trim(),
      email: this.usuario.email.trim(),
      telefono: this.usuario.telefono?.trim() || null,
      foto: this.usuario.foto || null,
      rol: this.usuario.rol,
      usuario: this.usuario.usuario.trim(),
      password: this.usuario.password?.trim() || '',
      activo: this.usuario.activo,
      bloqueado: this.usuario.bloqueado,
      intentosFallidos: this.usuario.intentosFallidos
    };

    this.http.put(`${this.apiUrl}/${this.usuarioSeleccionadoId}`, datosActualizados).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado correctamente';
        this.limpiarFormulario();
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || err.error || 'Error al actualizar usuario';
      }
    });
  }

  cambiarEstado(u: any) {
    const actualizado = {
      ...u,
      activo: !u.activo,
      password: u.password || 'Temporal123'
    };

    this.http.put(`${this.apiUrl}/${u.id}`, actualizado).subscribe({
      next: () => {
        this.mensaje = u.activo ? 'Cuenta desactivada correctamente' : 'Cuenta activada correctamente';
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cambiar estado de cuenta';
      }
    });
  }

  bloquearUsuario(u: any) {
    const actualizado = {
      ...u,
      bloqueado: true,
      password: u.password || 'Temporal123'
    };

    this.http.put(`${this.apiUrl}/${u.id}`, actualizado).subscribe({
      next: () => {
        this.mensaje = 'Usuario bloqueado correctamente';
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al bloquear usuario';
      }
    });
  }

  desbloquearUsuario(u: any) {
    const actualizado = {
      ...u,
      bloqueado: false,
      intentosFallidos: 0,
      password: u.password || 'Temporal123'
    };

    this.http.put(`${this.apiUrl}/${u.id}`, actualizado).subscribe({
      next: () => {
        this.mensaje = 'Usuario desbloqueado correctamente';
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al desbloquear usuario';
      }
    });
  }

  resetearPassword(u: any) {
    const nuevaPassword = '123456';

    const actualizado = {
      ...u,
      password: nuevaPassword
    };

    this.http.put(`${this.apiUrl}/${u.id}`, actualizado).subscribe({
      next: () => {
        this.mensaje = `Contraseña reseteada. Nueva contraseña: ${nuevaPassword}`;
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al resetear contraseña';
      }
    });
  }

  asignarRol(u: any, nuevoRol: string) {
    const actualizado = {
      ...u,
      rol: nuevoRol,
      password: u.password || 'Temporal123'
    };

    this.http.put(`${this.apiUrl}/${u.id}`, actualizado).subscribe({
      next: () => {
        this.mensaje = 'Rol actualizado correctamente';
        this.listarUsuarios();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al asignar rol';
      }
    });
  }

  toggleVerPassword() {
    this.verPassword = !this.verPassword;
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'Sin inicio';

    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  verHistorialAccesos(u: any) {
    this.error = 'Endpoint de historial aún no implementado para: ' + u.usuario;
  }

  verSesionesActivas(u: any) {
    this.error = 'Endpoint de sesiones activas aún no implementado para: ' + u.usuario;
  }

  cancelarEdicion() {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.modoEdicion = false;
    this.usuarioSeleccionadoId = null;
    this.previewImage = null;
    this.verPassword = false;

    this.usuario = {
      nombres: '',
      apellidos: '',
      dni: '',
      email: '',
      telefono: '',
      foto: '',
      rol: '',
      usuario: '',
      password: '',
      activo: true,
      bloqueado: false,
      intentosFallidos: 0
    };
  }
}
