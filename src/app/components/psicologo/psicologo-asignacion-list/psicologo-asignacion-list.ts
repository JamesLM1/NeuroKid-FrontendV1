import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PsicologoService } from '../../../services/psicologo.service';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

// Módulos para la plantilla
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-psicologo-asignacion-list',
  standalone: true, // <-- CORRECCIÓN 1: Cambiado a true
  imports: [ // <-- CORRECCIÓN 2: Añadidos imports
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './psicologo-asignacion-list.html',
  styleUrls: ['./psicologo-asignacion-list.css']
})
export class PsicologoAsignacionListComponent implements OnInit {

  // Columnas base (sin acciones)
  private baseColumns: string[] = ['padre', 'menor', 'fechaAsignacion', 'estado'];
  displayedColumns: string[] = [...this.baseColumns, 'actions'];
  dsAsignaciones = new MatTableDataSource<ADMINAsignacionDTO>();

  // Variables para el filtro de historial
  mostrarHistorial: boolean = false;
  asignacionesTodas: ADMINAsignacionDTO[] = [];

  constructor(
    private psicologoService: PsicologoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    // El backend ya enriquece los DTOs con nombres completos, usamos directamente los datos
    this.psicologoService.getMisAsignaciones().subscribe({
      next: (asignaciones: ADMINAsignacionDTO[]) => {
        // Guardar todas las asignaciones para el filtro de historial
        this.asignacionesTodas = asignaciones;
        
        // Aplicar filtro según mostrarHistorial
        this.filtrarPorEstado();
      },
      error: (err) => {
        console.error("Error al cargar asignaciones:", err);
        this.asignacionesTodas = [];
        this.dsAsignaciones = new MatTableDataSource<ADMINAsignacionDTO>([]);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsAsignaciones.filter = filterValue.trim().toLowerCase();
  }

  filtrarPorEstado(): void {
    let asignacionesFiltradas: ADMINAsignacionDTO[];

    if (this.mostrarHistorial) {
      // Mostrar solo asignaciones finalizadas (altas médicas)
      asignacionesFiltradas = this.asignacionesTodas.filter(a => a.estado === 'Finalizada');
      // Ocultar columna de acciones en el historial (registros no editables)
      this.displayedColumns = [...this.baseColumns];
    } else {
      // Mostrar solo asignaciones activas y pausadas (por defecto)
      asignacionesFiltradas = this.asignacionesTodas.filter(a => a.estado === 'Activa' || a.estado === 'Pausada');
      // Mostrar columna de acciones para asignaciones activas/pausadas
      this.displayedColumns = [...this.baseColumns, 'actions'];
    }

    // Si no hay resultados con el filtro, mostrar todas para evitar tabla vacía
    if (asignacionesFiltradas.length === 0 && this.asignacionesTodas.length > 0) {
      asignacionesFiltradas = this.asignacionesTodas;
    }

    this.dsAsignaciones.data = asignacionesFiltradas;
  }

  toggleHistorial(event: any): void {
    this.mostrarHistorial = event.checked;
    this.filtrarPorEstado();
    // Limpiar el filtro de búsqueda al cambiar de vista
    this.dsAsignaciones.filter = '';
  }

  darDeAlta(asignacion: ADMINAsignacionDTO): void {
    const nombrePaciente = asignacion.nombreMenor || `ID ${asignacion.menorId}`;
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      data: {
        title: 'Dar de Alta Médica',
        message: `¿Confirma que desea dar el Alta Médica al paciente ${nombrePaciente}? El tratamiento se marcará como finalizado.`,
        confirmText: 'Sí, dar de alta',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.psicologoService.darDeAlta(asignacion.asignacionId).subscribe({
          next: () => {
            this.snackBar.open('Alta Médica registrada correctamente. El tratamiento ha sido finalizado.', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Error al dar de alta';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }
}