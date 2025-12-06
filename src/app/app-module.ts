import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Importante para Material
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

import { AppRoutingModule } from './app-routing-module';
import { AppComponent } from './app.component';
import { MaterialModule } from './modules/material/material-module'; // Importar Material
import { AuthInterceptor } from './security/auth.interceptor'; 
import { AuthGuard } from './security/auth.guard';

// Tus componentes
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { PublicHeaderComponent } from './components/public/layout/public-header/public-header.component';
import { PublicFooterComponent } from './components/public/layout/public-footer/public-footer.component';
import { HomeComponent } from './components/public/home/home.component';
import { PrivacidadComponent } from './components/public/legales/privacidad/privacidad.component';

// 1. Importar los nuevos componentes del Admin
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminPadreListComponent } from './components/admin/admin-padre-list/admin-padre-list';
import { AddEditPadreComponent } from './components/admin/add-edit-padre/add-edit-padre';
import { ConfirmationDeleteComponent } from './components/shared/confirmation-delete/confirmation-delete';

import { AdminPsicologoListComponent } from './components/admin/admin-psicologo-list/admin-psicologo-list';
import { AddEditPsicologoComponent } from './components/admin/add-edit-psicologo/add-edit-psicologo';
import { AdminAsignacionListComponent } from './components/admin/admin-asignacion-list/admin-asignacion-list';
import { AddEditAsignacionComponent } from './components/admin/add-edit-asignacion/add-edit-asignacion';
import { AdminCitaListComponent } from './components/admin/admin-cita-list/admin-cita-list';
import { AdminRecursoListComponent } from './components/admin/admin-recurso-list/admin-recurso-list';
import { AdminEvaluacionListComponent } from './components/admin/admin-evaluacion-list/admin-evaluacion-list';
import { AddEditRecursoComponent } from './components/admin/add-edit-recurso/add-edit-recurso';
import { PadreDashboardComponent } from './components/padre/padre-dashboard/padre-dashboard';
import { PadreMenorListComponent } from './components/padre/padre-menor-list/padre-menor-list';
import { AddEditMenorComponent } from './components/padre/add-edit-menor/add-edit-menor';
import { PadreCitaListComponent } from './components/padre/padre-cita-list/padre-cita-list';
import { AddCitaComponent } from './components/padre/add-cita/add-cita';
import { DetalleCitaComponent } from './components/padre/detalle-cita/detalle-cita';
import { PadreProgresoComponent } from './components/padre/padre-progreso/padre-progreso';
import { PadreRecursoListComponent } from './components/padre/padre-recurso-list/padre-recurso-list';
import { PadreEvaluacionComponent } from './components/padre/padre-evaluacion/padre-evaluacion';
import { PsicologoDashboardComponent } from './components/psicologo/psicologo-dashboard/psicologo-dashboard';
import { PsicologoDisponibilidadListComponent } from './components/psicologo/psicologo-disponibilidad-list/psicologo-disponibilidad-list';
import { AddEditDisponibilidadComponent } from './components/psicologo/add-edit-disponibilidad/add-edit-disponibilidad';
import { PsicologoAsignacionListComponent } from './components/psicologo/psicologo-asignacion-list/psicologo-asignacion-list';
import { PsicologoCitaListComponent } from './components/psicologo/psicologo-cita-list/psicologo-cita-list';
import { AtenderCitaComponent } from './components/psicologo/atender-cita/atender-cita';
import { PsicologoInformeListComponent } from './components/psicologo/psicologo-informe-list/psicologo-informe-list';
import { AddInformeComponent } from './components/psicologo/add-informe/add-informe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,    
    RegisterComponent, 
    PublicHeaderComponent,
    PublicFooterComponent,
    HomeComponent,
    PrivacidadComponent,
    AdminDashboardComponent,
    AdminPadreListComponent,
    AddEditPadreComponent,
    AdminPsicologoListComponent,
    AddEditPsicologoComponent,
    AdminAsignacionListComponent,
    AddEditAsignacionComponent,
    AdminCitaListComponent,
    AdminRecursoListComponent,
    AdminEvaluacionListComponent,
    AddEditRecursoComponent,
    PadreDashboardComponent,
    PadreMenorListComponent,
    AddEditMenorComponent,
    PadreCitaListComponent,
    AddCitaComponent,  
    PadreEvaluacionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule, // Necesario para Angular Material
    MaterialModule, 
    FormsModule,
    ConfirmationDeleteComponent,
    ReactiveFormsModule,
    PadreProgresoComponent,
    PadreRecursoListComponent,
    PsicologoDashboardComponent,
    PsicologoDisponibilidadListComponent,
    AddEditDisponibilidadComponent,
    PsicologoAsignacionListComponent,
    PsicologoCitaListComponent,
    AtenderCitaComponent,
    PsicologoInformeListComponent,
    AddInformeComponent,
    DetalleCitaComponent
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }, // Configuración global para DatePickers (formato DD/MM/YYYY)
    AuthGuard,
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }