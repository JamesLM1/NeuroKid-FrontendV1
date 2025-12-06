import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINPsicologoDTO } from '../../../models/admin-psicologo.dto';
import { AddEditPsicologoComponent } from '../add-edit-psicologo/add-edit-psicologo';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

@Component({
  selector: 'app-admin-psicologo-list',
  standalone: false,
  templateUrl: './admin-psicologo-list.html',
  styleUrls: ['./admin-psicologo-list.css']
})
export class AdminPsicologoListComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'tipoDocumento', 'dni', 'especialidad', 'email', 'telefono', 'claveVisible', 'estado', 'actions'];
  dsPsicologos = new MatTableDataSource<ADMINPsicologoDTO>();

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    this.adminService.getAllPsicologos().subscribe({
      next: (data: ADMINPsicologoDTO[]) => {
        this.dsPsicologos = new MatTableDataSource(data);
        // Configurar filtro personalizado (insensible a tildes y multi-columna)
        this.configurarSuperFiltro();
      },
      error: (err) => {
        console.error("Error al cargar psicólogos:", err);
      }
    });
  }

  configurarSuperFiltro(): void {
    this.dsPsicologos.filterPredicate = (data: ADMINPsicologoDTO, filter: string) => {
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
    this.dsPsicologos.filter = filterValue;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditPsicologoComponent, {
      width: '500px',
      data: { id: null } // ID null indica modo CREAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista(); // Recargar la lista si se creó un nuevo psicólogo
      }
    });
  }

  openEditDialog(psicologo: ADMINPsicologoDTO): void {
    const dialogRef = this.dialog.open(AddEditPsicologoComponent, {
      width: '500px',
      data: { id: psicologo.psicologoId } // Enviamos el ID para modo EDITAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista(); // Recargar la lista si se editó
      }
    });
  }

  toggleEstadoPsicologo(psicologo: ADMINPsicologoDTO): void {
    const isActive = psicologo.usuarioActivo !== false;
    const nombreCompleto = `${psicologo.nombre} ${psicologo.apellido}`;
    const action = isActive ? 'desactivar' : 'reactivar';
    
    const title = isActive ? 'Desactivar Usuario' : 'Reactivar Usuario';
    const message = isActive 
      ? `¿Está seguro que desea DESACTIVAR el acceso de ${nombreCompleto}? No podrá iniciar sesión hasta que sea reactivado.`
      : `¿Está seguro que desea REACTIVAR el acceso de ${nombreCompleto}? Podrá iniciar sesión nuevamente.`;

    // Crear diálogo de confirmación personalizado
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      data: { 
        title: title,
        message: message,
        confirmText: isActive ? 'Desactivar' : 'Reactivar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // El usuario confirmó la acción - usar el endpoint DELETE que ahora hace toggle
        this.adminService.deletePsicologo(psicologo.psicologoId).subscribe({
          next: (psicologoActualizado: ADMINPsicologoDTO) => {
            // Actualizar el elemento localmente sin recargar toda la tabla
            const index = this.dsPsicologos.data.findIndex(p => p.psicologoId === psicologo.psicologoId);
            if (index !== -1) {
              this.dsPsicologos.data[index] = psicologoActualizado;
              this.dsPsicologos._updateChangeSubscription(); // Notificar cambios a la tabla
            }
            
            const successMsg = psicologoActualizado.usuarioActivo 
              ? 'Usuario reactivado correctamente. Ya puede iniciar sesión.'
              : 'Usuario desactivado correctamente. No podrá iniciar sesión.';
            this.snackBar.open(successMsg, 'OK', { duration: 4000 });
          },
          error: (err) => {
            const errorMsg = err.error?.message || `Error al ${action} el usuario`;
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }

  copiarClave(clave: string): void {
    if (clave) {
      navigator.clipboard.writeText(clave).then(() => {
        this.snackBar.open('Contraseña copiada al portapapeles', 'OK', { duration: 2000 });
      }).catch(err => {
        console.error('Error al copiar:', err);
        this.snackBar.open('Error al copiar la contraseña', 'OK', { duration: 3000 });
      });
    }
  }
}
