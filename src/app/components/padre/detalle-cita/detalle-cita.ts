import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PADRECitaResponseDTO } from '../../../models/padre-cita-response.dto';
import { PSICOLOGOCitaResponseDTO } from '../../../models/psicologo-cita-response.dto';

// Módulos necesarios para la plantilla HTML
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Tipo unión para aceptar ambos DTOs
type CitaDTO = PADRECitaResponseDTO | PSICOLOGOCitaResponseDTO;

@Component({
  selector: 'app-detalle-cita',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './detalle-cita.html',
  styleUrls: ['./detalle-cita.css']
})
export class DetalleCitaComponent {
  
  cita: CitaDTO;
  
  constructor(
    public dialogRef: MatDialogRef<DetalleCitaComponent>,
    @Inject(MAT_DIALOG_DATA) data: CitaDTO
  ) {
    this.cita = data;
  }

  // Métodos auxiliares para acceder a los campos de forma unificada
  getNombreMenor(): string {
    return 'nombreCompletoMenor' in this.cita 
      ? this.cita.nombreCompletoMenor 
      : this.cita.nombreMenor;
  }

  getFecha(): string {
    return 'fechaHoraCita' in this.cita 
      ? this.cita.fechaHoraCita 
      : this.cita.fecha;
  }

  getHora(): string {
    if ('fechaHoraCita' in this.cita) {
      // Para PSICOLOGOCitaResponseDTO, la hora está en fechaHoraCita
      // El pipe date en el HTML manejará la extracción de la hora
      return '';
    }
    return this.cita.horaInicio || '';
  }

  getMotivo(): string {
    return 'motivoCita' in this.cita 
      ? this.cita.motivoCita 
      : this.cita.motivo;
  }

  getNombrePsicologo(): string {
    return this.cita.nombrePsicologo;
  }

  getHallazgos(): string {
    return this.cita.hallazgos || '';
  }

  getEstado(): string {
    return this.cita.estado;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
