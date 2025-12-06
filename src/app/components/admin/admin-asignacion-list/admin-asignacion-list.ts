import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';
import { ADMINPadreDTO } from '../../../models/admin-padre.dto';
import { ADMINPsicologoDTO } from '../../../models/admin-psicologo.dto';
import { PADREMenorDTO } from '../../../models/padre-menor.dto';
import { AddEditAsignacionComponent } from '../add-edit-asignacion/add-edit-asignacion';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-asignacion-list',
  standalone: false,
  templateUrl: './admin-asignacion-list.html',
  styleUrls: ['./admin-asignacion-list.css']
})
export class AdminAsignacionListComponent implements OnInit {

  // Columnas base (sin acciones)
  private baseColumns: string[] = ['padre', 'menor', 'psicologo', 'fechaAsignacion', 'estado'];
  displayedColumns: string[] = [...this.baseColumns, 'actions'];
  dsAsignaciones = new MatTableDataSource<ADMINAsignacionDTO>();

  // Variables para el filtro de historial
  mostrarHistorial: boolean = false;
  asignacionesTodas: ADMINAsignacionDTO[] = [];

  // Mapas para almacenar nombres por ID
  padreNombres: Map<number, string> = new Map();
  menorNombres: Map<number, string> = new Map();
  psicologoNombres: Map<number, string> = new Map();

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    // Cargar asignaciones y nombres en paralelo
    forkJoin({
      asignaciones: this.adminService.getAllAsignaciones(),
      padres: this.adminService.getAllPadres(),
      psicologos: this.adminService.getAllPsicologos()
    }).subscribe({
      next: (data) => {
        // Poblar mapas de nombres
        this.padreNombres.clear();
        this.psicologoNombres.clear();
        
        data.padres.forEach(padre => {
          if (padre.padreId) {
            this.padreNombres.set(padre.padreId, `${padre.nombre} ${padre.apellido}`);
          }
        });
        
        data.psicologos.forEach(psicologo => {
          if (psicologo.psicologoId) {
            this.psicologoNombres.set(psicologo.psicologoId, `${psicologo.nombre} ${psicologo.apellido}`);
          }
        });

        // Guardar todas las asignaciones para el filtro de historial
        this.asignacionesTodas = data.asignaciones;

        // Cargar menores para cada asignación
        this.cargarMenoresPorAsignaciones(data.asignaciones);
      },
      error: (err) => {
        console.error("Error al cargar datos:", err);
        this.snackBar.open('Error al cargar los datos', 'OK', { duration: 3000 });
      }
    });
  }

  cargarMenoresPorAsignaciones(asignaciones: ADMINAsignacionDTO[]): void {
    // Obtener IDs únicos de padres para cargar sus menores
    const padreIds = [...new Set(asignaciones.map(a => a.padreId))];
    
    const menorRequests = padreIds.map(padreId => 
      this.adminService.getMenoresByPadreId(padreId)
    );

    if (menorRequests.length > 0) {
      forkJoin(menorRequests).subscribe({
        next: (menoresArrays) => {
          // Poblar mapa de menores
          this.menorNombres.clear();
          menoresArrays.forEach(menores => {
            menores.forEach(menor => {
              if (menor.menorId) {
                this.menorNombres.set(menor.menorId, `${menor.nombre} ${menor.apellido}`);
              }
            });
          });

          // Finalmente asignar las asignaciones al DataSource
          // Aplicar filtro según mostrarHistorial
          this.filtrarPorEstado();
        },
        error: (err) => {
          console.error("Error al cargar menores:", err);
          // Aún así mostrar las asignaciones aunque no tengamos nombres de menores
          // Aplicar filtro según mostrarHistorial
          this.filtrarPorEstado();
        }
      });
    } else {
      // Aplicar filtro según mostrarHistorial
      this.filtrarPorEstado();
    }
  }

  configurarSuperFiltro(): void {
    this.dsAsignaciones.filterPredicate = (data: ADMINAsignacionDTO, filter: string) => {
      // 1. Concatenar todos los valores del objeto en un solo string largo
      let dataStr = JSON.stringify(data).toLowerCase();
      
      // 2. Agregar nombres de las entidades relacionadas desde los mapas
      const nombrePadre = this.getNombrePadre(data.padreId).toLowerCase();
      const nombreMenor = this.getNombreMenor(data.menorId).toLowerCase();
      const nombrePsicologo = this.getNombrePsicologo(data.psicologoId).toLowerCase();
      dataStr += ` ${nombrePadre} ${nombreMenor} ${nombrePsicologo}`;
      
      // 3. Normalizar el string de datos (Quitar tildes: á -> a, ñ -> n, etc.)
      const dataNormalized = dataStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // 4. Normalizar el texto de búsqueda del usuario de la misma manera
      const filterNormalized = filter.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // 5. Verificar si el texto buscado está dentro de los datos normalizados
      return dataNormalized.indexOf(filterNormalized) !== -1;
    };
  }

  // Métodos para obtener nombres desde los mapas
  getNombrePadre(padreId: number): string {
    return this.padreNombres.get(padreId) || `ID: ${padreId}`;
  }

  getNombreMenor(menorId: number): string {
    return this.menorNombres.get(menorId) || `ID: ${menorId}`;
  }

  getNombrePsicologo(psicologoId: number): string {
    return this.psicologoNombres.get(psicologoId) || `ID: ${psicologoId}`;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // El filterPredicate personalizado ya maneja la normalización y toLowerCase
    this.dsAsignaciones.filter = filterValue;
  }

  filtrarPorEstado(): void {
    let asignacionesFiltradas: ADMINAsignacionDTO[];

    if (this.mostrarHistorial) {
      // Mostrar asignaciones finalizadas y canceladas (historial)
      asignacionesFiltradas = this.asignacionesTodas.filter(a => a.estado === 'Finalizada' || a.estado === 'Cancelada');
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
    // Configurar filtro personalizado (insensible a tildes y multi-columna)
    this.configurarSuperFiltro();
  }

  toggleHistorial(event: any): void {
    this.mostrarHistorial = event.checked;
    this.filtrarPorEstado();
    // Limpiar el filtro de búsqueda al cambiar de vista
    this.dsAsignaciones.filter = '';
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditAsignacionComponent, {
      width: '500px',
      data: { id: null } // Modo CREAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }

  openEditDialog(asignacion: ADMINAsignacionDTO): void {
    const dialogRef = this.dialog.open(AddEditAsignacionComponent, {
      width: '500px',
      data: { id: asignacion.asignacionId } // Modo EDITAR
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarLista();
      }
    });
  }

  finalizarAsignacion(asignacion: ADMINAsignacionDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      data: {
        title: 'Finalizar Asignación',
        message: '¿Está seguro que desea finalizar esta asignación? Pasará al historial y no podrá ser reactivada.',
        confirmText: 'Sí, finalizar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.finalizarAsignacion(asignacion.asignacionId).subscribe({
          next: () => {
            this.snackBar.open('Asignación finalizada correctamente. Se ha movido al historial.', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Error al finalizar';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }
}
