import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

import { PsicologoDisponibilidadListComponent } from '../psicologo-disponibilidad-list/psicologo-disponibilidad-list';
import { PsicologoAsignacionListComponent } from '../psicologo-asignacion-list/psicologo-asignacion-list';
import { PsicologoCitaListComponent } from '../psicologo-cita-list/psicologo-cita-list';
import { PsicologoInformeListComponent } from '../psicologo-informe-list/psicologo-informe-list';
import { PsicologoEvaluacionListComponent } from '../psicologo-evaluacion-list/psicologo-evaluacion-list';

import { PsicologoService } from '../../../services/psicologo.service';
import { AuthService } from '../../../services/auth.service';
import { PSICOLOGOCitaResponseDTO } from '../../../models/psicologo-cita-response.dto';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';
import { AtenderCitaComponent } from '../atender-cita/atender-cita';
import { DetalleCitaComponent } from '../../padre/detalle-cita/detalle-cita';

@Component({
  selector: 'app-psicologo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatListModule,
    MatDialogModule,
    MatTooltipModule,
    PsicologoDisponibilidadListComponent,
    PsicologoAsignacionListComponent,
    PsicologoCitaListComponent,
    PsicologoInformeListComponent,
    PsicologoEvaluacionListComponent
  ],
  templateUrl: './psicologo-dashboard.html',
  styleUrls: ['./psicologo-dashboard.css']
})
export class PsicologoDashboardComponent implements OnInit {

  activeTab: string = 'dashboard';

  // Datos del dashboard
  citasHoy: PSICOLOGOCitaResponseDTO[] = [];
  pacientesAsignados: any[] = [];
  promedioCalificacion: number = 0;
  totalEvaluaciones: number = 0;

  // Columnas para tabla de citas de hoy
  displayedColumnsCitas: string[] = ['hora', 'paciente', 'motivo', 'estado', 'accion'];

  constructor(
    private psicologoService: PsicologoService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  cargarDatosDashboard(): void {
    const psicologoId = this.authService.getUserId();

    if (!psicologoId) {
      console.error('No se pudo obtener el ID del psicólogo');
      return;
    }

    // Usar el nuevo endpoint de dashboard que agrupa todas las métricas
    this.psicologoService.getDashboardMetrics().subscribe({
      next: (dashboard) => {
        // Asignar datos del dashboard
        this.citasHoy = dashboard.listaCitasHoy || [];
        this.promedioCalificacion = dashboard.calificacionPromedio || 0;
        this.totalEvaluaciones = dashboard.totalEvaluaciones || 0;

        // Cargar pacientes asignados usando el endpoint autorizado
        this.psicologoService.getMisAsignaciones().subscribe({
          next: (asignaciones) => {
            // Filtrar solo asignaciones activas
            const asignacionesActivas = asignaciones.filter(a => a.estado === 'Activa');
            this.cargarNombresMenores(asignacionesActivas);
          },
          error: (err) => {
            console.error('Error al cargar asignaciones:', err);
            this.pacientesAsignados = [];
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.snackBar.open('Error al cargar los datos del dashboard', 'OK', { duration: 3000 });

        // Fallback: intentar cargar datos de forma individual
        this.cargarDatosDashboardFallback();
      }
    });
  }

  /**
   * Método de respaldo si el endpoint de dashboard falla
   */
  private cargarDatosDashboardFallback(): void {
    const psicologoId = this.authService.getUserId();

    forkJoin({
      proximasCitas: this.psicologoService.getMisProximasCitas(),
      asignaciones: this.psicologoService.getMisAsignaciones()
    }).subscribe({
      next: (data) => {
        // Filtrar citas de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        this.citasHoy = data.proximasCitas.filter(cita => {
          const fechaCita = new Date(cita.fechaHoraCita);
          fechaCita.setHours(0, 0, 0, 0);
          return fechaCita.getTime() === hoy.getTime();
        });

        // Filtrar pacientes asignados (asignaciones activas)
        const asignacionesActivas = data.asignaciones.filter(a => a.estado === 'Activa');
        this.cargarNombresMenores(asignacionesActivas);
      },
      error: (err) => {
        console.error('Error en fallback:', err);
      }
    });
  }

  cargarNombresMenores(asignaciones: ADMINAsignacionDTO[]): void {
    // Mapear asignaciones directamente a pacientes asignados
    // El backend debería incluir nombres en el DTO, pero por ahora usamos los IDs
    this.pacientesAsignados = asignaciones.map(asignacion => ({
      asignacionId: asignacion.asignacionId,
      nombreMenor: asignacion.nombreMenor || `ID: ${asignacion.menorId}`,
      nombrePadre: asignacion.nombrePadre || `ID: ${asignacion.padreId}`,
      fechaAsignacion: asignacion.fechaAsignacion,
      estado: asignacion.estado
    }));
  }

  // Generar array para mostrar estrellas
  getStarsArray(puntaje: number): number[] {
    return Array(Math.round(puntaje)).fill(0).map((_, i) => i);
  }

  // Atender cita
  atenderCita(cita: PSICOLOGOCitaResponseDTO): void {
    const dialogRef = this.dialog.open(AtenderCitaComponent, {
      width: '600px',
      data: { cita: cita }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarDatosDashboard();
      }
    });
  }

  // Ver detalle de cita
  verDetalleCita(cita: PSICOLOGOCitaResponseDTO): void {
    this.dialog.open(DetalleCitaComponent, {
      width: '600px',
      data: cita
    });
  }

  // Formatear hora
  formatHora(fechaHora: string): string {
    if (!fechaHora) return '-';
    const date = new Date(fechaHora);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
