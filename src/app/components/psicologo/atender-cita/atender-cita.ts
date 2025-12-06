import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PsicologoService } from '../../../services/psicologo.service';
import { PSICOLOGOCitaResponseDTO } from '../../../models/psicologo-cita-response.dto';

// Módulos necesarios para la plantilla HTML
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-atender-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './atender-cita.html',
  styleUrls: ['./atender-cita.css']
})
export class AtenderCitaComponent implements OnInit {

  atenderForm!: FormGroup;
  cita: PSICOLOGOCitaResponseDTO;

  constructor(
    private fb: FormBuilder,
    private psicologoService: PsicologoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AtenderCitaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { cita: PSICOLOGOCitaResponseDTO }
  ) {
    this.cita = data.cita;
  }

  ngOnInit(): void {
    this.atenderForm = this.fb.group({
      observaciones: ['', Validators.required],
      diagnostico: ['', Validators.required],
      planTratamiento: ['', Validators.required]
    });
  }

  Grabar(): void {
    if (this.atenderForm.invalid) {
      this.atenderForm.markAllAsTouched(); // Para mostrar errores
      return;
    }

    const data = {
      observaciones: this.atenderForm.value.observaciones,
      diagnostico: this.atenderForm.value.diagnostico,
      planTratamiento: this.atenderForm.value.planTratamiento
    };

    this.psicologoService.finalizarCita(this.cita.citaId, data).subscribe({
      next: (res) => {
        this.snackBar.open('Ficha clínica guardada y cita finalizada.', 'OK', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => this.snackBar.open(`ERROR: ${err.error?.message || 'Error al finalizar la cita'}`, 'OK')
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}