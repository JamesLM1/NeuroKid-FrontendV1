import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';
import { ADMINCitaListDTO } from '../../../models/admin-cita-list.dto';
import { DetalleCitaDialogComponent } from '../detalle-cita-dialog/detalle-cita-dialog';
import { ConfirmationDeleteComponent } from '../../shared/confirmation-delete/confirmation-delete';

@Component({
  selector: 'app-admin-cita-list',
  standalone: false,
  templateUrl: './admin-cita-list.html',
  styleUrls: ['./admin-cita-list.css']
})
export class AdminCitaListComponent implements OnInit {

  displayedColumns: string[] = ['fecha', 'hora', 'psicologo', 'menor', 'padre', 'estado', 'actions'];
  dsCitas = new MatTableDataSource<ADMINCitaListDTO>();
  filtros = { texto: '', estado: 'Todos' };
  estadosDisponibles: string[] = ['Todos', 'Pendiente', 'Confirmada', 'Finalizada', 'Rechazada'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarLista();
  }

  CargarLista(): void {
    this.adminService.getAllCitas().subscribe({
      next: (data: ADMINCitaListDTO[]) => {
        this.dsCitas = new MatTableDataSource(data);
        // Configurar filtro personalizado (insensible a tildes y multi-columna)
        this.configurarSuperFiltro();
        // Inicializar el filtro con los valores por defecto
        this.actualizarFiltro();
      },
      error: (err) => {
        console.error("Error al cargar citas:", err);
        this.snackBar.open('Error al cargar las citas', 'OK', { duration: 3000 });
      }
    });
  }

  configurarSuperFiltro(): void {
    this.dsCitas.filterPredicate = (data: ADMINCitaListDTO, filter: string): boolean => {
      try {
        // Parsear el filtro que ahora es un JSON string con {texto, estado}
        const filtrosObj = JSON.parse(filter);
        
        // 1. FILTRO DE TEXTO: Solo aplicar si hay texto de búsqueda
        let matchTexto: boolean = true;
        const textoFiltro = (filtrosObj.texto || '').trim();
        if (textoFiltro.length > 0) {
          const dataStr = JSON.stringify(data).toLowerCase();
          const dataNormalized = dataStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const filterNormalized = textoFiltro.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          matchTexto = dataNormalized.indexOf(filterNormalized) !== -1;
        }
        
        // 2. FILTRO DE ESTADO: Verificar si coincide con el estado seleccionado (case-insensitive)
        let matchEstado: boolean;
        const estadoFiltro = filtrosObj.estado || 'Todos';
        if (estadoFiltro === 'Todos') {
          matchEstado = true;
        } else {
          matchEstado = Boolean(data.estado && data.estado.toLowerCase() === estadoFiltro.toLowerCase());
        }
        
        // 3. COMBINAR: Ambos filtros deben cumplirse
        return matchTexto && matchEstado;
      } catch (e) {
        // Si el parse falla (por compatibilidad con filtros antiguos), aplicar solo filtro de texto
        const filterTrimmed = filter.trim();
        if (filterTrimmed.length > 0) {
          const dataStr = JSON.stringify(data).toLowerCase();
          const dataNormalized = dataStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const filterNormalized = filterTrimmed.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return dataNormalized.indexOf(filterNormalized) !== -1;
        }
        return true;
      }
    };
  }

  // Actualizar filtro combinado (texto + estado)
  actualizarFiltro(): void {
    const filtroCombinado = JSON.stringify(this.filtros);
    this.dsCitas.filter = filtroCombinado;
  }

  // Aplicar filtro de texto desde el input
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtros.texto = filterValue;
    this.actualizarFiltro();
  }

  // Formatear hora para mostrar (HH:mm)
  formatHora(hora: string): string {
    if (!hora) return '-';
    // Si viene en formato HH:mm:ss, tomar solo HH:mm
    return hora.substring(0, 5);
  }

  // Formatear rango de horas
  formatRangoHoras(horaInicio: string, horaFin: string): string {
    const inicio = this.formatHora(horaInicio);
    const fin = this.formatHora(horaFin);
    return `${inicio} - ${fin}`;
  }

  // Ver detalle de cita
  verDetalle(cita: ADMINCitaListDTO): void {
    this.dialog.open(DetalleCitaDialogComponent, {
      width: '600px',
      data: cita
    });
  }

  // Cancelar cita (Admin - Emergencias)
  cancelarCita(cita: ADMINCitaListDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDeleteComponent, {
      data: {
        title: 'Cancelar Cita',
        message: '¿Está seguro que desea cancelar esta cita de emergencia? Esta acción no se puede deshacer.',
        confirmText: 'Sí, cancelar',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.cancelarCita(cita.citaId!).subscribe({
          next: () => {
            this.snackBar.open('Cita cancelada correctamente', 'OK', { duration: 3000 });
            this.CargarLista();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Error al cancelar la cita';
            this.snackBar.open(`ERROR: ${errorMsg}`, 'OK', { duration: 5000 });
          }
        });
      }
    });
  }

  // Obtener clase CSS para el badge de estado
  getEstadoClass(estado: string): string {
    switch (estado?.toLowerCase()) {
      case 'programada':
      case 'confirmada':
        return 'nk-badge--success';
      case 'cancelada':
        return 'nk-badge--danger';
      case 'completada':
        return 'nk-badge--info';
      case 'en curso':
        return 'nk-badge--warn';
      default:
        return 'nk-badge';
    }
  }
}

