import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ADMINCitaListDTO } from '../../../models/admin-cita-list.dto';

// Módulos necesarios para la plantilla HTML
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-detalle-cita-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './detalle-cita-dialog.html',
  styleUrls: ['./detalle-cita-dialog.css']
})
export class DetalleCitaDialogComponent {
  
  cita: ADMINCitaListDTO;

  constructor(
    public dialogRef: MatDialogRef<DetalleCitaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.cita = data || {};
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Métodos helper para acceder a los datos de forma segura
  getFecha(): string {
    return this.cita?.fecha || '';
  }

  getHoraInicio(): string {
    if (!this.cita?.horaInicio) return '-';
    return this.cita.horaInicio.substring(0, 5);
  }

  getHoraFin(): string {
    if (!this.cita?.horaFin) return '-';
    return this.cita.horaFin.substring(0, 5);
  }

  getRangoHoras(): string {
    const inicio = this.getHoraInicio();
    const fin = this.getHoraFin();
    return `${inicio} - ${fin}`;
  }

  getEstado(): string {
    return this.cita?.estado || 'Sin estado';
  }

  getEstadoClass(): string {
    const estado = this.getEstado().toLowerCase();
    switch (estado) {
      case 'programada':
      case 'confirmada':
        return 'nk-badge--success';
      case 'cancelada':
      case 'rechazada':
        return 'nk-badge--danger';
      case 'finalizada':
      case 'completada':
        return 'nk-badge--info';
      case 'pendiente':
        return 'nk-badge--warn';
      default:
        return 'nk-badge';
    }
  }

  getMotivo(): string {
    return this.cita?.motivo || 'Sin motivo especificado';
  }

  getNombrePsicologo(): string {
    return this.cita?.nombrePsicologo || 'No especificado';
  }

  getNombreMenor(): string {
    return this.cita?.nombreMenor || 'No especificado';
  }

  getNombrePadre(): string {
    return this.cita?.nombrePadre || 'No especificado';
  }
}

