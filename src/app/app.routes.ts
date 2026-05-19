import { Routes } from '@angular/router';

// 📄 Páginas públicas
import { InicioComponent } from './paginas/inicio/inicio.component';
import { ConsultaComponent } from './paginas/consulta/consulta.component';

// 🔐 Logins
import { LoginAdminComponent } from './login/login-admin/login-admin.component';
import { LoginCiamComponent } from './login/login-ciam/login-ciam.component';
import { LoginSaludComponent } from './login/login-salud/login-salud.component';
import { LoginPensionComponent } from './login/login-pension/login-pension.component';

// 🔑 Accesos
import { AccesosComponent } from './login/accesos/accesos.component';

// 🔥 ADMIN
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminUsuariosComponent } from './admin/admin-usuarios/admin-usuarios.component';
import { AdminPerfilComponent } from './admin/admin-perfil/admin-perfil.component';
import { AdminReportesComponent } from './admin/admin-reportes/admin-reportes.component';
import { AdminDatosComponent } from './admin/admin-datos/admin-datos.component';
import { AdminSistemaComponent } from './admin/admin-sistema/admin-sistema.component';
import { AdminSeguridadComponent } from './admin/admin-seguridad/admin-seguridad.component';
import { AdminPersonalizarComponent } from './admin/admin-personalizar/admin-personalizar.component';

// 🔷 CIAM
import { CiamDashboardComponent } from './ciam/ciam-dashboard/ciam-dashboard.component';
import { CiamPerfilComponent } from './ciam/ciam-perfil/ciam-perfil.component';
import { CiamRegistraradultoComponent } from './ciam/ciam-registraradulto/ciam-registraradulto.component';
import { CiamBusquedaComponent } from './ciam/ciam-busqueda/ciam-busqueda.component';
import { CiamSocialComponent } from './ciam/ciam-social/ciam-social.component';
import { CiamEvaluacionComponent } from './ciam/ciam-evaluacion/ciam-evaluacion.component';
import { CiamCasoSocialComponent } from './ciam/ciam-caso-social/ciam-caso-social.component';
import { CiamVisitasComponent } from './ciam/ciam-visitas/ciam-visitas.component';
import { CiamSaludComponent } from './ciam/ciam-salud/ciam-salud.component';
import { CiamPensionComponent } from './ciam/ciam-pension/ciam-pension.component';
import { CiamActividadesComponent } from './ciam/ciam-actividades/ciam-actividades.component';
import { CiamReportesComponent } from './ciam/ciam-reportes/ciam-reportes.component';

// 🏥 SALUD
import { SaludDashboardComponent } from './salud/salud-dashboard/salud-dashboard.component';
import { SaludPacientesComponent } from './salud/salud-pacientes/salud-pacientes.component';
import { SaludHistorialComponent } from './salud/salud-historial/salud-historial.component';
import { SaludVisitasComponent } from './salud/salud-visitas/salud-visitas.component';
import { SaludCampanasComponent } from './salud/salud-campanas/salud-campanas.component';
import { SaludAgendaComponent } from './salud/salud-agenda/salud-agenda.component';

// 💰 PENSIÓN 65
import { PensionDashboardComponent } from './pension/pension-dashboard/pension-dashboard.component';
import { PensionBeneficiariosComponent } from './pension/pension-beneficiarios/pension-beneficiarios.component';
import { PensionEvaluacioneconomicaComponent } from './pension/pension-evaluacioneconomica/pension-evaluacioneconomica.component';
import { PensionPagosComponent } from './pension/pension-pagos/pension-pagos.component';
import { PensionSaludComponent } from './pension/pension-salud/pension-salud.component';
import { PensionVisitasComponent } from './pension/pension-visitas/pension-visitas.component';
import { PensionReportesComponent } from './pension/pension-reportes/pension-reportes.component';

export const routes: Routes = [

  { path: '', component: InicioComponent },

  { path: 'consulta', component: ConsultaComponent },
  { path: 'accesos', component: AccesosComponent },

  { path: 'login-admin', component: LoginAdminComponent },
  { path: 'login-ciam', component: LoginCiamComponent },
  { path: 'login-salud', component: LoginSaludComponent },
  { path: 'login-pension', component: LoginPensionComponent },

  // 🔥 ADMIN
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/usuarios', component: AdminUsuariosComponent },
  { path: 'admin/perfil', component: AdminPerfilComponent },
  { path: 'admin/reportes', component: AdminReportesComponent },
  { path: 'admin/datos', component: AdminDatosComponent },
  { path: 'admin/sistema', component: AdminSistemaComponent },
  { path: 'admin/seguridad', component: AdminSeguridadComponent },
  { path: 'admin/personalizar', component: AdminPersonalizarComponent },

  // 🔷 CIAM
  { path: 'ciam', component: CiamDashboardComponent },
  { path: 'ciam/perfil', component: CiamPerfilComponent },
  { path: 'ciam/registrar-adulto', component: CiamRegistraradultoComponent },
  { path: 'ciam/busqueda', component: CiamBusquedaComponent },
  { path: 'ciam/social', component: CiamSocialComponent },
  { path: 'ciam/evaluacion', component: CiamEvaluacionComponent },
  { path: 'ciam/caso-social', component: CiamCasoSocialComponent },
  { path: 'ciam/visitas', component: CiamVisitasComponent },
  { path: 'ciam/salud', component: CiamSaludComponent },
  { path: 'ciam/pension', component: CiamPensionComponent },
  { path: 'ciam/actividades', component: CiamActividadesComponent },
  { path: 'ciam/reportes', component: CiamReportesComponent },

  // 🏥 SALUD
  { path: 'salud', component: SaludDashboardComponent },
  { path: 'salud/pacientes', component: SaludPacientesComponent },
  { path: 'salud/historial', component: SaludHistorialComponent },
  { path: 'salud/visitas', component: SaludVisitasComponent },
  { path: 'salud/campanas', component: SaludCampanasComponent },
  { path: 'salud/agenda', component: SaludAgendaComponent },

  // 💰 PENSIÓN 65
  { path: 'pension', component: PensionDashboardComponent },
  { path: 'pension/beneficiarios', component: PensionBeneficiariosComponent },
  { path: 'pension/evaluacion-economica', component: PensionEvaluacioneconomicaComponent },
  { path: 'pension/pagos', component: PensionPagosComponent },
  { path: 'pension/salud', component: PensionSaludComponent },
  { path: 'pension/visitas', component: PensionVisitasComponent },
  { path: 'pension/reportes', component: PensionReportesComponent },

  { path: '**', redirectTo: '' }
];