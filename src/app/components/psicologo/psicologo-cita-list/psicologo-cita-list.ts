import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table'; // <-- Importar MatTableModule
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <-- Importar MatDialogModule
import { MatSnackBar } from '@angular/material/snack-bar';
import { PsicologoService } from '../../../services/psicologo.service';
import { PSICOLOGOCitaResponseDTO } from '../../../models/psicologo-cita-response.dto';
import { AtenderCitaComponent } from '../atender-cita/atender-cita';
import { DetalleCitaComponent } from '../../padre/detalle-cita/detalle-cita'; // Reutilizamos el de Padre

// Módulos para la plantilla
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs'; // <-- Probablemente usas tabs (Próximas/Historial)
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-psicologo-cita-list',
  standalone: true, // <-- CORRECCIÓN 1: Cambiado a true
  imports: [ // <-- CORRECCIÓN 2: Añadidos imports
    CommonModule,
    MatTableModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    // Asumiendo que estos diálogos también son standalone:
  ],
  templateUrl: './psicologo-cita-list.html',
  styleUrls: ['./psicologo-cita-list.css']
})
export class PsicologoCitaListComponent implements OnInit {

  displayedColumns: string[] = ['fecha', 'hora', 'menor', 'padre', 'motivo', 'estado', 'actions'];
  dsProximas = new MatTableDataSource<PSICOLOGOCitaResponseDTO>();
  dsHistorial = new MatTableDataSource<PSICOLOGOCitaResponseDTO>();

  constructor(
    private psicologoService: PsicologoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarListas();
  }

  CargarListas(): void {
    // Cargar próximas citas
    this.psicologoService.getMisProximasCitas().subscribe({
      next: (data) => this.dsProximas = new MatTableDataSource(data),
      error: (err) => console.error("Error al cargar próximas citas:", err)
    });

    // Cargar historial de citas
    this.psicologoService.getMiHistorialCitas().subscribe({
      next: (data) => this.dsHistorial = new MatTableDataSource(data),
      error: (err) => console.error("Error al cargar historial de citas:", err)
    });
  }

  // Método para aceptar una cita pendiente
  aceptarCita(cita: PSICOLOGOCitaResponseDTO): void {
    this.psicologoService.cambiarEstadoCita(cita.citaId, 'Confirmada').subscribe({
      next: () => {
        this.snackBar.open('✅ Cita confirmada exitosamente', 'OK', { duration: 3000 });
        this.CargarListas();
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al confirmar la cita';
        this.snackBar.open(`❌ ERROR: ${mensaje}`, 'OK', { duration: 5000 });
      }
    });
  }

  // Método para rechazar una cita pendiente
  rechazarCita(cita: PSICOLOGOCitaResponseDTO): void {
    this.psicologoService.cambiarEstadoCita(cita.citaId, 'Rechazada').subscribe({
      next: () => {
        this.snackBar.open('❌ Cita rechazada', 'OK', { duration: 3000 });
        this.CargarListas();
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error al rechazar la cita';
        this.snackBar.open(`❌ ERROR: ${mensaje}`, 'OK', { duration: 5000 });
      }
    });
  }

  // Método para abrir el diálogo de atención (solo para citas confirmadas o programadas)
  openAtenderDialog(cita: PSICOLOGOCitaResponseDTO): void {
    // Validar que la cita esté confirmada o programada
    if (cita.estado !== 'Confirmada' && cita.estado !== 'Programada') {
      this.snackBar.open('⚠️ Solo se pueden atender citas confirmadas o programadas', 'OK', { duration: 3000 });
      return;
    }

    // Validar que la cita no sea futura
    if (this.esFuturo(cita.fechaHoraCita)) {
      this.snackBar.open('⚠️ Solo se pueden atender citas del día actual o pasadas', 'OK', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(AtenderCitaComponent, {
      width: '600px',
      data: { cita: cita }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('✅ Cita finalizada y hallazgos guardados', 'OK', { duration: 3000 });
        this.CargarListas();
      }
    });
  }

  // Función auxiliar para verificar si una fecha es futura (mayor a hoy)
  esFuturo(fecha: string | Date): boolean {
    const fechaCita = new Date(fecha);
    const hoy = new Date();

    // Resetear horas para comparar solo fechas (sin hora)
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);

    // Retorna true si la fecha de la cita es mayor a hoy (futuro)
    return fechaCita > hoy;
  }

  // Método auxiliar para verificar si una cita puede ser atendida (día actual o pasado)
  puedeAtender(cita: PSICOLOGOCitaResponseDTO): boolean {
    if (cita.estado !== 'Confirmada' && cita.estado !== 'Programada') {
      return false;
    }

    // La cita puede ser atendida si NO es futura (es de hoy o pasada)
    return !this.esFuturo(cita.fechaHoraCita);
  }

  openDetailsDialog(cita: PSICOLOGOCitaResponseDTO): void {
    // Reutilizamos el diálogo de "DetalleCita" que creamos para el Padre
    this.dialog.open(DetalleCitaComponent, {
      width: '600px',
      data: cita
    });
  }
}
