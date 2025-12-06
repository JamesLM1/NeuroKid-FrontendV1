import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // <-- Importar MatTableModule
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <-- Importar MatDialogModule
import { MatSnackBar } from '@angular/material/snack-bar';
import { PsicologoService } from '../../../services/psicologo.service';
import { PSICOLOGODisponibilidadDTO } from '../../../models/psicologo-disponibilidad.dto';
import { AddEditDisponibilidadComponent } from '../add-edit-disponibilidad/add-edit-disponibilidad';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

// Módulos para la plantilla
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-psicologo-disponibilidad-list',
  standalone: true, // <-- CORRECCIÓN 1: Cambiado a true
  imports: [ // <-- CORRECCIÓN 2: Añadidos imports
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    // Los componentes de diálogo (AddEdit, Confirmation) 
    // se importan si son standalone y se usan en el .ts
    // Asumiendo que ya son standalone:
  ],
  templateUrl: './psicologo-disponibilidad-list.html',
  styleUrls: ['./psicologo-disponibilidad-list.css']
})
export class PsicologoDisponibilidadListComponent implements OnInit {

  displayedColumns: string[] = ['diaSemana', 'horaInicio', 'horaFin', 'actions'];
  dsDisponibilidad = new MatTableDataSource<PSICOLOGODisponibilidadDTO>();

  constructor(
    private psicologoService: PsicologoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    this.psicologoService.getMiDisponibilidad().subscribe({
      next: (data: PSICOLOGODisponibilidadDTO[]) => {
        this.dsDisponibilidad = new MatTableDataSource(data);
      },
      error: (err) => {
        console.error("Error al cargar disponibilidad:", err);
        this.snackBar.open(`Error al cargar disponibilidad: ${err.error?.message || 'Error'}`, 'OK');
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditDisponibilidadComponent, {
      width: '500px',
      data: { id: null } // Modo CREAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }
  
  openEditDialog(disponibilidad: PSICOLOGODisponibilidadDTO): void {
    const dialogRef = this.dialog.open(AddEditDisponibilidadComponent, {
      width: '500px',
      data: { data: disponibilidad } // Enviamos el objeto para precargar
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }

  deleteDisponibilidad(disponibilidad: PSICOLOGODisponibilidadDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      // Pasamos los datos que el diálogo espera (si los espera)
      data: { 
        title: 'Confirmar Eliminación', 
        message: `¿Está seguro de eliminar la franja horaria ${disponibilidad.diaSemana} (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.psicologoService.deleteDisponibilidad(disponibilidad.disponibilidadId!).subscribe({
          next: () => {
            this.snackBar.open('Franja horaria eliminada', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al eliminar'}`, 'OK')
        });
      }
    });
  }
}