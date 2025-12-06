import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/public/home/home.component';
import { PrivacidadComponent } from './components/public/legales/privacidad/privacidad.component';

// 1. Importar el Guard y el Dashboard
import { AuthGuard } from './security/auth.guard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard';
import { PadreDashboardComponent } from './components/padre/padre-dashboard/padre-dashboard';

// 1. Dashboard Psicologo
import { PsicologoDashboardComponent } from './components/psicologo/psicologo-dashboard/psicologo-dashboard';

const routes: Routes = [
 // Rutas Públicas
 { path: '', component: HomeComponent }, // La ruta raíz es el Landing Page
 { path: 'login', component: LoginComponent },
 { path: 'register', component: RegisterComponent },
 { path: 'privacidad', component: PrivacidadComponent },
 
{ 
   path: 'admin', 
   component: AdminDashboardComponent, 
   canActivate: [AuthGuard], 
   data: { roles: ['ROLE_ADMIN'] } // Solo ROLE_ADMIN puede entrar
},

{ 
   path: 'padre', 
   component: PadreDashboardComponent, 
   canActivate: [AuthGuard], 
   data: { roles: ['ROLE_PADRE'] } // Solo ROLE_PADRE puede entrar
},

{ 
   path: 'psicologo', 
   component: PsicologoDashboardComponent, 
   canActivate: [AuthGuard], 
   data: { roles: ['ROLE_PSICOLOGO'] } // Solo ROLE_PSICOLOGO puede entrar
},

 { path: '**', redirectTo: '', pathMatch: 'full' } // Cualquier otra ruta, al Home
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})
export class AppRoutingModule { }