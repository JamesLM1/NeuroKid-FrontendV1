import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PadreService } from '../../../services/padre.service';
import { PADREEvaluacionPsicologoDTO } from '../../../models/padre-evaluacion-psicologo.dto';

@Component({
    selector: 'app-evaluar-cita-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatSnackBarModule
    ],
    templateUrl: './evaluar-cita-dialog.html',
    styleUrls: ['./evaluar-cita-dialog.css']
})
export class EvaluarCitaDialogComponent {

    puntaje: number = 0;
    comentario: string = '';
    hoverPuntaje: number = 0;

    constructor(
        public dialogRef: MatDialogRef<EvaluarCitaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            citaId: number,
            nombrePsicologo: string,
            readOnly?: boolean,
            evaluacion?: PADREEvaluacionPsicologoDTO
        },
        private padreService: PadreService,
        private snackBar: MatSnackBar
    ) {
        if (this.data.readOnly && this.data.evaluacion) {
            this.puntaje = this.data.evaluacion.puntaje;
            this.comentario = this.data.evaluacion.comentario;
        }
    }

    setRating(rating: number): void {
        if (this.data.readOnly) return;
        this.puntaje = rating;
    }

    setHoverRating(rating: number): void {
        if (this.data.readOnly) return;
        this.hoverPuntaje = rating;
    }

    clearHoverRating(): void {
        this.hoverPuntaje = 0;
    }

    enviarEvaluacion(): void {
        if (this.puntaje === 0) {
            this.snackBar.open('Por favor, selecciona una calificación.', 'Cerrar', { duration: 3000 });
            return;
        }

        const evaluacion: PADREEvaluacionPsicologoDTO = {
            evaluacionId: 0,
            padreId: 0, // Se asigna en el backend
            psicologoId: 0, // Se asigna en el backend basado en la cita
            puntaje: this.puntaje,
            comentario: this.comentario,
            fechaEvaluacion: new Date().toISOString()
        };

        this.padreService.evaluarPsicologoPorCita(this.data.citaId, evaluacion).subscribe({
            next: (res) => {
                this.snackBar.open('¡Gracias por tu evaluación!', 'Cerrar', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error('Error al enviar evaluación:', err);
                this.snackBar.open('Error al enviar la evaluación.', 'Cerrar', { duration: 3000 });
            }
        });
    }

    cancelar(): void {
        this.dialogRef.close(false);
    }
}
