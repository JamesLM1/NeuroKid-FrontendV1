import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINRecursoEducativoDTO } from '../../../models/admin-recurso-educativo.dto';
import { AddEditRecursoComponent } from '../add-edit-recurso/add-edit-recurso';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

@Component({
  selector: 'app-admin-recurso-list',
  standalone: false,
  templateUrl: './admin-recurso-list.html',
  styleUrls: ['./admin-recurso-list.css']
})
export class AdminRecursoListComponent implements OnInit {

  recursos: ADMINRecursoEducativoDTO[] = [];
  recursosFiltrados: ADMINRecursoEducativoDTO[] = [];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    this.adminService.getAllRecursos().subscribe({
      next: (data: ADMINRecursoEducativoDTO[]) => {
        this.recursos = data;
        this.recursosFiltrados = data;
      },
      error: (err) => {
        console.error("Error al cargar recursos:", err);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    
    if (!filterValue) {
      this.recursosFiltrados = this.recursos;
      return;
    }

    // Normalizar el texto de búsqueda (Quitar tildes)
    const filterNormalized = filterValue.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Filtrar buscando en todas las propiedades del objeto
    this.recursosFiltrados = this.recursos.filter(recurso => {
      // 1. Concatenar todos los valores del objeto en un solo string largo
      const dataStr = JSON.stringify(recurso).toLowerCase();
      
      // 2. Normalizar el string de datos (Quitar tildes: á -> a, ñ -> n, etc.)
      const dataNormalized = dataStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // 3. Verificar si el texto buscado está dentro de los datos normalizados
      return dataNormalized.indexOf(filterNormalized) !== -1;
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditRecursoComponent, {
      width: '600px',
      data: { id: null } // Modo CREAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }

  openEditDialog(recurso: ADMINRecursoEducativoDTO): void {
    const dialogRef = this.dialog.open(AddEditRecursoComponent, {
      width: '600px',
      data: { id: recurso.recursoId } // Modo EDITAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }

  deleteRecurso(recurso: ADMINRecursoEducativoDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteRecurso(recurso.recursoId).subscribe({
          next: () => {
            this.snackBar.open('Recurso eliminado correctamente', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Error al eliminar';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }
}
