import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINEvaluacionListDTO } from '../../../models/admin-evaluacion-list.dto';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';
import { DetalleEvaluacionDialogComponent } from '../../shared/detalle-evaluacion-dialog/detalle-evaluacion-dialog';

@Component({
  selector: 'app-admin-evaluacion-list',
  standalone: false,
  templateUrl: './admin-evaluacion-list.html',
  styleUrls: ['./admin-evaluacion-list.css']
})
export class AdminEvaluacionListComponent implements OnInit {

  displayedColumns: string[] = ['fecha', 'psicologo', 'padre', 'puntaje', 'comentario', 'acciones'];
  dsEvaluaciones = new MatTableDataSource<ADMINEvaluacionListDTO>();

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    this.adminService.getAllEvaluaciones().subscribe({
      next: (data: ADMINEvaluacionListDTO[]) => {
        this.dsEvaluaciones = new MatTableDataSource(data);
        // Configurar filtro personalizado (insensible a tildes y multi-columna)
        this.configurarSuperFiltro();
      },
      error: (err) => {
        console.error("Error al cargar evaluaciones:", err);
        this.snackBar.open('Error al cargar las evaluaciones', 'OK', { duration: 3000 });
      }
    });
  }

  configurarSuperFiltro(): void {
    this.dsEvaluaciones.filterPredicate = (data: ADMINEvaluacionListDTO, filter: string) => {
      // 1. Concatenar todos los valores del objeto en un solo string largo
      const dataStr = JSON.stringify(data).toLowerCase();

      // 2. Normalizar el string de datos (Quitar tildes: á -> a, ñ -> n, etc.)
      const dataNormalized = dataStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 3. Normalizar el texto de búsqueda del usuario de la misma manera
      const filterNormalized = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 4. Verificar si el texto buscado está dentro de los datos normalizados
      return dataNormalized.indexOf(filterNormalized) !== -1;
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // El filterPredicate personalizado ya maneja la normalización y toLowerCase
    this.dsEvaluaciones.filter = filterValue;
  }

  // Generar array para mostrar estrellas
  getStarsArray(puntaje: number): number[] {
    return Array(puntaje).fill(0).map((_, i) => i);
  }

  // Eliminar evaluación (moderación)
  eliminarEvaluacion(evaluacion: ADMINEvaluacionListDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      data: {
        title: 'Eliminar Evaluación',
        message: `¿Está seguro que desea eliminar esta evaluación de ${evaluacion.nombrePadre} sobre ${evaluacion.nombrePsicologo}? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteEvaluacion(evaluacion.evaluacionId).subscribe({
          next: () => {
            this.snackBar.open('Evaluación eliminada correctamente', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Error al eliminar la evaluación';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }

  // Ver detalle de evaluación
  verDetalle(evaluacion: ADMINEvaluacionListDTO): void {
    this.dialog.open(DetalleEvaluacionDialogComponent, {
      width: '500px',
      data: {
        psicologo: evaluacion.nombrePsicologo,
        padre: evaluacion.nombrePadre,
        puntaje: evaluacion.puntaje,
        comentario: evaluacion.comentario,
        fecha: evaluacion.fechaEvaluacion
      }
    });
  }
}
