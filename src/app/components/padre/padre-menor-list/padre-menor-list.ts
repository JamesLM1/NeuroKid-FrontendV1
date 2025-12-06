import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';
import { AddEditMenorComponent } from '../add-edit-menor/add-edit-menor';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

@Component({
  selector: 'app-padre-menor-list',
  standalone: false,
  templateUrl: './padre-menor-list.html',
  styleUrls: ['./padre-menor-list.css']
})
export class PadreMenorListComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'fechaNacimiento', 'grado', 'motivo', 'actions'];
  dsMenores = new MatTableDataSource<PADREMenorDTO>();

  constructor(
    private padreService: PadreService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    console.log('🔄 Recargando lista de menores...');
    // getMisMenores() ya sabe qué padre está logueado gracias al AuthService
    this.padreService.getMisMenores().subscribe({
      next: (data: PADREMenorDTO[]) => {
        console.log('✅ Menores cargados:', data.length);
        this.dsMenores = new MatTableDataSource(data);
      },
      error: (err) => {
        console.error("❌ Error al cargar menores:", err);
        this.snackBar.open(`Error al cargar menores: ${err.error?.message || 'Error de servidor'}`, 'OK', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dsMenores.filter = filterValue.trim().toLowerCase();

    // Aplica filtro personalizado para ignorar tildes
    this.dsMenores.filterPredicate = (data: PADREMenorDTO, filter: string) => {
      const searchText = this.normalizeText(filter);
      const nombreCompleto = this.normalizeText(`${data.nombre} ${data.apellido}`);
      return nombreCompleto.includes(searchText);
    };
  }

  // Normaliza texto removiendo tildes para búsquedas más flexibles
  private normalizeText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditMenorComponent, {
      width: '500px',
      data: { id: null } // Modo CREAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Dialog cerrado - Recargando lista después de agregar menor');
        this.CargarLista();
      }
    });
  }

  openEditDialog(menor: PADREMenorDTO): void {
    const dialogRef = this.dialog.open(AddEditMenorComponent, {
      width: '500px',
      data: { id: menor.menorId } // Modo EDITAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Dialog cerrado - Recargando lista después de editar menor');
        this.CargarLista();
      }
    });
  }

  deleteMenor(menor: PADREMenorDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('🗑️ Eliminando menor:', menor.nombre, menor.apellido);
        this.padreService.deleteMenor(menor.menorId!).subscribe({
          next: () => {
            console.log('✅ Menor eliminado exitosamente');
            this.snackBar.open('Menor eliminado correctamente', 'OK', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.CargarLista();
          },
          error: (err) => {
            console.error('❌ Error al eliminar menor:', err);
            const errorMsg = err.error?.message || 'Error al eliminar';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}
