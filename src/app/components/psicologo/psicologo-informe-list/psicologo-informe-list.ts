import { Component, OnInit } from '@angular/core';
// Importa todos los m贸dulos de Material y Angular necesarios
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para el (change)
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PsicologoService } from '../../../services/psicologo.service';
import { PSICOLOGOInformeDTO } from '../../../models/psicologo-informe.dto';
import { ADMINAsignacionDTO } from '../../../models/admin-asignacion.dto';
import { AddInformeComponent } from '../add-informe/add-informe';

@Component({
  selector: 'app-psicologo-informe-list',
  standalone: true, // <-- CAMBIADO A TRUE
  imports: [ // <-- A脩ADIDO ARRAY DE IMPORTS
    CommonModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './psicologo-informe-list.html',
  styleUrls: ['./psicologo-informe-list.css']
})
export class PsicologoInformeListComponent implements OnInit {

  displayedColumns: string[] = ['fecha', 'paciente', 'resumen', 'acciones'];
  dsInformes = new MatTableDataSource<PSICOLOGOInformeDTO>();

  // Lista de pacientes (asignaciones activas con nombres enriquecidos)
  pacientes: ADMINAsignacionDTO[] = [];
  asignacionSeleccionadaId: number | null = null;

  constructor(
    private psicologoService: PsicologoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.CargarPacientes();
  }

  // Cargar pacientes usando el servicio autorizado del psicólogo
  CargarPacientes(): void {
    this.psicologoService.getMisAsignaciones().subscribe({
      next: (data) => {
        // Filtrar solo asignaciones activas
        this.pacientes = data.filter(a => a.estado === 'Activa');
        
        // Si hay pacientes, seleccionamos el primero por defecto
        if (this.pacientes.length > 0) {
          this.asignacionSeleccionadaId = this.pacientes[0].asignacionId;
          this.CargarInformes();
        } else {
          this.dsInformes = new MatTableDataSource<PSICOLOGOInformeDTO>([]);
        }
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
        this.snackBar.open('Error al cargar pacientes. Por favor, intente nuevamente.', 'OK', { duration: 5000 });
        this.pacientes = [];
        this.dsInformes = new MatTableDataSource<PSICOLOGOInformeDTO>([]);
      }
    });
  }

  // Cuando se cambia la selección de paciente
  onPacienteChange(): void {
    this.CargarInformes();
  }

  CargarInformes(): void {
    if (!this.asignacionSeleccionadaId) {
      // 馃憞 隆CORRECCI脫N AQU脥! (L铆nea 61)
      this.dsInformes = new MatTableDataSource<PSICOLOGOInformeDTO>([]);
      return;
    }

    this.psicologoService.getInformesPorAsignacion(this.asignacionSeleccionadaId).subscribe({
      next: (data) => {
        this.dsInformes = new MatTableDataSource(data);
      },
      error: (err) => {
        // 馃憞 隆CORRECCI脫N AQU脥! (L铆nea 70)
        this.dsInformes = new MatTableDataSource<PSICOLOGOInformeDTO>([]);
        this.snackBar.open(`Error al cargar informes: ${err.error?.message || 'Error'}`, 'OK');
      }
    });
  }

  openAddDialog(): void {
    if (!this.asignacionSeleccionadaId) {
      this.snackBar.open('Debe seleccionar un paciente primero', 'OK');
      return;
    }

    const dialogRef = this.dialog.open(AddInformeComponent, {
      width: '600px',
      data: { asignacionId: this.asignacionSeleccionadaId } // Pasamos el ID de la asignaci贸n
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.CargarInformes(); // Recargamos la lista
      }
    });
  }

  // Descargar PDF del informe
  descargarPDF(informe: PSICOLOGOInformeDTO): void {
    if (!informe.informeId) {
      this.snackBar.open('Error: ID de informe no disponible', 'OK', { duration: 3000 });
      return;
    }

    this.psicologoService.descargarInformePdf(informe.informeId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe_Clinico_${informe.informeId}_${informe.nombreMenor || 'paciente'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.snackBar.open('PDF descargado exitosamente', 'OK', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error al descargar PDF:', err);
        this.snackBar.open(`Error al descargar PDF: ${err.error?.message || 'Error desconocido'}`, 'OK', { duration: 5000 });
      }
    });
  }
  
  // No hay delete ni edit en el backend para informes desde el psic贸logo.
}
